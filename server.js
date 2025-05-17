const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://bhanuhomeopathy:sekhar123456@cluster0.wm2pxqs.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Multer setup for file upload (stores files in "uploads" folder)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Save file with original name or customize
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Define your Case schema (simplified example)
const caseSchema = new mongoose.Schema({
  chiefComplaints: Object,
  clinicalDiagnosis: Object,
  doctorObservations: Object,
  faceImagePath: String, // store uploaded image path here
  familyHistory: Object,
  mentalGenerals: Object,
  miasmaticDiagnosis: Object,
  pastHistory: Object,
  patientInfo: Object,
  personalHistory: Object,
  prescriptionDetails: Object,
});

const Case = mongoose.model('Case', caseSchema);

// Route to receive form data and file
app.post('/submit-case', upload.single('faceImage'), async (req, res) => {
  try {
    console.log('Received file:', req.file);
    console.log('Received body:', req.body);

    // req.body fields come as strings, parse JSON fields if sent as stringified JSON
    // For example, if frontend sends patientInfo as JSON string:
    const caseData = {
      chiefComplaints: JSON.parse(req.body.chiefComplaints || '{}'),
      clinicalDiagnosis: JSON.parse(req.body.clinicalDiagnosis || '{}'),
      doctorObservations: JSON.parse(req.body.doctorObservations || '{}'),
      faceImagePath: req.file ? req.file.path : null,
      familyHistory: JSON.parse(req.body.familyHistory || '{}'),
      mentalGenerals: JSON.parse(req.body.mentalGenerals || '{}'),
      miasmaticDiagnosis: JSON.parse(req.body.miasmaticDiagnosis || '{}'),
      pastHistory: JSON.parse(req.body.pastHistory || '{}'),
      patientInfo: JSON.parse(req.body.patientInfo || '{}'),
      personalHistory: JSON.parse(req.body.personalHistory || '{}'),
      prescriptionDetails: JSON.parse(req.body.prescriptionDetails || '{}'),
    };

    const newCase = new Case(caseData);
    await newCase.save();

    res.status(200).json({ message: 'Case saved successfully', caseId: newCase._id });
  } catch (error) {
    console.error('Error saving case:', error);
    res.status(500).json({ message: 'Error saving case', error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
