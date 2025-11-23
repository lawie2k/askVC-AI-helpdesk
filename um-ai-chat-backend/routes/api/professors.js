const express = require("express");
const db = require("../../config/database");
const { authenticateAdmin, logAdminActivity } = require("../middleware/adminAuth");

const router = express.Router();

// Get all professors with department information
router.get('/', (req, res) => {
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

router.get('/structure', (req, res) => {
  db.query('DESCRIBE professors', (err, results) => {
    if (err) {
      console.error('Error fetching professor structure:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

router.post('/migrate', authenticateAdmin, (req, res) => {
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

router.post('/', authenticateAdmin, (req, res) => {
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

router.put('/:id', authenticateAdmin, (req, res) => {
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

router.delete('/:id', authenticateAdmin, (req, res) => {
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

module.exports = router;

