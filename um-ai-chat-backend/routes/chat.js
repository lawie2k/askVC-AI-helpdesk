const express = require("express");
const { searchDatabase, extractDepartmentFromQuestion } = require("../services/ai-search");
const AIService = require("../services/ai-service");
const prisma = require("../config/prismaClient");
const jwt = require("jsonwebtoken");
const { fetchPdfContent } = require("../services/pdf-fetcher");

const router = express.Router();
const aiService = new AIService();

// Fallback department heads if we can't find them in the DB
const DEPARTMENT_HEAD_FALLBACKS = {
  BSIT: {
    name: "BSIT Department Head",
    email: "bsit.head@umindanao.edu.ph",
  },
  BSCS: {
    name: "BSCS Department Head",
    email: "bscs.head@umindanao.edu.ph",
  },
  BSCE: {
    name: "BSCE Department Head",
    email: "bsce.head@umindanao.edu.ph",
  },
};

// Keep track of user's last question/answer for context
const conversationMemory = new Map(); // key: userIdentifier, value: { question, answer }

function getUserIdentifier(req) {
  // Use IP as user ID for now
  return req.ip || req.connection.remoteAddress || 'anonymous';
}

function getLastConversation(userId) {
  return conversationMemory.get(userId) || null;
}

function saveConversation(userId, question, answer) {
  conversationMemory.set(userId, { question, answer });
  // Keep memory size down
  if (conversationMemory.size > 1000) {
    const firstKey = conversationMemory.keys().next().value;
    conversationMemory.delete(firstKey);
  }
}

// Block racist or inappropriate questions
function containsInappropriateContent(question) {
  const lowerQuestion = question.toLowerCase();

  const inappropriateTerms = [
    'n-word', 'n word', // avoiding explicit terms
    'racist', 'racism',
  ];

  const hatePatterns = [
    /all\s+\w+\s+are/i,
    /\w+\s+should\s+die/i,
    /\w+\s+are\s+inferior/i,
  ];

  for (const term of inappropriateTerms) {
    if (lowerQuestion.includes(term)) {
      return true;
    }
  }

  for (const pattern of hatePatterns) {
    if (pattern.test(question)) {
      return true;
    }
  }

  return false;
}

// Get user ID from JWT token if logged in
async function getUserIdFromToken(req) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded?.sub || decoded?.id;

    if (!userId) return null;

    // Update user's last active time
    const user = await prisma.users.update({
      where: { id: Number(userId) },
      data: { last_active_at: new Date() },
      select: { id: true },
    });

    return user?.id ?? null;
  } catch (error) {
    return null; // Bad token, but keep going
  }
}

// Main chat endpoint - handles AI questions
router.post("/ask", async (req, res) => {
  const { question } = req.body;
  console.log(`🤖 AI Chat request: "${question}"`);

  // Block racist stuff
  if (containsInappropriateContent(question)) {
    return res.json({ answer: "we dont tolorate racism here" });
  }

  try {
    // Get user identifier for conversation memory
    const userId = getUserIdentifier(req);
    const lastConv = getLastConversation(userId);
    
    // Initialize imageUrls early (used in early returns)
    const imageUrls = [];

    // Handle department head questions
    const isDepartmentHeadQuestion = isDepartmentHeadQuery(question);
    if (isDepartmentHeadQuestion) {
      // Figure out which department they're asking about
      let deptKey = extractDepartmentFromQuestion(question);

      // Check previous conversation if we don't know
      if (!deptKey && lastConv) {
        deptKey =
          extractDepartmentFromQuestion(lastConv.answer || "") ||
          extractDepartmentFromQuestion(lastConv.question || "");
      }
      
      if (deptKey) {
        const head = await getDepartmentHeadInfo(deptKey);
        if (head) {
          const answer = `The ${deptKey} department head is ${head.name}${head.email && head.email !== "No email on record" ? ` (${head.email})` : ""}.`;

          saveConversation(userId, question, answer);
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
              console.error("⚠️ Failed to save chat history (department head):", dbErr.message);
            }
          }
          
          return res.json({ 
            answer,
            images: imageUrls.length > 0 ? imageUrls : undefined,
          });
        } else {
          return res.json({
            answer: `I don't have the contact information for the ${deptKey} department head in my records. Please contact the department office directly.`,
          });
        }
      } else {
        // Ask which department
        return res.json({
          answer: "Which department are you asking about? (For example, BSIT, BSCS, or BSCE)",
        });
      }
    }

    // Handle class schedule or subject problems
    const maybeClassConcern = isClassScheduleConcern(question);
    if (maybeClassConcern) {
      // Figure out which department
      let deptKey = extractDepartmentFromQuestion(question);

      // Check previous conversation
      if (!deptKey && lastConv) {
        deptKey =
          extractDepartmentFromQuestion(lastConv.answer || "") ||
          extractDepartmentFromQuestion(lastConv.question || "");
      }

      if (!deptKey) {
        // Ask what department they're in
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

      // Save for context
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

    // ============================================================================
    // ROOM NAME PREPROCESSING - Handle abbreviations like r301 -> room 301
    // ============================================================================
    function preprocessRoomAbbreviations(question) {
      let processedQuestion = question;

      // Common room abbreviations: r301 -> room 301, r302 -> room 302, etc.
      const roomAbbreviations = [
        { abbr: /\br(\d{3,4})\b/gi, replace: 'room $1' },  // r301 -> room 301
        { abbr: /\brv(\d+)\b/gi, replace: 'rv $1' },       // rv2 -> rv 2
        { abbr: /\bcomlab\s*v?(\d+)\b/gi, replace: 'com lab v$1' }, // comlab1 -> com lab v1
        { abbr: /\bcomlab(\d+)\b/gi, replace: 'com lab v$1' },      // comlab1 -> com lab v1
      ];

      roomAbbreviations.forEach(({ abbr, replace }) => {
        processedQuestion = processedQuestion.replace(abbr, replace);
      });

      // Log if we made changes
      if (processedQuestion !== question) {
        console.log(`🔄 Preprocessed room query: "${question}" -> "${processedQuestion}"`);
      }

      return processedQuestion;
    }

    // Apply room abbreviation preprocessing
    const processedQuestion = preprocessRoomAbbreviations(question);

    // Search database for relevant info
    console.log('🔍 Searching database for relevant information...');
    const dbResults = await searchDatabase(processedQuestion);

    // Fetch IT subjects PDF if they're asking about BSIT courses
    let pdfContext = "";
    const questionLower = question.toLowerCase();

    const hasSubjectKeywords = questionLower.includes('subject') || questionLower.includes('subjects') ||
                               questionLower.includes('course') || questionLower.includes('courses') ||
                               questionLower.includes('curriculum') || questionLower.includes('offerings');
    const hasITKeywords = questionLower.includes('bsit') ||
                         questionLower.includes('information technology') ||
                         (questionLower.includes(' it ') || questionLower.endsWith(' it') ||
                          questionLower.startsWith('it ') || questionLower.includes(' it?')) ||
                         extractDepartmentFromQuestion(question) === 'BSIT';
    const isITSubjectsQuestion = hasSubjectKeywords && hasITKeywords;

    if (isITSubjectsQuestion) {
      try {
        console.log('📄 Question is about IT subjects, fetching PDF...');
        const bsitPdfUrl = "https://umindanao.edu.ph/files/eriao/bsit.pdf";
        const pdfResult = await fetchPdfContent(bsitPdfUrl);

        if (pdfResult.success && pdfResult.content) {
          pdfContext = `\n\nBSIT Course Offerings (from PDF):\n${pdfResult.content}\n`;
          console.log('✅ Successfully fetched IT subjects from PDF');
        } else {
          console.log('⚠️ Failed to fetch PDF content:', pdfResult.error);
        }
      } catch (pdfErr) {
        console.error('⚠️ Error fetching PDF:', pdfErr.message);
        // Keep going even if PDF fails
      }
    }

    // ========================================================================
    // PREPARE AI CONTEXT - Format database results for AI
    // ========================================================================
    let dbContext = "";
    // imageUrls already initialized above
    
    // Determine if question is specifically about rooms or offices
    // Exclude CR/comfort room/restroom from being treated as room questions
    const isCRQuestion = /\b(cr|comfort room|comfortroom|restroom|restrooms|toilet|toilets|bathroom|bathrooms)\b/i.test(question);
    const isRoomQuestion = !isCRQuestion && (
      /\b(room|rooms|classroom|comlab|laboratory|lab|rv|avr)\b/i.test(question) ||
      /\b(room\s*)?\d{3,4}\b/i.test(question) ||
      /\brv\s*\d+\b/i.test(question) ||
      /\bavr\b/i.test(question)
    );
    const isOfficeQuestion =
      /\b(office|offices|sao|student affairs|registrar|cashier|clinic|library|faculty|guidance)\b/i.test(
        question
      );
    
    if (dbResults.length > 0) {
      console.log(`📊 Found ${dbResults.length} relevant database results`);
      dbContext = "\n\nRelevant information from UM Visayan Campus database:\n";
      
      // Track the best match for images
      let bestRoomMatch = null;
      let bestOfficeMatch = null;
      
      // Group officers by organization for cleaner display
      const officersByOrg = {};
      const otherResults = [];
      
      dbResults.forEach((result) => {
        if (result.table === "officers") {
          result.data.forEach((item) => {
            const org = item.organization || "Other";
            if (!officersByOrg[org]) {
              officersByOrg[org] = [];
            }
            officersByOrg[org].push(item);
          });
        } else {
          otherResults.push(result);
        }
      });
      
      // Format officers by organization first
      if (Object.keys(officersByOrg).length > 0) {
        dbContext += `\nStudent Officers:\n`;
        Object.keys(officersByOrg).sort().forEach((org) => {
          dbContext += `\n${org}:\n`;
          officersByOrg[org].forEach((item) => {
            const officerInfo = [];
            if (item.name) officerInfo.push(item.name);
            if (item.position) officerInfo.push(`- ${item.position}`);
            
            if (officerInfo.length > 0) {
              dbContext += `  ${officerInfo.join(' ')}\n`;
            }
          });
        });
        dbContext += `\n`;
      }
      
      // Format other results
      otherResults.forEach((result) => {
        dbContext += `\nFrom ${result.table} table:\n`;

        result.data.forEach((item) => {
          // Give the AI a clearer, human-friendly summary for professors
          if (result.table === "professors") {
            const displayDept =
              item.program && item.program.trim()
                ? item.program.trim()
                : item.department && String(item.department).trim()
                ? String(item.department).trim()
                : null;

            const parts = [];
            if (item.name) parts.push(`Name: ${item.name}`);
            if (displayDept) parts.push(`Department: ${displayDept}`);
            if (item.position) parts.push(`Position: ${item.position}`);

            if (parts.length > 0) {
              dbContext += `- ${parts.join(" | ")}\n`;
            }
          }

          // Keep the raw JSON as fallback context for other tables
          dbContext += `- ${JSON.stringify(item, null, 2)}\n`;
          
    
          
          if (result.table === "rooms") {
            // Log when room is found
            console.log(`🔍 Room found in search: "${item.name}" (ID: ${item.id}, Image: ${item.image_url ? '✅' : '❌'}, Relevance: ${item.relevance_score || 'N/A'})`);

            // Simple logic: if it's a room question and room has valid image, show it
            if (isRoomQuestion && item.image_url && item.image_url.trim() !== '' && item.image_url !== 'null') {
              console.log(`📸 Adding room image: ${item.name}`);
              bestRoomMatch = {
                url: item.image_url.trim(),
                name: item.name || "Image",
                type: "room",
                relevance_score: 100
              };
            }
          }
          
          if (result.table === "offices") {
            // Simple logic: if it's an office question and office has valid image, show it
            if (isOfficeQuestion && item.image_url && item.image_url.trim() !== '' && item.image_url !== 'null') {
              console.log(`📸 Adding office image: ${item.name}`);
              bestOfficeMatch = {
                url: item.image_url.trim(),
                name: item.name || "Image",
                type: "office",
                relevance_score: 100
              };
            }
          }
        });
      });
      
      // Add selected images to response
      if (bestRoomMatch && bestRoomMatch.url) {
        console.log(`✅ Adding room image: ${bestRoomMatch.name}`);
        imageUrls.push(bestRoomMatch);
      }
      if (bestOfficeMatch && bestOfficeMatch.url) {
        console.log(`✅ Adding office image: ${bestOfficeMatch.name}`);
        imageUrls.push(bestOfficeMatch);
      }
      const timeGuidance = await generateTimeAwareGuidance(dbResults);
      if (timeGuidance) {
        dbContext += `\nTime-aware guidance:\n${timeGuidance}\n`;
      }
    } else {
      console.log('📊 No specific database information found');
      dbContext = "\n\nNo specific information found in the database for this question.";
    }

    // Add previous conversation for context
    let conversationContext = "";
    if (lastConv) {
      conversationContext = `\n\nPrevious conversation context:
User asked: "${lastConv.question}"
You answered: "${lastConv.answer}"

The user may be asking a follow-up question. Use the previous context to understand what "it", "that", "there", etc. refers to.`;
      console.log(`💭 Including conversation memory: "${lastConv.question}" -> "${lastConv.answer}"`);
    }

    // Generate AI response
    // Build the prompt with all our context
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
- When the user is asking about a specific person (for example a professor), do NOT ask them what their classes are. If you want to add a follow-up for a person, keep it simple like "Do you want more info about him?" or "Do you want more info about her?" instead of asking about their classes.
- CRITICAL: If the database includes image_url for rooms or offices, images will be automatically displayed to the user. You MUST NOT mention images, URLs, links, or any web addresses in your response.
- NEVER write URLs, links, or image addresses in your text. The system handles images automatically.
- DO NOT say things like "here is the image", "see the image at [URL]", "check this link", or any variation. Just answer the question normally as if images don't exist in your response.
- If you see image_url in the database context, ignore it completely in your response. Just provide the information about the room or office without mentioning images or URLs.
- answer art laurence siojo, erhyl dhee toraja, george sangil, willge mahinay if
 question is about who is the developer of this app or project
- Remember the previous conversation context when the user asks follow-up questions like "where is it?" or "tell me more"
-if they ask for where is the fire exit in the main building it is beside the comlab V2 in the 2nd floor
and for the 3rd floor it is beside in AVR room
- when they ask where is the guard house it is in the entrance
- when they ask where is the motorcycle parking it is in the left side of the entrance walkway
- when they ask for the UM radio station building it is in the right side of the entrance
- when they ask for the LIC building it is in the left side of the campus
- when they ask where is the canteen it is just in the hallway going to the main building
- when they ask for the school storage it is located in the left side of the entrance behind the guard house
- when they ask for the main Building it is in the right side of the campus
- when they ask for the for the faculty building it is in the left side end of the campus
- when they ask when will the new buildings be completed there is no data
- basketball court is in the middle of the campus
- all of the offices are half day always in weekends
- okay if there is a concern about class scedules or about there subjects or something related to it tell it too you can ask the department head and a follow up question what is my department
- restrooms or CR or cr is located beside RV4 and one is located beside the clinic or the center of health services there is beside the faculty
- if the input is clinic it is same with the center of health services
- if the input is comlab 1,2 or 3 it is same with Com Lab 1,2 or 3
- if the input is Audio Visual room it is same with AVR or room AVR
- if the input is LJ or lj it should point to the professor lowel jay orcullo
- if the input is buddy or sir buddy it should point to the professor benjamin mahinay jr.
- the school director of University of Mindanao Tagum College is Dr. Evelyn P. Saludes 
- ICT or the information and communication technology office is located behind the LIC building
- When answering questions about IT subjects, courses, or curriculum, use the information from the BSIT PDF document provided below. List the subjects clearly and provide course codes when available.
- IMPORTANT: When users ask "who is the head of [department]" or "who is the [department] head", ONLY provide the person whose position explicitly indicates they are the department head (e.g., "Department Head", "Chair", "Director"). Do NOT assume someone is the head just because they are a professor in that department. If the database doesn't show a clear department head, say you don't have that information rather than guessing.
- When displaying officers, format them neatly by organization. List officers in a clean, organized way grouped by their organization (e.g., CODES, CSIT, EESA). Use clear formatting with names and positions, like "John Doe - President" under each organization heading.
- um visayan or umvc is Located along Davao–Agusan National Highway, Brgy. Visayan Village, Tagum City, Davao del Norte, Philippines.
- the collaboration room can be seen inside the library room extension

${dbContext}${pdfContext}${conversationContext}`;

    // Call AI service if it's working
    if (aiService.isAvailable()) {
      try {
        console.log('🤖 Generating AI response...');
        let answer = await aiService.generateResponse(systemPrompt, question);
        console.log('✅ AI response generated successfully');
        
        // Clean up URLs and links from the answer
        answer = answer.replace(/https?:\/\/[^\s]+/gi, '').trim();
        answer = answer.replace(/(here is|see|view|check|link|url|image at|picture at)[\s:]*https?:\/\/[^\s]+/gi, '').trim();
        answer = answer.replace(/\[.*?\]\(https?:\/\/[^\)]+\)/gi, '').trim();
        answer = answer.replace(/\s+/g, ' ').trim();

        // If AI says it doesn't know, don't show random images
        const lowQualityIndicators = [
          "i don't have",
          "i don't know",
          "no information",
          "not available",
          "unavailable",
          "can't find",
          "couldn't find",
          "don't have that",
          "sorry, i don't"
        ];
        const answerLower = answer.toLowerCase();
        const isLowQualityAnswer = lowQualityIndicators.some(indicator => answerLower.includes(indicator));

        if (isLowQualityAnswer) {
          console.log(`⚠️ Low quality answer detected - clearing images to avoid showing random pictures`);
          imageUrls.length = 0;
        }
        
        // Save conversation for context
        saveConversation(userId, question, answer);

        // Save to DB if user is logged in
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
            // Don't break if DB fails
          }
        }
        
        return res.json({ 
          answer,
          images: imageUrls.length > 0 ? imageUrls : undefined,
        });
      } catch (aiErr) {
        console.warn('⚠️ AI service failed:', aiErr.message);

        // Check for content policy violations
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

        // Handle timeouts
        if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
          return res.json({ answer: "Sorry, I'm having trouble processing your question right now. Please try again in a moment." });
        }

        // Generic fallback
        return res.json({ answer: "Sorry, I don't have that information available right now. Please try asking a different question." });
      }
    } else {
      console.log('⚠️ AI service not available');
      return res.json({ answer: "Sorry, I'm currently unavailable. Please try again later." });
    }
    
  } catch (error) {
    console.error("❌ Error in AI chat endpoint:", error);
    return res.json({
      answer: "Sorry, I don't have that information available. Please try asking a different question.",
    });
  }
});

// Add time-aware guidance for offices (open/closed times)
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

// Build human-readable office status messages
function buildOfficeScheduleNarrative(offices, defaults) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const guidance = [];

  offices.slice(0, 5).forEach((office) => {
    // All offices closed on Sundays
    if (day === 0) {
      guidance.push(`• ${office.name}: closed today (offices are closed on Sundays).`);
      return;
    }

    // Get schedule from DB or use defaults
    const schedule = {
      open: parseTimeToMinutes(office.open_time) ?? parseTimeToMinutes(defaults.default_office_open),
      close: parseTimeToMinutes(office.close_time) ?? parseTimeToMinutes(defaults.default_office_close),
      lunchStart:
        parseTimeToMinutes(office.lunch_start) ?? parseTimeToMinutes(defaults.default_lunch_start),
      lunchEnd:
        parseTimeToMinutes(office.lunch_end) ?? parseTimeToMinutes(defaults.default_lunch_end),
    };

    // Saturdays are half-day
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

// Describe if office is open/closed based on current time
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

// Convert time string like "09:30" to minutes since midnight
function parseTimeToMinutes(value) {
  if (!value || typeof value !== "string") return null;
  const [hourStr, minuteStr] = value.split(":");
  const hours = Number(hourStr);
  const minutes = Number(minuteStr || "0");
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

// Format minutes to 12-hour time
function formatTimeLabel(totalMinutes) {
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  const suffix = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  const paddedMinutes = minutes.toString().padStart(2, "0");
  return `${hours12}:${paddedMinutes} ${suffix}`;
}

// Format minutes to readable text
function formatMinutes(value) {
  if (value <= 1) return "1 minute";
  return `${value} minutes`;
}

// Check if someone is complaining about their class schedule/subjects
function isClassScheduleConcern(text) {
  if (!text) return false;
  const q = text.toLowerCase();

  // Personal schedule concerns (not general questions)
  const personalKeywords = [
    "my schedule",
    "my subjects",
    "my subject",
    "my class schedule",
    "my enrollment",
    "my enrolment",
    "my pre-enrollment",
    "my preregistration",
    "my pre registration",
    "my overload",
    "my underload",
    "change my subject",
    "change my schedule",
    "my subject conflict",
    "my schedule conflict",
    "i want to change",
    "i need to change",
    "help me with my",
  ];

  const concernKeywords = [
    "enrollment concern",
    "enrolment concern",
    "schedule concern",
    "subject concern",
    "overload",
    "underload",
    "change subject",
    "change schedule",
    "subject conflict",
    "schedule conflict",
  ];

  const isPersonal = personalKeywords.some((k) => q.includes(k));
  const isConcern = concernKeywords.some((k) => q.includes(k));

  // Skip general info questions like "what are the subjects"
  const isInfoQuestion = /^(what|which|list|show|tell me|what are|what is|what's)/i.test(q.trim());

  return (isPersonal || isConcern) && !isInfoQuestion;
}

// Check if they're asking about department heads
function isDepartmentHeadQuery(question) {
  if (!question) return false;
  const q = question.toLowerCase();

  const headKeywords = ['head', 'chair', 'chairperson', 'director', 'leader', 'in charge'];
  const questionPatterns = [
    /who is (the )?(department )?head (of|for)/i,
    /who (is|are) (the )?head (of|for)/i,
    /(department )?head (of|for)/i,
    /who leads/i,
    /who (is|are) in charge (of|for)/i,
    /(who|what) (is|are) (the )?(department )?head/i,
  ];

  const hasHeadKeyword = headKeywords.some(keyword => q.includes(keyword));
  const matchesPattern = questionPatterns.some(pattern => pattern.test(question));

  // Must be asking about a specific department
  const hasDepartment = extractDepartmentFromQuestion(question) !== null;
  const hasDepartmentKeywords = /\b(department|program|dept)\b/i.test(question);

  return (hasHeadKeyword || matchesPattern) && (hasDepartment || hasDepartmentKeywords);
}

// Get department head info from database
async function getDepartmentHeadInfo(deptKey) {
  const key = (deptKey || "").toUpperCase();

  try {
    // Look for professors with department head positions
    const headPositions = [
      'department head',
      'dept head',
      'department chair',
      'dept chair',
      'chairperson',
      'department director',
      'dept director'
    ];

    const allProfessors = await prisma.professors.findMany({
      where: {
        OR: [
          { program: key },
          {
            departments: {
              short_name: key,
            },
          },
        ],
      },
      select: {
        name: true,
        email: true,
        position: true,
      },
    });

    // Find one with a head position
    for (const professor of allProfessors) {
      if (professor.position) {
        const positionLower = professor.position.toLowerCase();
        for (const headPos of headPositions) {
          if (positionLower.includes(headPos.toLowerCase())) {
            console.log(`✅ Found ${key} department head: ${professor.name} (${professor.position})`);
            return {
              name: professor.name,
              email: professor.email || "No email on record",
            };
          }
        }
      }
    }

    console.log(`⚠️ No department head found for ${key} in database`);
  } catch (err) {
    console.error("⚠️ Failed to load department head from professors:", err.message);
  }

  // Use fallback if DB doesn't have it
  if (DEPARTMENT_HEAD_FALLBACKS[key]) {
    console.log(`⚠️ Using fallback for ${key} department head`);
    return DEPARTMENT_HEAD_FALLBACKS[key];
  }

  return null;
}

module.exports = router;

