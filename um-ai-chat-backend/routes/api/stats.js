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

module.exports = router;


