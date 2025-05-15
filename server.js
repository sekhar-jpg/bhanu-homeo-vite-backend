const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect('mongodb+srv://bhanuhomeopathy:sekhar123456@cluster0.wm2pxqs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const Case = require('./models/Case');

// Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Route to handle case submission
app.post('/submit-case', upload.single('faceImage'), async (req, res) => {
  try {
    const formData = JSON.parse(req.body.formData); // JSON string
    const faceImageUrl = req.file ? `/uploads/${req.file.filename}` : '';

    const newCase = new Case({
      ...formData,
      faceImageUrl,
    });

    await newCase.save();
    res.status(201).json({ message: 'Case submitted successfully', case: newCase });
  } catch (error) {
    console.error('Error saving case:', error);
    res.status(500).json({ message: 'Error saving case', error });
  }
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});
