const express = require("express");
const prisma = require("../../config/prismaClient");
const { authenticateAdmin, logAdminActivity } = require("../middleware/adminAuth");

const router = express.Router();

// Get all officers (optionally filter by organization)
router.get("/", async (req, res) => {
  try {
    const { organization } = req.query;
    const where = organization ? { organization } : {};
    const officers = await prisma.officers.findMany({
      where,
      orderBy: [{ organization: "asc" }, { position_order: "asc" }, { id: "asc" }],
    });
    res.json(officers);
  } catch (err) {
    console.error("Error fetching officers:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Create officer
router.post("/", authenticateAdmin, async (req, res) => {
  const { name, position, organization, position_order } = req.body;

  if (!name || !position || !organization) {
    return res
      .status(400)
      .json({ error: "Name, position, and organization are required" });
  }

  try {
    const officer = await prisma.officers.create({
      data: {
        name,
        position,
        organization,
        position_order: typeof position_order === "number" ? position_order : 0,
        admin_id: req.admin?.id || null,
      },
    });
    logAdminActivity(
      req.admin.id,
      "CREATE",
      `Officer: ${organization} - ${name}`,
      "officers"
    );
    res.json(officer);
  } catch (err) {
    console.error("Error creating officer:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Update officer
router.put("/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, position, organization, position_order } = req.body;

  if (!name || !position || !organization) {
    return res
      .status(400)
      .json({ error: "Name, position, and organization are required" });
  }

  try {
    const officer = await prisma.officers.update({
      where: { id: Number(id) },
      data: {
        name,
        position,
        organization,
        position_order: typeof position_order === "number" ? position_order : 0,
        admin_id: req.admin?.id || null,
      },
    });
    logAdminActivity(
      req.admin.id,
      "UPDATE",
      `Officer: ${organization} - ${name}`,
      "officers"
    );
    res.json(officer);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Officer not found" });
    }
    console.error("Error updating officer:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete officer
router.delete("/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.officers.delete({
      where: { id: Number(id) },
    });
    logAdminActivity(
      req.admin.id,
      "DELETE",
      `Officer ID: ${id}`,
      "officers"
    );
    res.json({ message: "Officer deleted successfully" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Officer not found" });
    }
    console.error("Error deleting officer:", err);
    res.status(500).json({ error: "Database error" });
  }
});

module.exports = router;







