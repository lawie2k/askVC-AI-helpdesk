const express = require("express");
const db = require("./database");
const jwt = require("jsonwebtoken");
const { searchDatabase, extractRoomNumber } = require("./ai-search");
const AIService = require("./ai-service");

const router = express.Router();
const aiService = new AIService();

// Middleware to authenticate admin
function authenticateAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Helper function to log admin activities
function logAdminActivity(adminId, action, details, tableName = null) {
  const logDetails = tableName ? `${action} on ${tableName}: ${details}` : details;
  
  db.query(
    'INSERT INTO logs (admin_id, action, details, created_at) VALUES (?, ?, ?, NOW())',
    [adminId, action, logDetails],
    (err) => {
      if (err) {
        console.error('Failed to log admin activity:', err);
      }
    }
  );
}

// Test route
router.get("/", (req, res) => {
  res.send("UM AI Helpdesk Backend is running 🚀");
});

// Debug route to test database search
router.post("/debug-search", async (req, res) => {
  const { question } = req.body;
  try {
    const dbResults = await searchDatabase(question);
    res.json({ question, results: dbResults });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI ask route with database search + GitHub AI (with timeout & fallback)
router.post("/ask", async (req, res) => {
  const { question } = req.body;

  try {
    // Extract room number for fallback responses
    const targetRoomNumber = extractRoomNumber(question);
    
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

    if (aiService.isAvailable()) {
      try {
        const answer = await aiService.generateResponse(systemPrompt, question);
        return res.json({ answer });
      } catch (aiErr) {
        console.warn('AI service failed, falling back to database response:', aiErr.message);
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
      else if (first.table === "buildings") fallback = `Buildings on campus: ${sample.map(b => b.name).filter(Boolean).join(", ")}`;
      else if (first.table === "offices") {
        const officeInfo = sample.map(o => {
          const building = o.building_name || 'Unknown Building';
          const floor = o.floor || 'Unknown Floor';
          return `${o.name}: ${building} ${floor}`;
        }).join(" | ");
        fallback = `Office locations: ${officeInfo}`;
      }
      else if (first.table === "rooms") {
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

// Departments API routes
router.get('/api/departments', (req, res) => {
  db.query('SELECT * FROM departments ORDER BY name', (err, results) => {
    if (err) {
      console.error('Error fetching departments:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results || []);
  });
});

router.post('/api/departments', authenticateAdmin, (req, res) => {
  const { name, head, location } = req.body;
  
  if (!name || !head || !location) {
    return res.status(400).json({ error: 'Name, head, and location are required' });
  }

  db.query(
    'INSERT INTO departments (name, head, location) VALUES (?, ?, ?)',
    [name, head, location],
    (err, result) => {
      if (err) {
        console.error('Error creating department:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      logAdminActivity(req.admin.id, 'CREATE', `Department: ${name}`, 'departments');
      res.json({ id: result.insertId, name, head, location });
    }
  );
});

router.put('/api/departments/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { name, head, location } = req.body;
  
  if (!name || !head || !location) {
    return res.status(400).json({ error: 'Name, head, and location are required' });
  }

  db.query(
    'UPDATE departments SET name = ?, head = ?, location = ? WHERE id = ?',
    [name, head, location, id],
    (err, result) => {
      if (err) {
        console.error('Error updating department:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Department not found' });
      }
      
      logAdminActivity(req.admin.id, 'UPDATE', `Department: ${name}`, 'departments');
      res.json({ id, name, head, location });
    }
  );
});

router.get('/api/departments/structure', (req, res) => {
  db.query('DESCRIBE departments', (err, results) => {
    if (err) {
      console.error('Error fetching department structure:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

router.delete('/api/departments/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  
  db.query('DELETE FROM departments WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting department:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }
    
    logAdminActivity(req.admin.id, 'DELETE', `Department ID: ${id}`, 'departments');
    res.json({ message: 'Department deleted successfully' });
  });
});

// Rooms API routes
router.get('/api/rooms', (req, res) => {
  db.query(`
    SELECT r.*, b.name as building_name 
    FROM rooms r 
    LEFT JOIN buildings b ON r.building_id = b.id
  `, (err, results) => {
    if (err) {
      console.error('Error fetching rooms:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results || []);
  });
});

router.get('/api/rooms/structure', (req, res) => {
  db.query('DESCRIBE rooms', (err, results) => {
    if (err) {
      console.error('Error fetching room structure:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

router.post('/api/rooms', authenticateAdmin, (req, res) => {
  const { name, building_id, floor, status, type } = req.body;
  
  if (!name || !building_id || !floor) {
    return res.status(400).json({ error: 'Name, building, and floor are required' });
  }

  db.query(
    'INSERT INTO rooms (name, building_id, floor, status, type) VALUES (?, ?, ?, ?, ?)',
    [name, building_id, floor, status ?? 'Vacant', type ?? 'Lecture'],
    (err, result) => {
      if (err) {
        console.error('Error creating room:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      logAdminActivity(req.admin.id, 'CREATE', `Room: ${name}`, 'rooms');
      res.json({ id: result.insertId, name, building_id, floor, status: status ?? 'Vacant', type: type ?? 'Lecture' });
    }
  );
});

router.put('/api/rooms/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { name, building_id, floor, status, type } = req.body;
  
  if (!name || !building_id || !floor) {
    return res.status(400).json({ error: 'Name, building, and floor are required' });
  }

  db.query(
    'UPDATE rooms SET name = ?, building_id = ?, floor = ?, status = COALESCE(?, status), type = COALESCE(?, type) WHERE id = ?',
    [name, building_id, floor, status ?? null, type ?? null, id],
    (err, result) => {
      if (err) {
        console.error('Error updating room:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Room not found' });
      }
      
      logAdminActivity(req.admin.id, 'UPDATE', `Room: ${name}`, 'rooms');
      res.json({ id, name, building_id, floor, status: status ?? 'Vacant', type: type ?? 'Lecture' });
    }
  );
});

router.delete('/api/rooms/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  
  db.query('DELETE FROM rooms WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting room:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    
    logAdminActivity(req.admin.id, 'DELETE', `Room ID: ${id}`, 'rooms');
    res.json({ message: 'Room deleted successfully' });
  });
});

// Offices API routes
router.get('/api/offices', (req, res) => {
  db.query(`
    SELECT o.*, b.name as building_name 
    FROM offices o 
    LEFT JOIN buildings b ON o.building_id = b.id
  `, (err, results) => {
    if (err) {
      console.error('Error fetching offices:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results || []);
  });
});

router.post('/api/offices', authenticateAdmin, (req, res) => {
  const { name, building_id, floor } = req.body;
  
  if (!name || !building_id || !floor) {
    return res.status(400).json({ error: 'Name, building, and floor are required' });
  }

  db.query(
    'INSERT INTO offices (name, building_id, floor) VALUES (?, ?, ?)',
    [name, building_id, floor],
    (err, result) => {
      if (err) {
        console.error('Error creating office:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      logAdminActivity(req.admin.id, 'CREATE', `Office: ${name}`, 'offices');
      res.json({ id: result.insertId, name, building_id, floor });
    }
  );
});

router.put('/api/offices/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { name, building_id, floor } = req.body;
  
  if (!name || !building_id || !floor) {
    return res.status(400).json({ error: 'Name, building, and floor are required' });
  }

  db.query(
    'UPDATE offices SET name = ?, building_id = ?, floor = ? WHERE id = ?',
    [name, building_id, floor, id],
    (err, result) => {
      if (err) {
        console.error('Error updating office:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Office not found' });
      }
      
      logAdminActivity(req.admin.id, 'UPDATE', `Office: ${name}`, 'offices');
      res.json({ id, name, building_id, floor });
    }
  );
});

router.delete('/api/offices/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  
  db.query('DELETE FROM offices WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting office:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Office not found' });
    }
    
    logAdminActivity(req.admin.id, 'DELETE', `Office ID: ${id}`, 'offices');
    res.json({ message: 'Office deleted successfully' });
  });
});

// Buildings API routes
router.get('/api/buildings', (req, res) => {
  db.query('SELECT * FROM buildings ORDER BY name', (err, results) => {
    if (err) {
      console.error('Error fetching buildings:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results || []);
  });
});

router.post('/api/buildings', authenticateAdmin, (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  db.query(
    'INSERT INTO buildings (name) VALUES (?)',
    [name],
    (err, result) => {
      if (err) {
        console.error('Error creating building:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      logAdminActivity(req.admin.id, 'CREATE', `Building: ${name}`, 'buildings');
      res.json({ id: result.insertId, name });
    }
  );
});

router.put('/api/buildings/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  db.query(
    'UPDATE buildings SET name = ? WHERE id = ?',
    [name, id],
    (err, result) => {
      if (err) {
        console.error('Error updating building:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Building not found' });
      }
      
      logAdminActivity(req.admin.id, 'UPDATE', `Building: ${name}`, 'buildings');
      res.json({ id, name });
    }
  );
});

router.delete('/api/buildings/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  
  db.query('DELETE FROM buildings WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting building:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Building not found' });
    }
    
    logAdminActivity(req.admin.id, 'DELETE', `Building ID: ${id}`, 'buildings');
    res.json({ message: 'Building deleted successfully' });
  });
});

// Professors API routes
router.get('/api/professors', (req, res) => {
  db.query('SELECT * FROM professors ORDER BY name', (err, results) => {
    if (err) {
      console.error('Error fetching professors:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results || []);
  });
});

router.get('/api/professors/structure', (req, res) => {
  db.query('DESCRIBE professors', (err, results) => {
    if (err) {
      console.error('Error fetching professor structure:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

router.post('/api/professors/migrate', (req, res) => {
  const { professors } = req.body;
  
  if (!Array.isArray(professors)) {
    return res.status(400).json({ error: 'Professors must be an array' });
  }

  let completed = 0;
  let errors = [];

  professors.forEach((prof, index) => {
    const { name, position, email, department, program } = prof;
    
    db.query(
      'INSERT INTO professors (name, position, email, department, program) VALUES (?, ?, ?, ?, ?)',
      [name, position, email, department, program],
      (err, result) => {
        completed++;
        if (err) {
          errors.push({ index, error: err.message });
        }
        
        if (completed === professors.length) {
          if (errors.length > 0) {
            res.status(500).json({ error: 'Some professors failed to migrate', details: errors });
          } else {
            res.json({ message: 'All professors migrated successfully' });
          }
        }
      }
    );
  });
});

router.post('/api/professors', authenticateAdmin, (req, res) => {
  const { name, position, email, department, program } = req.body;
  
  if (!name || !position || !email || !department || !program) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.query(
    'INSERT INTO professors (name, position, email, department, program) VALUES (?, ?, ?, ?, ?)',
    [name, position, email, department, program],
    (err, result) => {
      if (err) {
        console.error('Error creating professor:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      logAdminActivity(req.admin.id, 'CREATE', `Professor: ${name}`, 'professors');
      res.json({ id: result.insertId, name, position, email, department, program });
    }
  );
});

router.put('/api/professors/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { name, position, email, department, program } = req.body;
  
  if (!name || !position || !email || !department || !program) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  db.query(
    'UPDATE professors SET name = ?, position = ?, email = ?, department = ?, program = ? WHERE id = ?',
    [name, position, email, department, program, id],
    (err, result) => {
      if (err) {
        console.error('Error updating professor:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Professor not found' });
      }
      
      logAdminActivity(req.admin.id, 'UPDATE', `Professor: ${name}`, 'professors');
      res.json({ id, name, position, email, department, program });
    }
  );
});

router.delete('/api/professors/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  
  db.query('DELETE FROM professors WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting professor:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Professor not found' });
    }
    
    logAdminActivity(req.admin.id, 'DELETE', `Professor ID: ${id}`, 'professors');
    res.json({ message: 'Professor deleted successfully' });
  });
});

// Rules API routes
router.get('/api/rules', (req, res) => {
  db.query('SELECT * FROM rules ORDER BY id', (err, results) => {
    if (err) {
      console.error('Error fetching rules:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results || []);
  });
});

router.post('/api/rules', authenticateAdmin, (req, res) => {
  const { description } = req.body;
  
  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  db.query(
    'INSERT INTO rules (description) VALUES (?)',
    [description],
    (err, result) => {
      if (err) {
        console.error('Error creating rule:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      logAdminActivity(req.admin.id, 'CREATE', `Rule: ${description.substring(0, 50)}...`, 'rules');
      res.json({ id: result.insertId, description });
    }
  );
});

router.put('/api/rules/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { description } = req.body;
  
  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  db.query(
    'UPDATE rules SET description = ? WHERE id = ?',
    [description, id],
    (err, result) => {
      if (err) {
        console.error('Error updating rule:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Rule not found' });
      }
      
      logAdminActivity(req.admin.id, 'UPDATE', `Rule: ${description.substring(0, 50)}...`, 'rules');
      res.json({ id, description });
    }
  );
});

router.delete('/api/rules/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  
  db.query('DELETE FROM rules WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting rule:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Rule not found' });
    }
    
    logAdminActivity(req.admin.id, 'DELETE', `Rule ID: ${id}`, 'rules');
    res.json({ message: 'Rule deleted successfully' });
  });
});

// Settings API routes
router.get('/api/settings', (req, res) => {
  db.query('SELECT * FROM settings ORDER BY setting_name', (err, results) => {
    if (err) {
      console.error('Error fetching settings:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results || []);
  });
});

router.post('/api/settings', authenticateAdmin, (req, res) => {
  const { setting_name, setting_value, description } = req.body;
  
  if (!setting_name || !setting_value) {
    return res.status(400).json({ error: 'Setting name and value are required' });
  }

  db.query(
    'INSERT INTO settings (setting_name, setting_value, description) VALUES (?, ?, ?)',
    [setting_name, setting_value, description],
    (err, result) => {
      if (err) {
        console.error('Error creating setting:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      logAdminActivity(req.admin.id, 'CREATE', `Setting: ${setting_name}`, 'settings');
      res.json({ id: result.insertId, setting_name, setting_value, description });
    }
  );
});

router.put('/api/settings/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { setting_name, setting_value, description } = req.body;
  
  if (!setting_name || !setting_value) {
    return res.status(400).json({ error: 'Setting name and value are required' });
  }

  db.query(
    'UPDATE settings SET setting_name = ?, setting_value = ?, description = ? WHERE id = ?',
    [setting_name, setting_value, description, id],
    (err, result) => {
      if (err) {
        console.error('Error updating setting:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Setting not found' });
      }
      
      logAdminActivity(req.admin.id, 'UPDATE', `Setting: ${setting_name}`, 'settings');
      res.json({ id, setting_name, setting_value, description });
    }
  );
});

router.delete('/api/settings/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  
  db.query('DELETE FROM settings WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting setting:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Setting not found' });
    }
    
    logAdminActivity(req.admin.id, 'DELETE', `Setting ID: ${id}`, 'settings');
    res.json({ message: 'Setting deleted successfully' });
  });
});

// Logs API routes
router.get('/api/logs', authenticateAdmin, (req, res) => {
  db.query(`
    SELECT l.*, a.username 
    FROM logs l 
    LEFT JOIN admins a ON l.admin_id = a.id 
    ORDER BY l.created_at DESC 
    LIMIT 100
  `, (err, results) => {
    if (err) {
      console.error('Error fetching logs:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results || []);
  });
});

module.exports = router;
