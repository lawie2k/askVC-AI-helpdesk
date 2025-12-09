const jwt = require("jsonwebtoken");
const prisma = require("../../config/prismaClient");

// ========================================================================
// USER AUTHENTICATION - Verifies user JWT tokens
// ========================================================================
async function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const userId = decoded?.sub || decoded?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    // Verify user exists in database
    const user = await prisma.users.findUnique({
      where: { id: Number(userId) },
      select: { id: true, email: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

module.exports = { authenticateUser };















