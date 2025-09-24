const express = require("express");
const cors = require("cors");
const ModelClient = require("@azure-rest/ai-inference").default;
const { isUnexpected } = require("@azure-rest/ai-inference");
const { AzureKeyCredential } = require("@azure/core-auth");
const path = require("path");
const db = require("./database");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require("./auth");
app.use("/auth", authRoutes);

// TEMP: debug to verify auth router is mounted
app.get("/auth/_debug", (req, res) => {
  try {
    const stack = (authRoutes && authRoutes.stack) || [];
    return res.json({ ok: true, routes: stack.map(l => l.route && l.route.path).filter(Boolean) });
  } catch (e) {
    return res.json({ ok: false, error: String(e) });
  }
});

// Initialize GitHub AI (optional)
const token = process.env.GITHUB_TOKEN;
const endpoint = "https://models.github.ai/inference";
const model = process.env.MODEL_ID || "openai/gpt-4o-mini";
let client = null;
try {
  if (token && typeof token === 'string' && token.trim().length > 0) {
    client = ModelClient(endpoint, new AzureKeyCredential(token));
  } else {
    console.warn('GITHUB_TOKEN not set. AI features disabled.');
  }
} catch (e) {
  console.warn('Failed to initialize AI client. AI features disabled.', String(e));
  client = null;
}

// Ensure database schema: add rooms.status if missing
function ensureRoomsStatusColumn() {
  try {
    db.query("SHOW COLUMNS FROM rooms LIKE 'status'", (err, results) => {
      if (err) {
        console.warn('Schema check failed for rooms.status:', err.message);
        return;
      }
      if (!results || results.length === 0) {
        console.log('Adding missing column rooms.status ...');
        db.query(
          "ALTER TABLE rooms ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'Vacant'",
          (alterErr) => {
            if (alterErr) {
              console.warn('Failed to add rooms.status column:', alterErr.message);
            } else {
              console.log('Added rooms.status column successfully');
            }
          }
        );
      }
    });
  } catch (e) {
    console.warn('Schema ensure error:', String(e));
  }
}

function ensureRoomsTypeColumn() {
  try {
    db.query("SHOW COLUMNS FROM rooms LIKE 'type'", (err, results) => {
      if (err) {
        console.warn('Schema check failed for rooms.type:', err.message);
        return;
      }
      if (!results || results.length === 0) {
        console.log('Adding missing column rooms.type ...');
        db.query(
          "ALTER TABLE rooms ADD COLUMN type VARCHAR(30) NOT NULL DEFAULT 'Lecture'",
          (alterErr) => {
            if (alterErr) {
              console.warn('Failed to add rooms.type column:', alterErr.message);
            } else {
              console.log('Added rooms.type column successfully');
            }
          }
        );
      }
    });
  } catch (e) {
    console.warn('Schema ensure error:', String(e));
  }
}

ensureRoomsStatusColumn();
ensureRoomsTypeColumn();


// Function to search database for relevant information
async function searchDatabase(question) {
  return new Promise((resolve) => {
    const searchResults = [];
    let completedSearches = 0;

    // Check if this is a rules or professors question
    const isRules = isRulesQuestion(question);
    const isProfessors = isProfessorsQuestion(question);
    const targetDepartment = extractDepartmentFromQuestion(question);

    // Tables to search with priority
    const tablesToSearch = [
      { name: "departments", priority: 1 },
      { name: "professors", priority: 2 },
      { name: "rooms", priority: 3 },
      { name: "offices", priority: 4 },
      { name: "rules", priority: 5 },
      { name: "settings", priority: 6 }
    ];

    if (tablesToSearch.length === 0) {
      resolve(searchResults);
      return;
    }

    // Extract keywords from question for better matching
    const keywords = extractKeywords(question);
    const searchTerms = [question.toLowerCase(), ...keywords];

    tablesToSearch.forEach((tableInfo) => {
      const table = tableInfo.name;
      
      // Special handling for rules questions
      if (isRules && table === 'rules') {
        // For rules questions, get all rules
        db.query('SELECT *, "rules_query" as match_type FROM rules', (err, results) => {
          if (!err && results.length > 0) {
            const scoredResults = results.map(result => ({
              ...result,
              relevance_score: 100 // High relevance for rules when asking about rules
            }));
            searchResults.push({
              table: table,
              data: scoredResults,
              priority: tableInfo.priority
            });
          }

          completedSearches++;
          if (completedSearches === tablesToSearch.length) {
            // Sort results by table priority and relevance
            const finalResults = searchResults.sort((a, b) => a.priority - b.priority);
            resolve(finalResults);
          }
        });
        return;
      }

      // Special handling for professors questions
      if (isProfessors && table === 'professors') {
        if (targetDepartment) {
          // Narrow to professors in the target department (e.g., BSIT)
          db.query(
            'SELECT *, "professors_query" as match_type FROM professors WHERE department LIKE ?',
            [`%${targetDepartment}%`],
            (err, results) => {
              if (!err && results.length > 0) {
                const scoredResults = results.map(result => ({
                  ...result,
                  relevance_score: 100
                }));
                searchResults.push({
                  table: table,
                  data: scoredResults,
                  priority: tableInfo.priority
                });
              }

              completedSearches++;
              if (completedSearches === tablesToSearch.length) {
                const finalResults = searchResults.sort((a, b) => a.priority - b.priority);
                resolve(finalResults);
              }
            }
          );
        } else {
          // If no department specified, return all professors (limited)
          db.query(
            'SELECT *, "professors_query" as match_type FROM professors LIMIT 25',
            (err, results) => {
              if (!err && results.length > 0) {
                const scoredResults = results.map(result => ({
                  ...result,
                  relevance_score: 80
                }));
                searchResults.push({
                  table: table,
                  data: scoredResults,
                  priority: tableInfo.priority
                });
              }

              completedSearches++;
              if (completedSearches === tablesToSearch.length) {
                const finalResults = searchResults.sort((a, b) => a.priority - b.priority);
                resolve(finalResults);
              }
            }
          );
        }
        return;
      }
      
      // Create multiple search queries for better results
      const queries = [
        // Exact phrase search
        `SELECT *, 'exact' as match_type FROM ${table} WHERE 
         CONCAT_WS(' ', ${getSearchableColumns(table)}) LIKE ?`,
        
        // Individual keyword search
        `SELECT *, 'keyword' as match_type FROM ${table} WHERE 
         CONCAT_WS(' ', ${getSearchableColumns(table)}) LIKE ?`,
        
        // Partial word search
        `SELECT *, 'partial' as match_type FROM ${table} WHERE 
         CONCAT_WS(' ', ${getSearchableColumns(table)}) LIKE ?`
      ];

      // Add individual keyword searches
      keywords.forEach(keyword => {
        queries.push(`SELECT *, 'keyword' as match_type FROM ${table} WHERE 
         CONCAT_WS(' ', ${getSearchableColumns(table)}) LIKE ?`);
      });

      let tableResults = [];
      let queryCount = 0;

      queries.forEach((query, index) => {
        let searchTerm;
        
        if (index === 0) {
          // Exact phrase search
          searchTerm = `%${question.toLowerCase()}%`;
        } else if (index === 1) {
          // Keyword search - use first meaningful keyword
          searchTerm = `%${keywords[0] || question.toLowerCase()}%`;
        } else if (index === 2) {
          // Partial word search - use first word longer than 2 chars
          const firstWord = question.toLowerCase().split(' ').find(word => word.length > 2);
          searchTerm = `%${firstWord || question.toLowerCase()}%`;
        } else {
          // Individual keyword search - try each keyword separately
          const keywordIndex = index - 3;
          const keyword = keywords[keywordIndex] || question.toLowerCase();
          searchTerm = `%${keyword}%`;
        }

        db.query(query, [searchTerm], (err, results) => {
          if (!err && results.length > 0) {
            // Add relevance score based on match type and table priority
            const scoredResults = results.map(result => ({
              ...result,
              relevance_score: calculateRelevance(result, question, tableInfo.priority, index)
            }));
            tableResults = tableResults.concat(scoredResults);
          }

          queryCount++;
          if (queryCount === queries.length) {
            // Remove duplicates and sort by relevance
            const uniqueResults = removeDuplicates(tableResults);
            const sortedResults = uniqueResults.sort((a, b) => b.relevance_score - a.relevance_score);

            if (sortedResults.length > 0) {
              searchResults.push({
                table: table,
                data: sortedResults.slice(0, 5), // Limit to top 5 results per table
                priority: tableInfo.priority
              });
            }

            completedSearches++;
            if (completedSearches === tablesToSearch.length) {
              // Sort results by table priority and relevance
              const finalResults = searchResults.sort((a, b) => a.priority - b.priority);
              resolve(finalResults);
            }
          }
        });
      });
    });
  });
}

// Extract keywords from question for better search
function extractKeywords(question) {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'what', 'where', 'when', 'why', 'how', 'who', 'which', 'list', 'show', 'all'];
  
  // Handle common abbreviations and synonyms
  const synonyms = {
    'profs': 'professor',
    'prof': 'professor',
    'teachers': 'professor',
    'instructors': 'professor',
    'faculty': 'professor',
    'rooms': 'room',
    'offices': 'office',
    'departments': 'department',
    'rules': 'rule'
  };
  
  let keywords = question.toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .map(word => synonyms[word] || word); // Replace with synonyms if available
  
  // If no keywords found, try with shorter words
  if (keywords.length === 0) {
    keywords = question.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 1 && !stopWords.includes(word))
      .map(word => synonyms[word] || word);
  }
  
  return keywords.slice(0, 5); // Take top 5 keywords
}

// Check if question is asking about rules specifically
function isRulesQuestion(question) {
  const rulesKeywords = ['rules', 'rule', 'regulations', 'policies', 'guidelines', 'code', 'conduct'];
  const questionLower = question.toLowerCase();
  return rulesKeywords.some(keyword => questionLower.includes(keyword));
}

// Check if question is asking about professors/faculty
function isProfessorsQuestion(question) {
  const profKeywords = ['professor', 'professors', 'profs', 'teacher', 'teachers', 'instructor', 'instructors', 'faculty'];
  const q = question.toLowerCase();
  return profKeywords.some(k => q.includes(k));
}

// Try to extract department from question (maps to DB department values)
function extractDepartmentFromQuestion(question) {
  const q = question.toLowerCase();
  // Common department aliases
  if (q.includes('bsit') || q.includes(' it ') || q.endsWith(' it') || q.startsWith('it ') || q.includes('information technology')) {
    return 'BSIT';
  }
  if (q.includes('bscs') || q.includes(' cs ') || q.endsWith(' cs') || q.startsWith('cs ') || q.includes('computer science')) {
    return 'BSCS';
  }
  if (q.includes('it?') || q.includes('it,')) {
    return 'BSIT';
  }
  return null;
}

// Calculate relevance score for search results
function calculateRelevance(result, question, tablePriority, matchType) {
  let score = 0;
  
  // Base score from table priority (lower number = higher priority)
  score += (7 - tablePriority) * 10;
  
  // Match type bonus
  if (matchType === 0) score += 50; // Exact match
  else if (matchType === 1) score += 30; // Keyword match
  else score += 10; // Partial match
  
  // Length bonus (shorter results often more relevant)
  const contentLength = Object.values(result).join(' ').length;
  if (contentLength < 100) score += 20;
  else if (contentLength < 200) score += 10;
  
  return score;
}

// Remove duplicate results
function removeDuplicates(results) {
  const seen = new Set();
  return results.filter(result => {
    const key = `${result.id}_${result.table || 'unknown'}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// Helper function to get searchable columns for each table
function getSearchableColumns(table) {
  const columnMap = {
    departments: "name, head, location",
    professors: "name, position, email, department, program",
    rooms: "name, location, status, type",
    offices: "name, location",
    rules: "description",
    settings: "setting_name, setting_value, description",
  };

  return columnMap[table] || "name, description";
}

// Test route
app.get("/", (req, res) => {
  res.send("UM AI Helpdesk Backend is running 🚀");
});

// Debug route to test database search
app.post("/debug-search", async (req, res) => {
  const { question } = req.body;
  try {
    const dbResults = await searchDatabase(question);
    res.json({ question, results: dbResults });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// AI ask route with database search + GitHub AI (with timeout & fallback)
app.post("/ask", async (req, res) => {
  const { question } = req.body;

  try {
    // First, search the database for relevant information
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
- If someone just says "miss mo", respond with "Opo 😢" in a sad tone with crying emoji

${dbContext}`;

    // Helper to enforce timeout on AI call
    const withTimeout = (promise, ms) => {
      return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error("AI_TIMEOUT")), ms)),
      ]);
    };

    if (client) {
      try {
        const response = await withTimeout(
          client.path("/chat/completions").post({
            body: {
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: question },
              ],
              model: model,
              max_tokens: 80,
              temperature: 0.5,
            },
          }),
          Number(process.env.AI_TIMEOUT_MS || 8000)
        );

        if (isUnexpected(response)) {
          throw response.body.error;
        }

        const answer = response.body.choices[0].message.content;
        return res.json({ answer });
      } catch (aiErr) {
        // continue to fallback below
      }
    }

    // Fallback to quick DB-based response
    const first = dbResults[0];
    const sample = first && (first.data || []).slice(0, 2);
    let fallback = "I couldn't find specific info in the database right now. Please try rephrasing your question.";
    if (first && sample && sample.length > 0) {
      if (first.table === "rules") fallback = `Here are some rules I found: ${sample.map(r => r.description).filter(Boolean).join(" | ")}`;
      else if (first.table === "professors") fallback = `Some professors: ${sample.map(p => p.name).filter(Boolean).join(", ")}`;
      else if (first.table === "rooms") {
        const roomsAvail = sample.map(r => `${r.name || 'Room'}: ${r.status || 'Vacant'}`).join(" | ");
        fallback = `Rooms status: ${roomsAvail}`;
      }
      else fallback = `I found some info in ${first.table}.`;
    }
    return res.json({ answer: fallback });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      answer:
        "Sorry, I'm having trouble processing your request. Please try again.",
    });
  }
});

// Admin API Routes
app.get('/api/departments', (req, res) => {
  db.query('SELECT id, name, short_name, head_id AS head, admin_id FROM departments', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.post('/api/departments', (req, res) => {
  const { name, short_name } = req.body;
  const head_id = null; // Not provided by UI
  const admin_id = null; // Avoid FK error if no admins row exists
  db.query(
    'INSERT INTO departments (name, short_name, head_id, admin_id) VALUES (?, ?, ?, ?)',
    [name, short_name, head_id, admin_id],
    (err, result) => {
      if (err) {
        console.error('Departments insert error:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      res.json({ id: result.insertId, message: 'Department created successfully' });
    }
  );
});

app.put('/api/departments/:id', (req, res) => {
  const { id } = req.params;
  const { name, short_name } = req.body;
  const head_id = null; // Not handled in UI
  db.query(
    'UPDATE departments SET name = ?, short_name = ?, head_id = ? WHERE id = ?',
    [name, short_name, head_id, id],
    (err, result) => {
      if (err) {
        console.error('Departments update error:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      res.json({ message: 'Department updated successfully' });
    }
  );
});

// Departments structure (debug)
app.get('/api/departments/structure', (req, res) => {
  db.query('DESCRIBE departments', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    res.json(results);
  });
});

app.delete('/api/departments/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM departments WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Department deleted successfully' });
  });
});

// Room API Routes
app.get('/api/rooms', (req, res) => {
  db.query('SELECT * FROM rooms', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    res.json(results);
  });
});

// Check rooms table structure
app.get('/api/rooms/structure', (req, res) => {
  db.query('DESCRIBE rooms', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    res.json(results);
  });
});


app.post('/api/rooms', (req, res) => {
  const { name, location, status, type } = req.body;
  console.log('Received data:', { name, location, status, type });

  // Try to insert with status if provided; fall back if column doesn't exist
  const insertWithStatus = typeof status !== 'undefined';
  const insertWithType = typeof type !== 'undefined';

  if (insertWithStatus || insertWithType) {
    db.query(
      'INSERT INTO rooms (name, location, status, type) VALUES (?, ?, ?, ?)',
      [name, location, status ?? 'Vacant', type ?? 'Lecture'],
      (err, result) => {
        if (err) {
          // If status column doesn't exist, fall back to inserting without status
          if (err && (err.code === 'ER_BAD_FIELD_ERROR' || err.errno === 1054)) {
            db.query(
              'INSERT INTO rooms (name, location) VALUES (?, ?)',
              [name, location],
              (fallbackErr, fallbackResult) => {
                if (fallbackErr) {
                  console.error('Database error (fallback insert):', fallbackErr);
                  return res.status(500).json({ error: 'Database error', details: fallbackErr.message });
                }
                return res.json({ id: fallbackResult.insertId, message: 'Room created successfully (status not stored)' });
              }
            );
          } else {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error', details: err.message });
          }
        } else {
          return res.json({ id: result.insertId, message: 'Room created successfully' });
        }
      }
    );
  } else {
    db.query(
      'INSERT INTO rooms (name, location) VALUES (?, ?)',
      [name, location],
      (err, result) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        res.json({ id: result.insertId, message: 'Room created successfully' });
      }
    );
  }
});

app.put('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  const { name, location, status, type } = req.body;

  const updateWithStatus = typeof status !== 'undefined';
  const updateWithType = typeof type !== 'undefined';

  if (updateWithStatus || updateWithType) {
    db.query(
      'UPDATE rooms SET name = ?, location = ?, status = COALESCE(?, status), type = COALESCE(?, type) WHERE id = ?',
      [name, location, status ?? null, type ?? null, id],
      (err, result) => {
        if (err) {
          // Fall back if status column doesn't exist
          if (err && (err.code === 'ER_BAD_FIELD_ERROR' || err.errno === 1054)) {
            db.query(
              'UPDATE rooms SET name = ?, location = ? WHERE id = ?',
              [name, location, id],
              (fallbackErr) => {
                if (fallbackErr) {
                  return res.status(500).json({ error: 'Database error', details: fallbackErr.message });
                }
                return res.json({ message: 'Room updated successfully (status not stored)' });
              }
            );
          } else {
            return res.status(500).json({ error: 'Database error', details: err.message });
          }
        } else {
          return res.json({ message: 'Room updated successfully' });
        }
      }
    );
  } else {
    db.query(
      'UPDATE rooms SET name = ?, location = ? WHERE id = ?',
      [name, location, id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Database error', details: err.message });
        }
        res.json({ message: 'Room updated successfully' });
      }
    );
  }
});

app.delete('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM rooms WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Room deleted successfully' });
  });
});

// Office API Routes
app.get('/api/offices', (req, res) => {
  db.query('SELECT * FROM offices', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.post('/api/offices', (req, res) => {
  const { name, location } = req.body;
  db.query(
    'INSERT INTO offices (name, location) VALUES (?, ?)',
    [name, location],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: result.insertId, message: 'Office created successfully' });
    }
  );
});

app.put('/api/offices/:id', (req, res) => {
  const { id } = req.params;
  const { name, location } = req.body;
  db.query(
    'UPDATE offices SET name = ?, location = ? WHERE id = ?',
    [name, location, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Office updated successfully' });
    }
  );
});

app.delete('/api/offices/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM offices WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Office deleted successfully' });
  });
});

// Professor API Routes
app.get('/api/professors', (req, res) => {
  // Ensure schema is up to date
  try { ensureProfessorsProgramColumn(); } catch(_) {}
  db.query('SELECT * FROM professors', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    const withProgram = (results || []).map(r => ({
      ...r,
      program: typeof r.program === 'undefined' || r.program === null ? '' : r.program
    }));
    res.json(withProgram);
  });
});

// Professors structure (debug)
app.get('/api/professors/structure', (req, res) => {
  db.query('DESCRIBE professors', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    res.json(results);
  });
});

// Professors migrate: ensure program column
app.post('/api/professors/migrate', (req, res) => {
  db.query("SHOW COLUMNS FROM professors LIKE 'program'", (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    if (results && results.length > 0) {
      return res.json({ ok: true, message: 'program column already exists' });
    }
    db.query(
      "ALTER TABLE professors ADD COLUMN program VARCHAR(50) NULL AFTER department",
      (alterErr) => {
        if (alterErr) {
          return res.status(500).json({ ok: false, error: 'Migration failed', details: alterErr.message });
        }
        return res.json({ ok: true, message: 'program column added successfully' });
      }
    );
  });
});

app.post('/api/professors', (req, res) => {
  const { name, position, email, department, program } = req.body;
  const insert = () => db.query(
    'INSERT INTO professors (name, position, email, department, program) VALUES (?, ?, ?, ?, ?)',
    [name, position, email, department, program || null],
    (err, result) => {
      if (err) {
        // If program column is missing, add it then retry once
        if (err && (err.code === 'ER_BAD_FIELD_ERROR' || err.errno === 1054)) {
          return db.query(
            "ALTER TABLE professors ADD COLUMN program VARCHAR(50) NULL AFTER department",
            (alterErr) => {
              if (alterErr) {
                return res.status(500).json({ error: 'Database error', details: alterErr.message });
              }
              return insert();
            }
          );
        }
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      res.json({ id: result.insertId, message: 'Professor created successfully' });
    }
  );
  insert();
});

app.put('/api/professors/:id', (req, res) => {
  const { id } = req.params;
  const { name, position, email, department, program } = req.body;
  const update = () => db.query(
    'UPDATE professors SET name = ?, position = ?, email = ?, department = ?, program = COALESCE(?, program) WHERE id = ?',
    [name, position, email, department, program ?? null, id],
    (err, result) => {
      if (err) {
        if (err && (err.code === 'ER_BAD_FIELD_ERROR' || err.errno === 1054)) {
          return db.query(
            "ALTER TABLE professors ADD COLUMN program VARCHAR(50) NULL AFTER department",
            (alterErr) => {
              if (alterErr) {
                return res.status(500).json({ error: 'Database error', details: alterErr.message });
              }
              return update();
            }
          );
        }
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      res.json({ message: 'Professor updated successfully' });
    }
  );
  update();
});

app.delete('/api/professors/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM professors WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Professor deleted successfully' });
  });
});

// Rules API Routes
app.get('/api/rules', (req, res) => {
  db.query('SELECT * FROM rules', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.post('/api/rules', (req, res) => {
  const { description, admin_id } = req.body;
  db.query(
    'INSERT INTO rules (description, admin_id) VALUES (?, ?)',
    [description, admin_id || 1], // Default admin_id to 1 if not provided
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: result.insertId, message: 'Rule created successfully' });
    }
  );
});

app.put('/api/rules/:id', (req, res) => {
  const { id } = req.params;
  const { description, admin_id } = req.body;
  db.query(
    'UPDATE rules SET description = ?, admin_id = ? WHERE id = ?',
    [description, admin_id || 1, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Rule updated successfully' });
    }
  );
});

app.delete('/api/rules/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM rules WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Rule deleted successfully' });
  });
});

// Logs API Routes
app.get('/api/logs', (req, res) => {
  db.query('SELECT * FROM logs ORDER BY created_at DESC', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.post('/api/logs', (req, res) => {
  const { action, user, details, status } = req.body;
  db.query(
    'INSERT INTO logs (action, user, details, status, created_at) VALUES (?, ?, ?, ?, NOW())',
    [action, user, details, status || 'Success'],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: result.insertId, message: 'Log created successfully' });
    }
  );
});

app.put('/api/logs/:id', (req, res) => {
  const { id } = req.params;
  const { action, user, details, status } = req.body;
  db.query(
    'UPDATE logs SET action = ?, user = ?, details = ?, status = ? WHERE id = ?',
    [action, user, details, status, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Log updated successfully' });
    }
  );
});

app.delete('/api/logs/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM logs WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Log deleted successfully' });
  });
});

// Reports API Routes
app.get('/api/reports', (req, res) => {
  db.query('SELECT * FROM reports ORDER BY created_at DESC', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.post('/api/reports', (req, res) => {
  const { title, description, type, status, data } = req.body;
  db.query(
    'INSERT INTO reports (title, description, type, status, data, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
    [title, description, type, status || 'Draft', JSON.stringify(data)],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: result.insertId, message: 'Report created successfully' });
    }
  );
});

app.put('/api/reports/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, type, status, data } = req.body;
  db.query(
    'UPDATE reports SET title = ?, description = ?, type = ?, status = ?, data = ? WHERE id = ?',
    [title, description, type, status, JSON.stringify(data), id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Report updated successfully' });
    }
  );
});

app.delete('/api/reports/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM reports WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Report deleted successfully' });
  });
});

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`✅ Server also accessible on http://192.168.1.11:${PORT}`);
  console.log(`📱 Make sure your phone is connected to the same WiFi network`);
});
