const express = require("express");
const { searchDatabase } = require("../services/ai-search");
const AIService = require("../services/ai-service");

const router = express.Router();
const aiService = new AIService();

// ============================================================================
// AI CHAT ENDPOINT - Main AI functionality for users
// ============================================================================

// combines database search with AI processing
router.post("/ask", async (req, res) => {
  const { question } = req.body;
  console.log(`🤖 AI Chat request: "${question}"`);

  try {

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

${dbContext}`;

    // Try AI service (with timeout protection)
    if (aiService.isAvailable()) {
      try {
        console.log('🤖 Generating AI response...');
        const answer = await aiService.generateResponse(systemPrompt, question);
        console.log('✅ AI response generated successfully');
        return res.json({ answer });
      } catch (aiErr) {
        console.warn('⚠️ AI service failed:', aiErr.message);
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

