const express = require("express");
const db = require("../../config/database");
const { authenticateAdmin } = require("../middleware/adminAuth");

const router = express.Router();

// Get admin activity logs (Admin only)
router.get('/', authenticateAdmin, (req, res) => {
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

module.exports = router;

