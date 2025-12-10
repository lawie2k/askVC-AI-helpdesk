const express = require("express");
const prisma = require("../../config/prismaClient");

const router = express.Router();

// Public endpoint to create feedback (no auth required)
router.post("/", async (req, res) => {
  try {
    const { message, rating, user_email } = req.body || {};

    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Feedback message is required" });
    }

    const feedback = await prisma.feedback.create({
      data: {
        message: message.trim(),
        rating: typeof rating === "number" ? rating : null,
        user_email: user_email && typeof user_email === "string" ? user_email.trim() : null,
      },
    });

    return res.json(feedback);
  } catch (err) {
    console.error("Error creating feedback:", err);
    return res.status(500).json({ error: "Failed to save feedback" });
  }
});

// Admin endpoint to list feedback
router.get("/", async (_req, res) => {
  try {
    const items = await prisma.feedback.findMany({
      orderBy: { created_at: "desc" },
    });
    return res.json(items);
  } catch (err) {
    console.error("Error fetching feedback:", err);
    return res.status(500).json({ error: "Failed to load feedback" });
  }
});

module.exports = router;















