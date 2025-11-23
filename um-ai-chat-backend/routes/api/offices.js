const express = require("express");
const db = require("../../config/database");
const { authenticateAdmin, logAdminActivity } = require("../middleware/adminAuth");

const router = express.Router();

// Get all offices with building information
router.get('/', (req, res) => {
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

router.post('/', authenticateAdmin, (req, res) => {
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

router.put('/:id', authenticateAdmin, (req, res) => {
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

router.delete('/:id', authenticateAdmin, (req, res) => {
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

module.exports = router;

