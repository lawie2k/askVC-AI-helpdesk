const express = require("express");
const prisma = require("../../config/prismaClient");
const { authenticateAdmin, logAdminActivity } = require("../middleware/adminAuth");

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const items = await prisma.vision_mission.findMany({
      orderBy: { id: 'asc' },
    });
    res.json(items);
  } catch (err) {
    console.error('Error fetching vision/mission entries:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', authenticateAdmin, async (req, res) => {
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    const item = await prisma.vision_mission.create({
      data: {
        description,
        admin_id: req.admin?.id || null,
      },
    });
    logAdminActivity(req.admin.id, 'CREATE', `Vision/Mission entry`, 'vision_mission');
    res.json(item);
  } catch (err) {
    console.error('Error creating vision/mission entry:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    const item = await prisma.vision_mission.update({
      where: { id: Number(id) },
      data: {
        description,
        admin_id: req.admin?.id || null,
      },
    });
    logAdminActivity(req.admin.id, 'UPDATE', `Vision/Mission entry ID: ${id}`, 'vision_mission');
    res.json(item);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Entry not found' });
    }
    console.error('Error updating vision/missions entry:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.vision_mission.delete({
      where: { id: Number(id) },
    });
    logAdminActivity(req.admin.id, 'DELETE', `Vision/Mission entry ID: ${id}`, 'vision_mission');
    res.json({ message: 'Entry deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Entry not found' });
    }
    console.error('Error deleting vision/missions entry:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
