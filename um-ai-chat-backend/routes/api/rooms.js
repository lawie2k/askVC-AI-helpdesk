const express = require("express");
const prisma = require("../../config/prismaClient");
const { authenticateAdmin, logAdminActivity } = require("../middleware/adminAuth");

const router = express.Router();

// ============================================================================
// GET ALL ROOMS
// ============================================================================
router.get("/", async (_req, res) => {
  try {
    const rooms = await prisma.rooms.findMany({
      include: {
        buildings: {
          select: { name: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const shaped = rooms.map((room) => {
      const { buildings, ...rest } = room;
      return {
        ...rest,
        building_name: buildings?.name || null,
      };
    });

    res.json(shaped);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ============================================================================
// DESCRIBE TABLE STRUCTURE (admin utility)
// ============================================================================
router.get("/structure", async (_req, res) => {
  try {
    const structure = await prisma.$queryRawUnsafe("DESCRIBE rooms");
    res.json(structure);
  } catch (err) {
    console.error("Error fetching room structure:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ============================================================================
// CREATE ROOM (NO AVAILABILITY/STATUS)
// ============================================================================
router.post("/", authenticateAdmin, async (req, res) => {
  const { name, building_id, floor, type, image_url } = req.body;

  if (!name || !building_id || !floor) {
    return res.status(400).json({ error: "Name, building, and floor are required" });
  }

  try {
    const room = await prisma.rooms.create({
      data: {
        name,
        building_id: Number(building_id),
        floor,
        type: type ?? "Lecture",
        image_url: image_url || null,
        admin_id: req.admin?.id || null,
      },
    });

    logAdminActivity(req.admin.id, "CREATE", `Room: ${name}`, "rooms");
    res.json(room);
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ============================================================================
// UPDATE ROOM
// ============================================================================
router.put("/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, building_id, floor, type, image_url } = req.body;

  if (!name || !building_id || !floor) {
    return res.status(400).json({ error: "Name, building, and floor are required" });
  }

  try {
    const updated = await prisma.rooms.update({
      where: { id: Number(id) },
      data: {
        name,
        building_id: Number(building_id),
        floor,
        type: type ?? "Lecture",
        image_url: image_url || null,
        admin_id: req.admin?.id || null,
      },
    });

    logAdminActivity(req.admin.id, "UPDATE", `Room: ${name}`, "rooms");
    res.json(updated);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Room not found" });
    }
    console.error("Error updating room:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// ============================================================================
// DELETE ROOM
// ============================================================================
router.delete("/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.rooms.delete({
      where: { id: Number(id) },
    });
    logAdminActivity(req.admin.id, "DELETE", `Room ID: ${id}`, "rooms");
    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Room not found" });
    }
    console.error("Error deleting room:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;


