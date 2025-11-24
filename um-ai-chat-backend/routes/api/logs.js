const express = require("express");
const prisma = require("../../config/prismaClient");

const router = express.Router();


router.get('/', async (_req, res) => {
  try {
    const logs = await prisma.logs.findMany({
      select: {
        id: true,
        action: true,
        details: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
      take: 100,
    });
    res.json(logs);
  } catch (err) {
    console.error('Error fetching logs:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;

