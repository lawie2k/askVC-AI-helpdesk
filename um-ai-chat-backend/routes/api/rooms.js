const express = require("express");
const db = require("../../config/database");
const { authenticateAdmin, logAdminActivity } = require("../middleware/adminAuth");

const router = express.Router();

// Get all rooms with building information
router.get('/', (req, res) => {
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

router.get('/structure', (req, res) => {
  db.query('DESCRIBE rooms', (err, results) => {
    if (err) {
      console.error('Error fetching room structure:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

router.post('/', authenticateAdmin, (req, res) => {
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

router.put('/:id', authenticateAdmin, (req, res) => {
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

router.delete('/:id', authenticateAdmin, (req, res) => {
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

module.exports = router;

