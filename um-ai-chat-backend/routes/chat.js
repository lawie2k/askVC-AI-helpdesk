const express = require("express");
const { searchDatabase, extractRoomNumber, extractDepartmentFromQuestion } = require("../services/ai-search");
const AIService = require("../services/ai-service");

const router = express.Router();
const aiService = new AIService();

// ============================================================================
// AI CHAT ENDPOINT - Main AI functionality for users
// ============================================================================

// Main AI chat endpoint - combines database search with AI processing
router.post("/ask", async (req, res) => {
  const { question } = req.body;
  console.log(`🤖 AI Chat request: "${question}"`);

  try {
    if (typeof question === 'string' && question.trim().toLowerCase() === 'miss mo') {
      return res.json({ answer: 'Opo 😢' });
    }

    // ========================================================================
    // DATABASE SEARCH - Find relevant information
    // ========================================================================
    console.log('🔍 Searching database for relevant information...');
    const targetRoomNumber = extractRoomNumber(question);
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

${dbContext}`;

    // Try AI service first (with timeout protection)
    if (aiService.isAvailable()) {
      try {
        console.log('🤖 Generating AI response...');
        const answer = await aiService.generateResponse(systemPrompt, question);
        console.log('✅ AI response generated successfully');
        return res.json({ answer });
      } catch (aiErr) {
        console.warn('⚠️ AI service failed, falling back to database response:', aiErr.message);
        // Continue to fallback below
      }
    } else {
      console.log('⚠️ AI service not available, using database fallback');
    }

    // ========================================================================
    // FALLBACK RESPONSE - Generate response from database results only
    // ========================================================================
    console.log('📝 Generating fallback response from database...');
    const first = dbResults[0];
    const profSlice = (dbResults || []).find(r => r.table === 'professors');
    let fallback = "I couldn't find specific info in the database right now. Please try rephrasing your question.";

    if (profSlice && Array.isArray(profSlice.data) && profSlice.data.length > 0) {
      const sample = profSlice.data.slice(0, 5);
      const dept = extractDepartmentFromQuestion(question);
      const names = sample.map(p => p.name).filter(Boolean).join(', ');
      fallback = dept ? `Some professors in ${dept}: ${names}` : `Some professors: ${names}`;
    } else if (first && Array.isArray(first.data) && first.data.length > 0) {
      const sample = first.data.slice(0, 2);
      if (first.table === "rules") {
        fallback = `Here are some rules I found: ${sample.map(r => r.description).filter(Boolean).join(" | ")}`;
      } else if (first.table === "buildings") {
        fallback = `Buildings on campus: ${sample.map(b => b.name).filter(Boolean).join(", ")}`;
      } else if (first.table === "offices") {
        const officeInfo = sample.map(o => {
          const building = o.building_name || 'Unknown Building';
          const floor = o.floor || 'Unknown Floor';
          return `${o.name}: ${building} ${floor}`;
        }).join(" | ");
        fallback = `Office locations: ${officeInfo}`;
      } else if (first.table === "rooms") {
        if (targetRoomNumber) {
          // Specific room query
          const room = sample.find(r => r.name && r.name.includes(targetRoomNumber));
          if (room) {
            const building = room.building_name || 'Unknown Building';
            const floor = room.floor || 'Unknown Floor';
            fallback = `Room ${room.name} is located in ${building} on ${floor}`;
          } else {
            fallback = `Room ${targetRoomNumber} not found in the database.`;
          }
        } else {
          // General rooms query
          const roomsAvail = sample.map(r => `${r.name || 'Room'}: ${r.status || 'Vacant'}`).join(" | ");
          fallback = `Rooms status: ${roomsAvail}`;
        }
      } else {
        fallback = `I found some info in ${first.table}.`;
      }
    }
    
    console.log('✅ Fallback response generated');
    return res.json({ answer: fallback });
    
  } catch (error) {
    console.error("❌ Error in AI chat endpoint:", error);
    res.status(500).json({
      answer: "Sorry, I'm having trouble processing your request. Please try again.",
    });
  }
});

module.exports = router;

