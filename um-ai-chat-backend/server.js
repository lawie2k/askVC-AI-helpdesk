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

// Admin API Routes
app.get('/api/departments', (req, res) => {
  db.query('SELECT * FROM departments', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.post('/api/departments', (req, res) => {
  const { name, short_name, description, head, location } = req.body;
  db.query(
    'INSERT INTO departments (name, short_name, description, head, location) VALUES (?, ?, ?, ?, ?)',
    [name, short_name, description, head, location],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: result.insertId, message: 'Department created successfully' });
    }
  );
});

app.put('/api/departments/:id', (req, res) => {
  const { id } = req.params;
  const { name, short_name, description, head, location } = req.body;
  db.query(
    'UPDATE departments SET name = ?, short_name = ?, description = ?, head = ?, location = ? WHERE id = ?',
    [name, short_name, description, head, location, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Department updated successfully' });
    }
  );
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
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.post('/api/rooms', (req, res) => {
  const { room_number, building, floor, capacity, type, description, status } = req.body;
  db.query(
    'INSERT INTO rooms (room_number, building, floor, capacity, type, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [room_number, building, floor, capacity, type, description, status || 'Available'],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: result.insertId, message: 'Room created successfully' });
    }
  );
});

app.put('/api/rooms/:id', (req, res) => {
  const { id } = req.params;
  const { room_number, building, floor, capacity, type, description, status } = req.body;
  db.query(
    'UPDATE rooms SET room_number = ?, building = ?, floor = ?, capacity = ?, type = ?, description = ?, status = ? WHERE id = ?',
    [room_number, building, floor, capacity, type, description, status, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Room updated successfully' });
    }
  );
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
  const { name, department, head, employees, location } = req.body;
  db.query(
    'INSERT INTO offices (name, department, head, employees, location) VALUES (?, ?, ?, ?, ?)',
    [name, department, head, employees, location],
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
  const { name, department, head, employees, location } = req.body;
  db.query(
    'UPDATE offices SET name = ?, department = ?, head = ?, employees = ?, location = ? WHERE id = ?',
    [name, department, head, employees, location, id],
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
  db.query('SELECT * FROM professors', (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.post('/api/professors', (req, res) => {
  const { name, position, email, department } = req.body;
  db.query(
    'INSERT INTO professors (name, position, email, department) VALUES (?, ?, ?, ?)',
    [name, position, email, department],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: result.insertId, message: 'Professor created successfully' });
    }
  );
});

app.put('/api/professors/:id', (req, res) => {
  const { id } = req.params;
  const { name, position, email, department } = req.body;
  db.query(
    'UPDATE professors SET name = ?, position = ?, email = ?, department = ? WHERE id = ?',
    [name, position, email, department, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ message: 'Professor updated successfully' });
    }
  );
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
