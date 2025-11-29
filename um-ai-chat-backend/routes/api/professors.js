const express = require("express");
const prisma = require("../../config/prismaClient");
const { authenticateAdmin, logAdminActivity } = require("../middleware/adminAuth");

const router = express.Router();



async function findDepartmentIdByShortName(shortName) {
  if (!shortName) return null;
  const department = await prisma.departments.findFirst({
    where: { short_name: shortName },
    select: { id: true },
  });
  return department?.id ?? null;
}


router.get('/', async (_req, res) => {
  try {
    const professors = await prisma.professors.findMany({
      orderBy: { name: 'asc' },
    });

    // Get departments
    const departmentIds = [...new Set(professors.map(p => p.department_id).filter(Boolean))];
    const departments = departmentIds.length > 0 
      ? await prisma.departments.findMany({
          where: { id: { in: departmentIds } },
          select: { id: true, short_name: true },
        })
      : [];
    
    const deptMap = departments.reduce((acc, d) => {
      acc[d.id] = d.short_name;
      return acc;
    }, {});

    const result = professors.map((p) => ({
      ...p,
      department: p.department_id ? (deptMap[p.department_id] || null) : null,
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching professors:', err);
    res.status(500).json({ error: err.message || 'Database error' });
  }
});

router.get('/structure', async (_req, res) => {
  try {
    const structure = await prisma.$queryRawUnsafe('DESCRIBE professors');
    res.json(structure);
  } catch (err) {
    console.error('Error fetching professor structure:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.post('/migrate', authenticateAdmin, async (req, res) => {
  const { professors } = req.body;
  if (!Array.isArray(professors)) {
    return res.status(400).json({ error: 'Professors must be an array' });
  }

  const errors = [];

  for (let i = 0; i < professors.length; i++) {
    const prof = professors[i];
    const { name, position, email, department } = prof;
    try {
      const departmentId = await findDepartmentIdByShortName(department);
      await prisma.professors.create({
        data: {
          name,
          position,
          email,
          department_id: departmentId,
          admin_id: req.admin?.id || null,
        },
      });
    } catch (err) {
      errors.push({ index: i, error: err.message });
    }
  }

  if (errors.length > 0) {
    return res.status(500).json({ error: 'Some professors failed to migrate', details: errors });
  }

  res.json({ message: 'All professors migrated successfully' });
});

router.post('/', authenticateAdmin, async (req, res) => {
  const { name, position, email, program, department } = req.body; // department short_name
  if (!name || !position || !department) {
    return res.status(400).json({ error: 'name, position, department are required' });
  }

  try {
    const departmentId = await findDepartmentIdByShortName(department);
    const professor = await prisma.professors.create({
      data: {
        name,
        position,
        email: email ?? null,
        program: program ?? null,
        department_id: departmentId,
        admin_id: req.admin?.id || null,
      },
    });
    logAdminActivity(req.admin.id, 'CREATE', `Professor: ${name}`, 'professors');
    res.json({
      ...professor,
      department,
      program: professor.program ?? '',
    });
  } catch (err) {
    console.error('Error creating professor:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.put('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, position, email, program, department } = req.body; // department short_name
  if (!name || !position || !department) {
    return res.status(400).json({ error: 'name, position, department are required' });
  }

  try {
    const departmentId = await findDepartmentIdByShortName(department);
    const professor = await prisma.professors.update({
      where: { id: Number(id) },
      data: {
        name,
        position,
        email: email ?? null,
        program: program ?? null,
        department_id: departmentId,
        admin_id: req.admin?.id || null,
      },
    });
    logAdminActivity(req.admin.id, 'UPDATE', `Professor: ${name}`, 'professors');
    res.json({
      ...professor,
      department,
      program: professor.program ?? '',
    });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Professor not found' });
    }
    console.error('Error updating professor:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.professors.delete({
      where: { id: Number(id) },
    });
    logAdminActivity(req.admin.id, 'DELETE', `Professor ID: ${id}`, 'professors');
    res.json({ message: 'Professor deleted successfully' });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Professor not found' });
    }
    console.error('Error deleting professor:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;

