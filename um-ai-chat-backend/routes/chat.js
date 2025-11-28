const express = require("express");
const { searchDatabase } = require("../services/ai-search");
const AIService = require("../services/ai-service");
const prisma = require("../config/prismaClient");
const jwt = require("jsonwebtoken");

const router = express.Router();
const aiService = new AIService();

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

    // ========================================================================
    // DATABASE SEARCH - Find relevant information
    // ========================================================================
    console.log('🔍 Searching database for relevant information...');
    const dbResults = await searchDatabase(question);

    // ========================================================================
    // PREPARE AI CONTEXT - Format database results for AI
    // ========================================================================
    let dbContext = "";
    if (dbResults.length > 0) {
      console.log(`📊 Found ${dbResults.length} relevant database results`);
      dbContext = "\n\nRelevant information from UM Visayan Campus database:\n";
      dbResults.forEach((result) => {
        dbContext += `\nFrom ${result.table} table:\n`;
        result.data.forEach((item) => {
          dbContext += `- ${JSON.stringify(item, null, 2)}\n`;
        });
      });
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
- answer art laurence siojo, erhyl dhee toraja, george sangil, willge mahinay if
 question is about who is the developer of this app or project
- Remember the previous conversation context when the user asks follow-up questions like "where is it?" or "tell me more"
-if they ask for where is the fire exit in the main building it is beside the comlab V2 in the 2nd floor
and for the 3rd floor it is beside in AVR room
- when they ask where is the guard house it is in the entrance
- when they ask where is the motorcycle parking it is in the left side of the entrance walkway
- when they ask for the UM radio station building it is in the right side of the entrance
- when they ask for the LIC building it is in the left side of the campus
- when they ask for the main Building it is in the right side of the campus
- when they ask for the for the faculty building it is in the left side end of the campus
- when they ask when will the new buildings be completed there is no data for that but maybe next school year

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
        
        return res.json({ answer });
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

module.exports = router;

