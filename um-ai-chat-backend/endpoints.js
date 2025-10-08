const express = require("express");
const db = require("./database");
const jwt = require("jsonwebtoken");
const { searchDatabase, extractRoomNumber, extractDepartmentFromQuestion } = require("./ai-search");
const AIService = require("./ai-service");

const router = express.Router();
const aiService = new AIService();


// ============================================================================
// HELPER FUNCTIONS - Authentication and Logging
// ============================================================================

// ========================================================================
// ADMIN AUTHENTICATION - Verifies admin JWT tokens
// ========================================================================
function authenticateAdmin(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const adminId = decoded?.sub || decoded?.id; // support both shapes
    if (!adminId) return res.status(401).json({ error: 'Invalid token payload' });
    // Normalize shape so downstream uses req.admin.id
    req.admin = { id: adminId, username: decoded?.username, ...decoded };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ========================================================================
// ADMIN ACTIVITY LOGGING - Records all admin actions
// ========================================================================
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

// ============================================================================
// BASIC ENDPOINTS - Health check and root endpoint
// ============================================================================

// Root endpoint - Server health check
router.get("/", (req, res) => {
  res.send("UM AI Helpdesk Backend is running 🚀");
});

// ============================================================================
// DEBUG ENDPOINTS - For testing and development
// ============================================================================

// Debug database search functionality
router.post("/debug-search", async (req, res) => {
  const { question } = req.body;
  try {
    console.log(`🔍 Debug search for: "${question}"`);
    const dbResults = await searchDatabase(question);
    res.json({ question, results: dbResults });
  } catch (error) {
    console.error('Debug search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug professors database connection
router.get('/debug/professors-db', (req, res) => {
  console.log('🔍 Debug: Testing professors database connection...');
  const sql = `
    SELECT p.id, p.name, p.position, p.email,
           p.program,
           p.department_id,
           d.short_name AS department_short,
           d.name AS department_name
    FROM professors p
    LEFT JOIN departments d ON p.department_id = d.id
    ORDER BY p.name
    LIMIT 50`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('❌ Professors debug error:', err);
      return res.status(500).json({ ok: false, error: err.message });
    }
    console.log(`✅ Found ${rows?.length || 0} professors`);
    res.json({ ok: true, count: rows?.length || 0, sample: rows });
  });
});

// Debug AI professor search specifically
router.post('/debug/ai-professors', async (req, res) => {
  try {
    const question = (req.body && req.body.question) || 'who are the professors in BSIT';
    console.log(`🤖 Debug AI professors for: "${question}"`);
    const results = await searchDatabase(question);
    const prof = (results || []).find(r => r.table === 'professors');
    return res.json({ ok: true, question, professors: prof ? prof.data : [] });
  } catch (e) {
    console.error('❌ AI professors debug error:', e);
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

// ============================================================================
// AI CHAT ENDPOINT - Main AI functionality for users
// ============================================================================

// Main AI chat endpoint - combines database search with AI processing
router.post("/ask", async (req, res) => {
  const { question } = req.body;
  console.log(`🤖 AI Chat request: "${question}"`);

  try {
    // ========================================================================
    // SPECIAL CASES - Handle specific user inputs
    // ========================================================================
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

// ============================================================================
// ADMIN API ROUTES - CRUD operations for admin dashboard
// ============================================================================

// ========================================================================
// DEPARTMENTS API - Manage academic departments
// ========================================================================

// Get all departments
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
  const { name, short_name } = req.body;
  
  if (!name || !short_name) {
    return res.status(400).json({ error: 'name and short_name are required' });
  }

  db.query(
    'INSERT INTO departments (name, short_name, admin_id) VALUES (?, ?, ?)',
    [name, short_name, req.admin?.id || null],
    (err, result) => {
      if (err) {
        console.error('Error creating department:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      logAdminActivity(req.admin.id, 'CREATE', `Department: ${name} (${short_name})`, 'departments');
      res.json({ id: result.insertId, name, short_name, admin_id: req.admin?.id || null });
    }
  );
});

router.put('/api/departments/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { name, short_name } = req.body;
  
  if (!name || !short_name) {
    return res.status(400).json({ error: 'name and short_name are required' });
  }

  db.query(
    'UPDATE departments SET name = ?, short_name = ?, admin_id = ? WHERE id = ?',
    [name, short_name, req.admin?.id || null, id],
    (err, result) => {
      if (err) {
        console.error('Error updating department:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Department not found' });
      }
      
      logAdminActivity(req.admin.id, 'UPDATE', `Department: ${name} (${short_name})`, 'departments');
      res.json({ id, name, short_name });
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

// ========================================================================
// ROOMS API - Manage campus rooms
// ========================================================================

// Get all rooms with building information
router.get('/api/rooms', (req, res) => {
  db.query(`
    SELECT 
      r.id,
      r.name,
      r.building_id,
      r.floor,
      r.status,
      r.type,
      r.created_at,
      b.name AS building_name
    FROM rooms r
    LEFT JOIN buildings b ON r.building_id = b.id
    ORDER BY r.name
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
    'INSERT INTO rooms (name, building_id, floor, status, type, admin_id) VALUES (?, ?, ?, ?, ?, ?)',
    [name, building_id, floor, status ?? 'Vacant', type ?? 'Lecture', req.admin?.id || null],
    (err, result) => {
      if (err) {
        console.error('Error creating room:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      logAdminActivity(req.admin.id, 'CREATE', `Room: ${name}`, 'rooms');
      res.json({ id: result.insertId, name, building_id, floor, status: status ?? 'Vacant', type: type ?? 'Lecture', admin_id: req.admin?.id || null });
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
    'UPDATE rooms SET name = ?, building_id = ?, floor = ?, status = COALESCE(?, status), type = COALESCE(?, type), admin_id = ? WHERE id = ?',
    [name, building_id, floor, status ?? null, type ?? null, req.admin?.id || null, id],
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

// ========================================================================
// OFFICES API - Manage campus offices
// ========================================================================

// Get all offices with building information
router.get('/api/offices', (req, res) => {
  db.query(`
    SELECT 
      o.id,
      o.name,
      o.building_id,
      o.floor,
      o.created_at,
      b.name AS building_name
    FROM offices o
    LEFT JOIN buildings b ON o.building_id = b.id
    ORDER BY o.name
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
    'INSERT INTO offices (name, building_id, floor, admin_id) VALUES (?, ?, ?, ?)',
    [name, building_id, floor, req.admin?.id || null],
    (err, result) => {
      if (err) {
        console.error('Error creating office:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      logAdminActivity(req.admin.id, 'CREATE', `Office: ${name}`, 'offices');
      res.json({ id: result.insertId, name, building_id, floor, admin_id: req.admin?.id || null });
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
    'UPDATE offices SET name = ?, building_id = ?, floor = ?, admin_id = ? WHERE id = ?',
    [name, building_id, floor, req.admin?.id || null, id],
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

// ========================================================================
// BUILDINGS API - Manage campus buildings
// ========================================================================

// Get all buildings
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
    return res.status(400).json({ error: 'name is required' });
  }

  db.query(
    'INSERT INTO buildings (name, admin_id) VALUES (?, ?)',
    [name, req.admin?.id || null],
    (err, result) => {
      if (err) {
        console.error('Error creating building:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      logAdminActivity(req.admin.id, 'CREATE', `Building: ${name}`, 'buildings');
      res.json({ id: result.insertId, name, admin_id: req.admin?.id || null });
    }
  );
});

router.put('/api/buildings/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  db.query(
    'UPDATE buildings SET name = ?, admin_id = ? WHERE id = ?',
    [name, req.admin?.id || null, id],
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

// ========================================================================
// PROFESSORS API - Manage faculty members
// ========================================================================

// Get all professors with department information
router.get('/api/professors', (req, res) => {
  db.query(`
    SELECT p.id, p.name, p.position, p.email, p.program,
           d.short_name AS department,
           p.created_at
    FROM professors p
    LEFT JOIN departments d ON p.department_id = d.id
    ORDER BY p.name
  `, (err, results) => {
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

router.post('/api/professors/migrate', authenticateAdmin, (req, res) => {
  const { professors } = req.body;
  if (!Array.isArray(professors)) {
    return res.status(400).json({ error: 'Professors must be an array' });
  }

  let completed = 0;
  let errors = [];

  professors.forEach((prof, index) => {
    const { name, position, email, department } = prof; // department short_name
    db.query('SELECT id FROM departments WHERE short_name = ? LIMIT 1', [department], (findErr, rows) => {
      if (findErr) {
        completed++; errors.push({ index, error: findErr.message });
        return;
      }
      const departmentId = rows && rows[0] ? rows[0].id : null;
      db.query(
        'INSERT INTO professors (name, position, email, department_id, admin_id) VALUES (?, ?, ?, ?, ?)',
        [name, position, email, departmentId, req.admin?.id || null],
        (insErr) => {
          completed++;
          if (insErr) errors.push({ index, error: insErr.message });
          if (completed === professors.length) {
            if (errors.length > 0) return res.status(500).json({ error: 'Some professors failed to migrate', details: errors });
            return res.json({ message: 'All professors migrated successfully' });
          }
        }
      );
    });
  });
});

router.post('/api/professors', authenticateAdmin, (req, res) => {
  const { name, position, email, program, department } = req.body; // department short_name
  if (!name || !position || !email || !department) {
    return res.status(400).json({ error: 'name, position, email, department are required' });
  }
  db.query('SELECT id FROM departments WHERE short_name = ? LIMIT 1', [department], (findErr, rows) => {
    if (findErr) return res.status(500).json({ error: 'Database error' });
    const departmentId = rows && rows[0] ? rows[0].id : null;
    db.query(
      'INSERT INTO professors (name, position, email, program, department_id, admin_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, position, email, program ?? null, departmentId, req.admin?.id || null],
      (err, result) => {
        if (err) {
          console.error('Error creating professor:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        logAdminActivity(req.admin.id, 'CREATE', `Professor: ${name}`, 'professors');
        res.json({ id: result.insertId, name, position, email, program: program ?? '', department });
      }
    );
  });
});

router.put('/api/professors/:id', authenticateAdmin, (req, res) => {
  const { id } = req.params;
  const { name, position, email, program, department } = req.body; // department short_name
  if (!name || !position || !email || !department) {
    return res.status(400).json({ error: 'name, position, email, department are required' });
  }
  db.query('SELECT id FROM departments WHERE short_name = ? LIMIT 1', [department], (findErr, rows) => {
    if (findErr) return res.status(500).json({ error: 'Database error' });
    const departmentId = rows && rows[0] ? rows[0].id : null;
  db.query(
    'UPDATE professors SET name = ?, position = ?, email = ?, program = ?, department_id = ?, admin_id = ? WHERE id = ?',
    [name, position, email, program ?? null, departmentId, req.admin?.id || null, id],
      (err, result) => {
        if (err) {
          console.error('Error updating professor:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Professor not found' });
        }
        logAdminActivity(req.admin.id, 'UPDATE', `Professor: ${name}`, 'professors');
        res.json({ id, name, position, email, program: program ?? '', department });
      }
    );
  });
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

// ========================================================================
// RULES API - Manage campus rules and policies
// ========================================================================

// Get all rules
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
    'INSERT INTO rules (description, admin_id) VALUES (?, ?)',
    [description, req.admin?.id || null],
    (err, result) => {
      if (err) {
        console.error('Error creating rule:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      logAdminActivity(req.admin.id, 'CREATE', `Rule: ${description.substring(0, 50)}...`, 'rules');
      res.json({ id: result.insertId, description, admin_id: req.admin?.id || null });
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
    'UPDATE rules SET description = ?, admin_id = ? WHERE id = ?',
    [description, req.admin?.id || null, id],
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

// ========================================================================
// SETTINGS API - Manage system settings
// ========================================================================

// Get all settings
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
    'INSERT INTO settings (setting_name, setting_value, description, admin_id) VALUES (?, ?, ?, ?)',
    [setting_name, setting_value, description, req.admin?.id || null],
    (err, result) => {
      if (err) {
        console.error('Error creating setting:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      logAdminActivity(req.admin.id, 'CREATE', `Setting: ${setting_name}`, 'settings');
      res.json({ id: result.insertId, setting_name, setting_value, description, admin_id: req.admin?.id || null });
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
    'UPDATE settings SET setting_name = ?, setting_value = ?, description = ?, admin_id = ? WHERE id = ?',
    [setting_name, setting_value, description, req.admin?.id || null, id],
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

// ========================================================================
// LOGS API - View admin activity logs
// ========================================================================

// Get admin activity logs (Admin only)
router.get('/api/logs', authenticateAdmin, (req, res) => {
  db.query(`
    SELECT l.*, a.username AS admin_username 
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

// ============================================================================
// EXPORT ROUTER - Make endpoints available to server.js
// ============================================================================

module.exports = router;
