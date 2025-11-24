const express = require("express");
const prisma = require("../../config/prismaClient");
const { authenticateAdmin, logAdminActivity } = require("../middleware/adminAuth");

const router = express.Router();


router.get('/', async (_req, res) => {
  try {
    const rules = await prisma.rules.findMany({
      orderBy: { id: 'asc' },
    });
    res.json(rules);
  } catch (err) {
    console.error('Error fetching rules:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', authenticateAdmin, async (req, res) => {
  const { description } = req.body;
  
  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  try {
    const rule = await prisma.rules.create({
      data: {
        description,
        admin_id: req.admin?.id || null,
      },
    });
    logAdminActivity(req.admin.id, 'CREATE', `Rule: ${description.substring(0, 50)}...`, 'rules');
    res.json(rule);
  } catch (err) {
    console.error('Error creating rule:', err);
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
    const rule = await prisma.rules.update({
      where: { id: Number(id) },
      data: {
        description,
        admin_id: req.admin?.id || null,
      },
    });
    logAdminActivity(req.admin.id, 'UPDATE', `Rule: ${description.substring(0, 50)}...`, 'rules');
    res.json(rule);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Rule not found' });
    }
    console.error('Error updating rule:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.rules.delete({
      where: { id: Number(id) },
    });
    logAdminActivity(req.admin.id, 'DELETE', `Rule ID: ${id}`, 'rules');
    res.json({ message: 'Rule deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Rule not found' });
    }
    console.error('Error deleting rule:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;

