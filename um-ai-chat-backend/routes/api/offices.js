const express = require("express");
const prisma = require("../../config/prismaClient");
const { authenticateAdmin, logAdminActivity } = require("../middleware/adminAuth");

const router = express.Router();


router.get('/', async (_req, res) => {
  try {
    const offices = await prisma.offices.findMany({
      include: {
        buildings: {
          select: { name: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    const shaped = offices.map((office) => {
      const { buildings, ...rest } = office;
      return {
        ...rest,
        building_name: buildings?.name || null,
      };
    });

    res.json(shaped);
  } catch (err) {
    console.error('Error fetching offices:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/', authenticateAdmin, async (req, res) => {
  const { name, building_id, floor, open_time, close_time, lunch_start, lunch_end, image_url } = req.body;
  
  if (!name || !building_id || !floor) {
    return res.status(400).json({ error: 'Name, building, and floor are required' });
  }

  try {
    const office = await prisma.offices.create({
      data: {
        name,
        floor,
        open_time: open_time || null,
        close_time: close_time || null,
        lunch_start: lunch_start || null,
        lunch_end: lunch_end || null,
        image_url: image_url || null,
        // relations
        admins: req.admin?.id
          ? {
              connect: { id: Number(req.admin.id) },
            }
          : undefined,
        buildings: building_id
          ? {
              connect: { id: Number(building_id) },
            }
          : undefined,
      },
    });

    logAdminActivity(req.admin.id, 'CREATE', `Office: ${name}`, 'offices');
    res.json(office);
  } catch (err) {
    console.error('Error creating office:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, building_id, floor, open_time, close_time, lunch_start, lunch_end, image_url } = req.body;
  
  if (!name || !building_id || !floor) {
    return res.status(400).json({ error: 'Name, building, and floor are required' });
  }

  try {
    const office = await prisma.offices.update({
      where: { id: Number(id) },
      data: {
        name,
        floor,
        open_time: open_time || null,
        close_time: close_time || null,
        lunch_start: lunch_start || null,
        lunch_end: lunch_end || null,
        image_url: image_url || null,
        admins: req.admin?.id
          ? {
              connect: { id: Number(req.admin.id) },
            }
          : undefined,
        buildings: building_id
          ? {
              connect: { id: Number(building_id) },
            }
          : undefined,
      },
    });

    logAdminActivity(req.admin.id, 'UPDATE', `Office: ${name}`, 'offices');
    res.json(office);
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Office not found' });
    }
    console.error('Error updating office:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.offices.delete({
      where: { id: Number(id) },
    });
    logAdminActivity(req.admin.id, 'DELETE', `Office ID: ${id}`, 'offices');
    res.json({ message: 'Office deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Office not found' });
    }
    console.error('Error deleting office:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;

