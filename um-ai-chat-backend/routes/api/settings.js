const express = require("express");
const db = require("../../config/database");
const { authenticateAdmin, logAdminActivity } = require("../middleware/adminAuth");

const router = express.Router();

// Get all settings
router.get('/', (req, res) => {
  db.query('SELECT * FROM settings ORDER BY setting_name', (err, results) => {
    if (err) {
      console.error('Error fetching settings:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results || []);
  });
});

router.post('/', authenticateAdmin, (req, res) => {
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

router.put('/:id', authenticateAdmin, (req, res) => {
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

router.delete('/:id', authenticateAdmin, (req, res) => {
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

module.exports = router;

