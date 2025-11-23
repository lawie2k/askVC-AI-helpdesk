const jwt = require("jsonwebtoken");
const db = require("../../config/database");

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

module.exports = { authenticateAdmin, logAdminActivity };

