const express = require("express");
const prisma = require("../../config/prismaClient");

const router = express.Router();

// ============================================================================
// STATS: Top AI questions (for admin dashboard)
// ============================================================================
router.get("/top-questions", async (_req, res) => {
  try {
    const results = await prisma.historyChats.groupBy({
      by: ["question"],
      _count: { question: true },
      orderBy: { _count: { question: "desc" } },
      take: 3,
    });

    const banned = ["asshole", "fuck you", "retartd"];

    const shaped = results
      .map((row) => ({
        question: row.question || "",
        count: row._count.question,
      }))
      .filter((row) => {
        const lower = row.question.toLowerCase();
        return !banned.some((w) => lower.includes(w));
      });

    return res.json(shaped);
  } catch (err) {
    console.error("Error fetching top questions stats:", err);
    return res.status(500).json({ error: "Database error" });
  }
});

// ============================================================================
// STATS: User signups per day
// ============================================================================
router.get("/signups-per-day", async (req, res) => {
  try {
    const days = parseInt(req.query.days || "7", 10);
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Group by calendar date of created_at
    const rows = await prisma.$queryRaw`
      SELECT DATE(created_at) AS date, COUNT(*) AS count
      FROM users
      WHERE created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    const shaped = rows.map((row) => ({
      date: row.date,
      count: Number(row.count) || 0,
    }));

    return res.json(shaped);
  } catch (err) {
    console.error("Error fetching signups-per-day stats:", err);
    return res.status(500).json({ error: "Database error" });
  }
});

// ============================================================================
// STATS: Daily Active Users (based on last_active_at)
// ============================================================================
router.get("/daily-active-users", async (req, res) => {
  try {
    const days = parseInt(req.query.days || "7", 10);
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Count distinct users per calendar date based on last_active_at
    const rows = await prisma.$queryRaw`
      SELECT DATE(last_active_at) AS date, COUNT(DISTINCT id) AS count
      FROM users
      WHERE last_active_at IS NOT NULL
        AND last_active_at >= ${since}
      GROUP BY DATE(last_active_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    const shaped = rows.map((row) => ({
      date: row.date,
      count: Number(row.count) || 0,
    }));

    return res.json(shaped);
  } catch (err) {
    console.error("Error fetching daily-active-users stats:", err);
    return res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;


