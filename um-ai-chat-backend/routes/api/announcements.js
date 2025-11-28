const express = require("express");
const prisma = require("../../config/prismaClient");
const { authenticateAdmin, logAdminActivity } = require("../middleware/adminAuth");

const router = express.Router();

router.get('/', async (_req, res) => {
  try {
    const announcements = await prisma.announcements.findMany({
      orderBy: { created_at: 'desc' },
    });
    res.json(announcements);
  } catch (err) {
    console.error('Error fetching announcements:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', authenticateAdmin, async (req, res) => {
  const { title, description } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  try {
    const announcement = await prisma.announcements.create({
      data: {
        title,
        description,
        admin_id: req.admin?.id || null,
      },
    });
    logAdminActivity(req.admin.id, 'CREATE', `Announcement: ${title.substring(0, 50)}...`, 'announcements');
    res.json(announcement);
  } catch (err) {
    console.error('Error creating announcement:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }

  try {
    const announcement = await prisma.announcements.update({
      where: { id: Number(id) },
      data: {
        title,
        description,
        admin_id: req.admin?.id || null,
      },
    });
    logAdminActivity(req.admin.id, 'UPDATE', `Announcement: ${title.substring(0, 50)}...`, 'announcements');
    res.json(announcement);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    console.error('Error updating announcement:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.announcements.delete({
      where: { id: Number(id) },
    });
    logAdminActivity(req.admin.id, 'DELETE', `Announcement ID: ${id}`, 'announcements');
    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    console.error('Error deleting announcement:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;



