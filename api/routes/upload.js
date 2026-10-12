const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

// Uploaded images are stored in the clientside static folder so they are
// immediately served to the browser at /images/<name>.
const IMAGES_DIR = path.resolve(__dirname, '..', '..', 'clientside', 'images');
if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, IMAGES_DIR);
  },
  filename: function (req, file, cb) {
    const ext = (path.extname(file.originalname) || '.png').toLowerCase();
    const base = path.basename(file.originalname, ext)
      .replace(/[^a-z0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase();
    cb(null, (base || 'image') + '-' + Date.now() + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});

// POST /api/upload  (multipart field name: "image")
router.post('/upload', requireAdmin, upload.single('image'), function (req, res) {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' });
  }
  res.json({ success: true, data: { url: 'images/' + req.file.filename } });
});

// Return upload errors (size limit / wrong type) as JSON.
router.use(function (err, req, res, next) {
  res.status(400).json({ success: false, message: err.message || 'Upload failed' });
});

module.exports = router;
