const express = require("express");
const prisma = require("../../config/prismaClient");
const { authenticateAdmin, logAdminActivity } = require("../middleware/adminAuth");

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const buildings = await prisma.buildings.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(buildings);
  } catch (err) {
    console.error('Error fetching buildings:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', authenticateAdmin, async (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  try {
    const building = await prisma.buildings.create({
      data: {
        name,
        admin_id: req.admin?.id || null,
      },
    });
    logAdminActivity(req?.admin?.id, 'CREATE', `Building: ${name}`, 'buildings');
    res.json(building);
  } catch (err) {
    console.error('Error creating building:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'name is required' });
  }

  try {
    const building = await prisma.buildings.update({
      where: { id: Number(id) },
      data: {
        name,
        admin_id: req.admin?.id || null,
      },
    });
    logAdminActivity(req?.admin?.id, 'UPDATE', `Building: ${name}`, 'buildings');
    res.json(building);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Building not found' });
    }
    console.error('Error updating building:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.buildings.delete({
      where: { id: Number(id) },
    });
    logAdminActivity(req?.admin?.id, 'DELETE', `Building ID: ${id}`, 'buildings');
    res.json({ message: 'Building deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Building not found' });
    }
    console.error('Error deleting building:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;

