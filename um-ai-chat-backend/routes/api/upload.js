const express = require('express');
const multer = require('multer');
const cloudinary = require('../../config/cloudinary');
const { authenticateAdmin } = require('../middleware/adminAuth');

const router = express.Router();

// Configure multer for memory storage (we'll upload directly to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Upload image to Cloudinary
router.post('/image', authenticateAdmin, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: err.message || 'File upload error' });
      }
      return res.status(400).json({ error: err.message || 'File upload error' });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('📤 Upload request received');
    console.log('Admin authenticated:', req.admin?.id);
    console.log('Headers:', {
      'content-type': req.headers['content-type'],
      'content-length': req.headers['content-length']
    });
    console.log('File received:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    } : 'No file');

    if (!req.file) {
      console.error('❌ No file provided in request');
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Check Cloudinary config
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary credentials missing in environment variables');
      return res.status(500).json({ error: 'Cloudinary configuration missing' });
    }

    console.log('🔄 Converting to base64...');
    // Convert buffer to base64
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    console.log('☁️ Uploading to Cloudinary...');
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'um-ai-chat', // Organize images in a folder
      resource_type: 'image',
    });

    console.log('✅ Upload successful:', result.secure_url);
    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error('❌ Error uploading image:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: 'Failed to upload image', 
      message: error.message || 'Unknown error occurred'
    });
  }
});

module.exports = router;

