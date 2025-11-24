const express = require("express");
const prisma = require("../../config/prismaClient");
const { authenticateAdmin, logAdminActivity } = require("../middleware/adminAuth");

const router = express.Router();


router.get('/', async (_req, res) => {
  try {
    const settings = await prisma.settings.findMany({
      orderBy: { key_name: 'asc' },
    });
    res.json(
      settings.map((setting) => ({
        id: setting.id,
        setting_name: setting.key_name,
        setting_value: setting.value,
        description: setting.description,
        admin_id: setting.admin_id,
        created_at: setting.created_at,
      }))
    );
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', authenticateAdmin, async (req, res) => {
  const { setting_name, setting_value, description } = req.body;
  
  if (!setting_name || !setting_value) {
    return res.status(400).json({ error: 'Setting name and value are required' });
  }

  try {
    const setting = await prisma.settings.create({
      data: {
        key_name: setting_name,
        value: setting_value,
        description: description ?? null,
        admin_id: req.admin?.id || null,
      },
    });
    logAdminActivity(req.admin.id, 'CREATE', `Setting: ${setting_name}`, 'settings');
    res.json({
      id: setting.id,
      setting_name: setting.key_name,
      setting_value: setting.value,
      description: setting.description,
      admin_id: setting.admin_id,
      created_at: setting.created_at,
    });
  } catch (err) {
    console.error('Error creating setting:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { setting_name, setting_value, description } = req.body;
  
  if (!setting_name || !setting_value) {
    return res.status(400).json({ error: 'Setting name and value are required' });
  }

  try {
    const setting = await prisma.settings.update({
      where: { id: Number(id) },
      data: {
        key_name: setting_name,
        value: setting_value,
        description: description ?? null,
        admin_id: req.admin?.id || null,
      },
    });
    logAdminActivity(req.admin.id, 'UPDATE', `Setting: ${setting_name}`, 'settings');
    res.json({
      id: setting.id,
      setting_name: setting.key_name,
      setting_value: setting.value,
      description: setting.description,
      admin_id: setting.admin_id,
      created_at: setting.created_at,
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Setting not found' });
    }
    console.error('Error updating setting:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.settings.delete({
      where: { id: Number(id) },
    });
    logAdminActivity(req.admin.id, 'DELETE', `Setting ID: ${id}`, 'settings');
    res.json({ message: 'Setting deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Setting not found' });
    }
    console.error('Error deleting setting:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;

