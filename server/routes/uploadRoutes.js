const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'SyncSphere',
    resource_type: 'auto', // Support images, videos, and raw files
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'docx', 'txt', 'mp4', 'mp3'],
  },
});

const upload = multer({ storage: storage });

// POST /api/upload
router.post('/', protect, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Cloudinary returns the file details in req.file
    res.status(200).json({
      fileUrl: req.file.path,
      filePublicId: req.file.filename,
      fileType: req.file.mimetype.split('/')[0], // e.g., 'image', 'video', 'application'
      originalName: req.file.originalname,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
