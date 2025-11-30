const express = require("express");
const { searchDatabase, extractDepartmentFromQuestion } = require("../services/ai-search");
const AIService = require("../services/ai-service");
const prisma = require("../config/prismaClient");
const jwt = require("jsonwebtoken");

const router = express.Router();
const aiService = new AIService();

// Department head info used for class schedule/subject concerns.
// We prefer dynamic lookup from the professors table; these are just fallbacks.
const DEPARTMENT_HEAD_FALLBACKS = {
  BSIT: {
    name: "BSIT Department Head",
    email: "bsit.head@umindanao.edu.ph",
  },
  BSCS: {
    name: "BSCS Department Head",
    email: "bscs.head@umindanao.edu.ph",
  },
};

// ============================================================================
// CONVERSATION MEMORY - Store last Q&A per user session
// ============================================================================
const conversationMemory = new Map(); // key: userIdentifier, value: { question, answer }

function getUserIdentifier(req) {
  // Use IP address as identifier (or could use user ID if authenticated)
  return req.ip || req.connection.remoteAddress || 'anonymous';
}

function getLastConversation(userId) {
  return conversationMemory.get(userId) || null;
}

function saveConversation(userId, question, answer) {
  conversationMemory.set(userId, { question, answer });
  // Optional: limit memory size to prevent memory leaks
  if (conversationMemory.size > 1000) {
    const firstKey = conversationMemory.keys().next().value;
    conversationMemory.delete(firstKey);
  }
}

// Check for inappropriate/racist content
function containsInappropriateContent(question) {
  const lowerQuestion = question.toLowerCase();
  
  // Common racist slurs and inappropriate terms (basic list - can be expanded)
  const inappropriateTerms = [
    'n-word', 'n word', // avoiding explicit terms
    'racist', 'racism',
    // Add more terms as needed
  ];
  
  // Check for hate speech patterns
  const hatePatterns = [
    /all\s+\w+\s+are/i,
    /\w+\s+should\s+die/i,
    /\w+\s+are\s+inferior/i,
  ];
  
  // Check against inappropriate terms
  for (const term of inappropriateTerms) {
    if (lowerQuestion.includes(term)) {
      return true;
    }
  }
  
  // Check against hate patterns
  for (const pattern of hatePatterns) {
    if (pattern.test(question)) {
      return true;
    }
  }
  
  return false;
}

// Helper to extract user ID from token (optional auth)
async function getUserIdFromToken(req) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded?.sub || decoded?.id;
    
    if (!userId) return null;
    
    // Verify user exists
    const user = await prisma.users.findUnique({
      where: { id: Number(userId) },
      select: { id: true },
    });
    
    return user ? user.id : null;
  } catch (error) {
    return null; // Invalid token, but don't block the request
  }
}

// ============================================================================
// AI CHAT ENDPOINT - Main AI functionality for users
// ============================================================================

// combines database search with AI processing
router.post("/ask", async (req, res) => {
  const { question } = req.body;
  console.log(`🤖 AI Chat request: "${question}"`);

  // Check for inappropriate/racist content before processing
  if (containsInappropriateContent(question)) {
    return res.json({ answer: "we dont tolorate racism here" });
  }

  try {
    // Get user identifier for conversation memory
    const userId = getUserIdentifier(req);
    const lastConv = getLastConversation(userId);

    // ======================================================================
    // SPECIAL HANDLING: Class schedule / subject concerns
    // ======================================================================
    const maybeClassConcern = isClassScheduleConcern(question);
    if (maybeClassConcern) {
      // Try to detect department from the question itself
      let deptKey = extractDepartmentFromQuestion(question);

      // If not found, try last conversation answer/question
      if (!deptKey && lastConv) {
        deptKey =
          extractDepartmentFromQuestion(lastConv.answer || "") ||
          extractDepartmentFromQuestion(lastConv.question || "");
      }

      if (!deptKey) {
        // Ask follow-up for their department
        return res.json({
          answer:
            "For concerns about your class schedule or subjects, it's best to talk directly to your department head. What is your department (for example, BSIT or BSCS)?",
        });
      }

      const head = await getDepartmentHeadInfo(deptKey);
      if (!head) {
        return res.json({
          answer:
            "For concerns about your class schedule or subjects, please go to your department head. I don't have the exact contact details yet.",
        });
      }

      const answer = `For concerns about your class schedule or subjects, please go to your ${deptKey} department head. Their contact is ${head.name} (${head.email}).`;

      // Save simple conversation context so follow-ups still work
      saveConversation(userId, question, answer);

      // Also save to history if user is authenticated
      const authenticatedUserId = await getUserIdFromToken(req);
      if (authenticatedUserId) {
        try {
          await prisma.historyChats.create({
            data: {
              user_id: authenticatedUserId,
              question,
              answer,
            },
          });
        } catch (dbErr) {
          console.error("⚠️ Failed to save chat history (class concern):", dbErr.message);
        }
      }

      return res.json({ 
        answer,
        images: imageUrls.length > 0 ? imageUrls : undefined,
      });
    }

    // ========================================================================
    // DATABASE SEARCH - Find relevant information
    // ========================================================================
    console.log('🔍 Searching database for relevant information...');
    const dbResults = await searchDatabase(question);

    // ========================================================================
    // PREPARE AI CONTEXT - Format database results for AI
    // ========================================================================
    let dbContext = "";
    const imageUrls = []; // Collect image URLs from rooms and offices
    
    if (dbResults.length > 0) {
      console.log(`📊 Found ${dbResults.length} relevant database results`);
      dbContext = "\n\nRelevant information from UM Visayan Campus database:\n";
      dbResults.forEach((result) => {
        dbContext += `\nFrom ${result.table} table:\n`;
        result.data.forEach((item) => {
          dbContext += `- ${JSON.stringify(item, null, 2)}\n`;
          // Extract image URLs from rooms and offices
          if ((result.table === "rooms" || result.table === "offices") && item.image_url) {
            imageUrls.push({
              url: item.image_url,
              name: item.name || "Image",
              type: result.table === "rooms" ? "room" : "office",
            });
          }
        });
      });
      const timeGuidance = await generateTimeAwareGuidance(dbResults);
      if (timeGuidance) {
        dbContext += `\nTime-aware guidance:\n${timeGuidance}\n`;
      }
    } else {
      console.log('📊 No specific database information found');
      dbContext = "\n\nNo specific information found in the database for this question.";
    }

    // ========================================================================
    // CONVERSATION MEMORY - Include last Q&A if available
    // ========================================================================
    let conversationContext = "";
    if (lastConv) {
      conversationContext = `\n\nPrevious conversation context:
User asked: "${lastConv.question}"
You answered: "${lastConv.answer}"

The user may be asking a follow-up question. Use the previous context to understand what "it", "that", "there", etc. refers to.`;
      console.log(`💭 Including conversation memory: "${lastConv.question}" -> "${lastConv.answer}"`);
    }

    // ========================================================================
    // AI PROCESSING - Generate intelligent response
    // ========================================================================
    const systemPrompt = `You are a dynamic and helpful AI assistant for UM Visayan Campus. Be engaging and conversational while keeping responses concise.

IMPORTANT INSTRUCTIONS:
- Use the database information as your source of truth
- Be dynamic and engaging in your responses
- Keep answers short and to the point (1-2 sentences max)
- Use emojis and friendly language appropriately
- Show personality while being helpful
- Don't add unnecessary details or long explanations
- Be conversational but brief
- Don't answer questions that are not related to UM Visayan Campus topics
- After answering, suggest simple smart follow-ups when helpful, like "Do you want directions from your building?" or "Do you want to see office hours?" (keep it to 1 follow-up line)
- If the database includes image_url for rooms or offices, images will be automatically shown to the user - you don't need to mention them in your response
- answer art laurence siojo, erhyl dhee toraja, george sangil, willge mahinay if
 question is about who is the developer of this app or project
- Remember the previous conversation context when the user asks follow-up questions like "where is it?" or "tell me more"
-if they ask for where is the fire exit in the main building it is beside the comlab V2 in the 2nd floor
and for the 3rd floor it is beside in AVR room
- when they ask where is the guard house it is in the entrance
- when they ask where is the motorcycle parking it is in the left side of the entrance walkway
- when they ask for the UM radio station building it is in the right side of the entrance
- when they ask for the LIC building it is in the left side of the campus
- when they ask for the school storage it is located in the left side of the entrance behind the guard house
- when they ask for the main Building it is in the right side of the campus
- when they ask for the for the faculty building it is in the left side end of the campus
- when they ask when will the new buildings be completed there is no data
- basketball court is in the middle of the campus
- all of the offices are half day always in weekends
- okay if there is a concern about class scedules or about there subjects or something related to it tell it too you can ask the department head and a follow up question what is my department

${dbContext}${conversationContext}`;

    // Try AI service (with timeout protection)
    if (aiService.isAvailable()) {
      try {
        console.log('🤖 Generating AI response...');
        const answer = await aiService.generateResponse(systemPrompt, question);
        console.log('✅ AI response generated successfully');
        
        // Save this conversation for next time (in-memory for backward compatibility)
        saveConversation(userId, question, answer);
        
        // Save to database if user is authenticated
        const authenticatedUserId = await getUserIdFromToken(req);
        if (authenticatedUserId) {
          try {
            await prisma.historyChats.create({
              data: {
                user_id: authenticatedUserId,
                question,
                answer,
              },
            });
            console.log('💾 Chat history saved to database');
          } catch (dbErr) {
            console.error('⚠️ Failed to save chat history:', dbErr.message);
            // Don't fail the request if DB save fails
          }
        }
        
        return res.json({ 
          answer,
          images: imageUrls.length > 0 ? imageUrls : undefined,
        });
      } catch (aiErr) {
        console.warn('⚠️ AI service failed:', aiErr.message);
        
        // Check if it's a content policy violation (racist/inappropriate content)
        const errorMessage = aiErr.message?.toLowerCase() || '';
        const errorBody = aiErr.body || aiErr.error || {};
        const errorCode = errorBody.code || errorBody.type || '';
        
        if (
          errorMessage.includes('content policy') ||
          errorMessage.includes('content_filter') ||
          errorMessage.includes('safety') ||
          errorMessage.includes('inappropriate') ||
          errorCode.includes('content_filter') ||
          errorCode.includes('content_policy')
        ) {
          return res.json({ 
            answer: "we dont tolorate racism here" 
          });
        }
        
        // Check if it's a timeout
        if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
          return res.json({ answer: "network error" });
        }
        
        // Generic error fallback
        return res.json({ answer: "network error" });
      }
    } else {
      console.log('⚠️ AI service not available');
      return res.json({ answer: "network error" });
    }
    
  } catch (error) {
    console.error("❌ Error in AI chat endpoint:", error);
    res.status(500).json({
      answer: "Sorry, I'm having trouble processing your request. Please try again.",
    });
  }
});

async function generateTimeAwareGuidance(dbResults) {
  const officeResult = dbResults.find((result) => result.table === "offices");
  if (!officeResult || !Array.isArray(officeResult.data) || officeResult.data.length === 0) {
    return "";
  }

  let defaults = {};
  try {
    const keys = [
      "default_office_open",
      "default_office_close",
      "default_lunch_start",
      "default_lunch_end",
    ];
    const entries = await prisma.settings.findMany({
      where: { key_name: { in: keys } },
    });
    defaults = entries.reduce((acc, entry) => {
      acc[entry.key_name] = entry.value;
      return acc;
    }, {});
  } catch (err) {
    console.error("⚠️ Failed to load schedule settings:", err.message);
  }

  return buildOfficeScheduleNarrative(officeResult.data, defaults);
}

function buildOfficeScheduleNarrative(offices, defaults) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const guidance = [];

  offices.slice(0, 5).forEach((office) => {
    // Sunday: all offices closed
    if (day === 0) {
      guidance.push(`• ${office.name}: closed today (offices are closed on Sundays).`);
      return;
    }

    // Base schedule from DB or defaults
    const schedule = {
      open: parseTimeToMinutes(office.open_time) ?? parseTimeToMinutes(defaults.default_office_open),
      close: parseTimeToMinutes(office.close_time) ?? parseTimeToMinutes(defaults.default_office_close),
      lunchStart:
        parseTimeToMinutes(office.lunch_start) ?? parseTimeToMinutes(defaults.default_lunch_start),
      lunchEnd:
        parseTimeToMinutes(office.lunch_end) ?? parseTimeToMinutes(defaults.default_lunch_end),
    };

    // Saturday: force half-day 7:00–12:00 regardless of stored schedule
    if (day === 6) {
      schedule.open = 7 * 60;
      schedule.close = 12 * 60;
    }

    if (!schedule.open || !schedule.close) {
      return;
    }

    const status = describeOfficeStatus(schedule, nowMinutes);
    if (status) {
      guidance.push(`• ${office.name}: ${status}`);
    }
  });

  return guidance.length ? guidance.slice(0, 3).join("\n") : "";
}

function describeOfficeStatus(schedule, nowMinutes) {
  const { open, close, lunchStart, lunchEnd } = schedule;

  if (nowMinutes < open) {
    const mins = open - nowMinutes;
    if (mins <= 90) {
      return `opens in ${formatMinutes(mins)} (opens at ${formatTimeLabel(open)}).`;
    }
    return `opens at ${formatTimeLabel(open)}.`;
  }

  if (nowMinutes >= close) {
    return `closed right now (operates until ${formatTimeLabel(close)}).`;
  }

  if (lunchStart && lunchEnd && nowMinutes >= lunchStart && nowMinutes < lunchEnd) {
    return `currently on lunch break until ${formatTimeLabel(lunchEnd)}, expect delays.`;
  }

  if (lunchStart && lunchEnd && nowMinutes < lunchStart && lunchStart - nowMinutes <= 30) {
    return `lunch break starts in ${formatMinutes(
      lunchStart - nowMinutes
    )} (${formatTimeLabel(lunchStart)} - ${formatTimeLabel(lunchEnd)}).`;
  }

  const minsUntilClose = close - nowMinutes;
  if (minsUntilClose <= 30) {
    return `closes in ${formatMinutes(minsUntilClose)} (closes at ${formatTimeLabel(close)}).`;
  }

  return `open until ${formatTimeLabel(close)} today.`;
}

function parseTimeToMinutes(value) {
  if (!value || typeof value !== "string") return null;
  const [hourStr, minuteStr] = value.split(":");
  const hours = Number(hourStr);
  const minutes = Number(minuteStr || "0");
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function formatTimeLabel(totalMinutes) {
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  const paddedMinutes = minutes.toString().padStart(2, "0");
  return `${hours12}:${paddedMinutes} ${suffix}`;
}

function formatMinutes(value) {
  if (value <= 1) return "1 minute";
  return `${value} minutes`;
}

function isClassScheduleConcern(text) {
  if (!text) return false;
  const q = text.toLowerCase();

  const keywords = [
    "class schedule",
    "class schedules",
    "my schedule",
    "my subjects",
    "my subject",
    "subjects",
    "enrollment",
    "enrolment",
    "pre-enrollment",
    "preregistration",
    "pre registration",
    "overload",
    "underload",
    "change subject",
    "change schedule",
    "subject conflict",
    "schedule conflict",
  ];

  return keywords.some((k) => q.includes(k));
}

async function getDepartmentHeadInfo(deptKey) {
  const key = (deptKey || "").toUpperCase();

  try {
    // Try to find a professor in this program/department whose position suggests "head"
    const headProfessor = await prisma.professors.findFirst({
      where: {
        OR: [
          { program: key },
          {
            departments: {
              short_name: key,
            },
          },
        ],
        position: {
          contains: "head",
          mode: "insensitive",
        },
      },
      select: {
        name: true,
        email: true,
      },
    });

    if (headProfessor) {
      return {
        name: headProfessor.name,
        email: headProfessor.email || "No email on record",
      };
    }
  } catch (err) {
    console.error("⚠️ Failed to load department head from professors:", err.message);
  }

  // Fallback to static config if no DB match
  if (DEPARTMENT_HEAD_FALLBACKS[key]) {
    return DEPARTMENT_HEAD_FALLBACKS[key];
  }

  return null;
}

module.exports = router;

