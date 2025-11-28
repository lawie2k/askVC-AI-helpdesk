const express = require("express");
const prisma = require("../../config/prismaClient");
const { authenticateUser } = require("../middleware/userAuth");

const router = express.Router();

// ============================================================================
// GET CHAT HISTORY - Retrieve user's chat history
// ============================================================================
router.get("/", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const history = await prisma.historyChats.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        question: true,
        answer: true,
        created_at: true,
      },
    });

    const total = await prisma.historyChats.count({
      where: { user_id: userId },
    });

    res.json({
      history: history.reverse(), // Reverse to show oldest first
      total,
      hasMore: offset + limit < total,
    });
  } catch (err) {
    console.error("Error fetching chat history:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ============================================================================
// SAVE CHAT MESSAGE - Save a Q&A pair to history
// ============================================================================
router.post("/", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { question, answer } = req.body;

    if (!question || !answer) {
      return res.status(400).json({ error: "Question and answer are required" });
    }

    const saved = await prisma.historyChats.create({
      data: {
        user_id: userId,
        question,
        answer,
      },
      select: {
        id: true,
        question: true,
        answer: true,
        created_at: true,
      },
    });

    res.json(saved);
  } catch (err) {
    console.error("Error saving chat history:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ============================================================================
// DELETE CHAT HISTORY - Clear user's chat history
// ============================================================================
router.delete("/", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.historyChats.deleteMany({
      where: { user_id: userId },
    });

    res.json({ message: "Chat history cleared successfully" });
  } catch (err) {
    console.error("Error clearing chat history:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ============================================================================
// DELETE SINGLE MESSAGE - Delete a specific chat message
// ============================================================================
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const messageId = parseInt(req.params.id);

    // Verify the message belongs to the user
    const message = await prisma.historyChats.findFirst({
      where: { id: messageId, user_id: userId },
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    await prisma.historyChats.delete({
      where: { id: messageId },
    });

    res.json({ message: "Message deleted successfully" });
  } catch (err) {
    console.error("Error deleting chat message:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;


