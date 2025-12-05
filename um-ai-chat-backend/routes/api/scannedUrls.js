const express = require("express");
const prisma = require("../../config/prismaClient");
const { authenticateAdmin, logAdminActivity } = require("../middleware/adminAuth");

const router = express.Router();

// Get all scanned URLs
router.get('/', async (_req, res) => {
  try {
    const urls = await prisma.scanned_urls.findMany({
      orderBy: { created_at: 'desc' },
    });
    res.json(urls);
  } catch (err) {
    console.error('Error fetching scanned URLs:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get active scanned URLs only
router.get('/active', async (_req, res) => {
  try {
    const urls = await prisma.scanned_urls.findMany({
      where: { is_active: true },
      orderBy: { created_at: 'desc' },
    });
    res.json(urls);
  } catch (err) {
    console.error('Error fetching active scanned URLs:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create a new scanned URL
router.post('/', authenticateAdmin, async (req, res) => {
  const { url, title, description } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  try {
    const scannedUrl = await prisma.scanned_urls.create({
      data: {
        url: url.trim(),
        title: title?.trim() || null,
        description: description?.trim() || null,
        is_active: true,
        admin_id: req.admin?.id || null,
      },
    });
    logAdminActivity(req.admin.id, 'CREATE', `Scanned URL: ${url}`, 'scanned_urls');
    res.json(scannedUrl);
  } catch (err) {
    console.error('Error creating scanned URL:', err);
    if (err.code === 'P2002') {
      res.status(400).json({ error: 'URL already exists' });
    } else {
      res.status(500).json({ error: 'Database error' });
    }
  }
});

// Update a scanned URL
router.put('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { url, title, description, is_active } = req.body;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  if (url) {
    // Validate URL format if provided
    try {
      new URL(url);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
  }

  try {
    const updateData = {
      updated_at: new Date(),
    };

    if (url !== undefined) updateData.url = url.trim();
    if (title !== undefined) updateData.title = title?.trim() || null;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);

    const scannedUrl = await prisma.scanned_urls.update({
      where: { id: Number(id) },
      data: updateData,
    });
    logAdminActivity(req.admin.id, 'UPDATE', `Scanned URL ID: ${id}`, 'scanned_urls');
    res.json(scannedUrl);
  } catch (err) {
    console.error('Error updating scanned URL:', err);
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Scanned URL not found' });
    } else {
      res.status(500).json({ error: 'Database error' });
    }
  }
});

// Delete a scanned URL
router.delete('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  try {
    await prisma.scanned_urls.delete({
      where: { id: Number(id) },
    });
    logAdminActivity(req.admin.id, 'DELETE', `Scanned URL ID: ${id}`, 'scanned_urls');
    res.json({ message: 'Scanned URL deleted successfully' });
  } catch (err) {
    console.error('Error deleting scanned URL:', err);
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Scanned URL not found' });
    } else {
      res.status(500).json({ error: 'Database error' });
    }
  }
});

module.exports = router;

