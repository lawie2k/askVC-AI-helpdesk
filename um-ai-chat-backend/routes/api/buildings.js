const express = require("express");
const db = require("../../config/database");
const { authenticateAdmin, logAdminActivity } = require("../middleware/adminAuth");

const router = express.Router();

// Get all buildings
router.get('/', (req, res) => {
  db.query('SELECT * FROM buildings ORDER BY name', (err, results) => {
    if (err) {
      console.error('Error fetching buildings:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results || []);
  });
});

router.post('/', authenticateAdmin, (req, res) => {
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

router.put('/:id', authenticateAdmin, (req, res) => {
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

router.delete('/:id', authenticateAdmin, (req, res) => {
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

module.exports = router;

