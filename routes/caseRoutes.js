const express = require('express');
const multer = require('multer');
const path = require('path');
const Case = require('../models/Case');
const router = express.Router();

// Setup for multer
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// POST: /api/submit-case
router.post('/submit-case', upload.single('faceImage'), async (req, res) => {
  try {
    const { name, age, gender, phone, address } = req.body;
    const faceImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newCase = new Case({ name, age, gender, phone, address, faceImageUrl });
    await newCase.save();

    res.json({ success: true, message: 'Case saved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error saving case' });
  }
});

module.exports = router;
