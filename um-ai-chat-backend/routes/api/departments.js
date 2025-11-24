const express = require("express");
const prisma = require("../../config/prismaClient");
const { authenticateAdmin, logAdminActivity } = require("../middleware/adminAuth");

const router = express.Router();


router.get('/', async (_req, res) => {
  try {
    const departments = await prisma.departments.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(departments);
  } catch (err) {
    console.error('Error fetching departments:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', authenticateAdmin, async (req, res) => {
  const { name, short_name } = req.body;
  
  if (!name || !short_name) {
    return res.status(400).json({ error: 'name and short_name are required' });
  }

  try {
    const department = await prisma.departments.create({
      data: {
        name,
        short_name,
        admin_id: req.admin?.id || null,
      },
    });

    logAdminActivity(req?.admin?.id, 'CREATE', `Department: ${name} (${short_name})`, 'departments');
    res.json(department);
  } catch (err) {
    console.error('Error creating department:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, short_name } = req.body;
  
  if (!name || !short_name) {
    return res.status(400).json({ error: 'name and short_name are required' });
  }

  try {
    const updated = await prisma.departments.update({
      where: { id: Number(id) },
      data: {
        name,
        short_name,
        admin_id: req.admin?.id || null,
      },
    });

    logAdminActivity(req?.admin?.id, 'UPDATE', `Department: ${name} (${short_name})`, 'departments');
    res.json(updated);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Department not found' });
    }
    console.error('Error updating department:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/structure', async (_req, res) => {
  try {
    const structure = await prisma.$queryRawUnsafe('DESCRIBE departments');
    res.json(structure);
  } catch (err) {
    console.error('Error fetching department structure:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.departments.delete({
      where: { id: Number(id) },
    });
    logAdminActivity(req?.admin?.id, 'DELETE', `Department ID: ${id}`, 'departments');
    res.json({ message: 'Department deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Department not found' });
    }
    console.error('Error deleting department:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;

