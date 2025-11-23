const express = require("express");
const db = require("../../config/database");
const { authenticateAdmin, logAdminActivity } = require("../middleware/adminAuth");

const router = express.Router();

// Get all departments
router.get('/', (req, res) => {
  db.query('SELECT * FROM departments ORDER BY name', (err, results) => {
    if (err) {
      console.error('Error fetching departments:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results || []);
  });
});

router.post('/', authenticateAdmin, (req, res) => {
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

router.put('/:id', authenticateAdmin, (req, res) => {
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

router.get('/structure', (req, res) => {
  db.query('DESCRIBE departments', (err, results) => {
    if (err) {
      console.error('Error fetching department structure:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

router.delete('/:id', authenticateAdmin, (req, res) => {
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

module.exports = router;

