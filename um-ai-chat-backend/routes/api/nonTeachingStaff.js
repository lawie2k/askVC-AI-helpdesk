const express = require("express");
const prisma = require("../../config/prismaClient");
const { authenticateAdmin, logAdminActivity } = require("../middleware/adminAuth");

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const staff = await prisma.non_teaching_staff.findMany({
      orderBy: { id: 'asc' },
    });
    res.json(staff);
  } catch (err) {
    console.error('Error fetching non-teaching staff:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', authenticateAdmin, async (req, res) => {
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: 'Name and role are required' });
  }

  try {
    const staff = await prisma.non_teaching_staff.create({
      data: {
        name,
        role,
        admin_id: req.admin?.id || null,
      },
    });
    logAdminActivity(req.admin.id, 'CREATE', `Staff: ${name}`, 'non_teaching_staff');
    res.json(staff);
  } catch (err) {
    console.error('Error creating staff:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, role } = req.body;

  if (!name || !role) {
    return res.status(400).json({ error: 'Name and role are required' });
  }

  try {
    const staff = await prisma.non_teaching_staff.update({
      where: { id: Number(id) },
      data: {
        name,
        role,
        admin_id: req.admin?.id || null,
      },
    });
    logAdminActivity(req.admin.id, 'UPDATE', `Staff ID: ${id}`, 'non_teaching_staff');
    res.json(staff);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Staff not found' });
    }
    console.error('Error updating staff:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.non_teaching_staff.delete({
      where: { id: Number(id) },
    });
    logAdminActivity(req.admin.id, 'DELETE', `Staff ID: ${id}`, 'non_teaching_staff');
    res.json({ message: 'Staff deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Staff not found' });
    }
    console.error('Error deleting staff:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;













