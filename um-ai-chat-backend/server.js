const express = require("express");
const cors = require("cors");
const ModelClient = require("@azure-rest/ai-inference").default;
const { isUnexpected } = require("@azure-rest/ai-inference");
const { AzureKeyCredential } = require("@azure/core-auth");
const db = require("./database");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize GitHub AI
const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4o";

const client = ModelClient(endpoint, new AzureKeyCredential(token));

// Function to search database for relevant information
async function searchDatabase(question) {
  return new Promise((resolve) => {
    const searchResults = [];
    let completedSearches = 0;

    // Tables to search
    const tablesToSearch = [
      "departments",
      "professors",
      "rooms",
      "offices",
      "rules",
      "settings",
    ];

    if (tablesToSearch.length === 0) {
      resolve(searchResults);
      return;
    }

    tablesToSearch.forEach((table) => {
      // Search in all text columns of each table
      const query = `SELECT * FROM ${table} WHERE 
        CONCAT_WS(' ', ${getSearchableColumns(table)}) LIKE ?`;

      const searchTerm = `%${question.toLowerCase()}%`;

      db.query(query, [searchTerm], (err, results) => {
        if (!err && results.length > 0) {
          searchResults.push({
            table: table,
            data: results,
          });
        }

        completedSearches++;
        if (completedSearches === tablesToSearch.length) {
          resolve(searchResults);
        }
      });
    });
  });
}

// Helper function to get searchable columns for each table
function getSearchableColumns(table) {
  const columnMap = {
    departments: "name, description, head, location",
    professors: "name, department, email, specialization, office",
    rooms: "room_number, building, floor, capacity, type, description",
    rules: "title, description, category, content",
    settings: "setting_name, setting_value, description",
  };

  return columnMap[table] || "name, description";
}

// Test route
app.get("/", (req, res) => {
  res.send("UM AI Helpdesk Backend is running 🚀");
});

// AI ask route with database search + GitHub AI
app.post("/ask", async (req, res) => {
  const { question } = req.body;

  try {
    // First, search the database for relevant information
    console.log("🔍 Searching database for:", question);
    const dbResults = await searchDatabase(question);

    // Prepare database context for AI
    let dbContext = "";
    if (dbResults.length > 0) {
      dbContext = "\n\nRelevant information from UM Visayan Campus database:\n";
      dbResults.forEach((result) => {
        dbContext += `\nFrom ${result.table} table:\n`;
        result.data.forEach((item) => {
          dbContext += `- ${JSON.stringify(item, null, 2)}\n`;
        });
      });
    } else {
      dbContext =
        "\n\nNo specific information found in the database for this question.";
    }

    // Create enhanced system prompt with database context
    const systemPrompt = `You are a helpful AI assistant for UM Visayan Campus. Answer questions about the university in a friendly and informative way. Use the database information provided when relevant to give accurate answers. Don't answer questions that are not related to UM Visayan Campus topics. If someone just says "miss mo", respond with "Opo 😢" in a sad tone with crying emoji.${dbContext}`;

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: question,
          },
        ],
        model: model,
        max_tokens: 200,
        temperature: 0.7,
      },
    });

    if (isUnexpected(response)) {
      throw response.body.error;
    }

    const answer = response.body.choices[0].message.content;
    console.log("✅ AI response generated with database context");
    res.json({ answer });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      answer:
        "Sorry, I'm having trouble processing your request. Please try again.",
    });
  }
});

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Server also accessible on http://192.168.1.5:${PORT}`);
  console.log(`📱 Make sure your phone is connected to the same WiFi network`);
});
