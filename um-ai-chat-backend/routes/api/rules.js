const express = require("express");
const db = require("../../config/database");
const { authenticateAdmin, logAdminActivity } = require("../middleware/adminAuth");

const router = express.Router();

// Get all rules
router.get('/', (req, res) => {
  db.query('SELECT * FROM rules ORDER BY id', (err, results) => {
    if (err) {
      console.error('Error fetching rules:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results || []);
  });
});

router.post('/', authenticateAdmin, (req, res) => {
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

router.put('/:id', authenticateAdmin, (req, res) => {
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

router.delete('/:id', authenticateAdmin, (req, res) => {
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

module.exports = router;

