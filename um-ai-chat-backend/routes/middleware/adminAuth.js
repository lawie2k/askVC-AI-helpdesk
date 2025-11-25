const jwt = require("jsonwebtoken");
const prisma = require("../../config/prismaClient");

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

    req.admin = { id: adminId, username: decoded?.username, ...decoded };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ========================================================================
// ADMIN ACTIVITY LOGGING - Records all admin actions
// ========================================================================
async function logAdminActivity(adminId, action, details, tableName = null) {
  try {
    const logDetails = tableName ? `${action} on ${tableName}: ${details}` : details;
    await prisma.logs.create({
      data: {
        admin_id: adminId || null,
        action,
        details: logDetails,
      },
    });
  } catch (err) {
    console.error('Failed to log admin activity:', err);
  }
}

module.exports = { authenticateAdmin, logAdminActivity };

