const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());  // Enable CORS for frontend requests

// MongoDB connection (update your URI here)
const mongoURI = 'YOUR_MONGODB_CONNECTION_STRING';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Case Schema
const caseSchema = new mongoose.Schema({
  patientInfo: Object,
  chiefComplaints: Object,
  pastHistory: Object,
  familyHistory: Object,
  personalHistory: Object,
  mentalGenerals: Object,
  miasmaticDiagnosis: Object,
  clinicalDiagnosis: Object,
  doctorObservations: Object,
  prescriptionDetails: Object,
  faceImagePath: String,
  createdAt: { type: Date, default: Date.now }
});

const Case = mongoose.model('Case', caseSchema);

// Setup multer for file upload
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = file.fieldname + '-' + Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// POST /submit-case route to handle form + image upload
app.post('/submit-case', upload.single('faceImage'), async (req, res) => {
  try {
    const faceImage = req.file;

    // Parse JSON fields from req.body
    const patientInfo = JSON.parse(req.body.patientInfo || '{}');
    const chiefComplaints = JSON.parse(req.body.chiefComplaints || '{}');
    const pastHistory = JSON.parse(req.body.pastHistory || '{}');
    const familyHistory = JSON.parse(req.body.familyHistory || '{}');
    const personalHistory = JSON.parse(req.body.personalHistory || '{}');
    const mentalGenerals = JSON.parse(req.body.mentalGenerals || '{}');
    const miasmaticDiagnosis = JSON.parse(req.body.miasmaticDiagnosis || '{}');
    const clinicalDiagnosis = JSON.parse(req.body.clinicalDiagnosis || '{}');
    const doctorObservations = JSON.parse(req.body.doctorObservations || '{}');
    const prescriptionDetails = JSON.parse(req.body.prescriptionDetails || '{}');

    // Save to MongoDB
    const newCase = new Case({
      patientInfo,
      chiefComplaints,
      pastHistory,
      familyHistory,
      personalHistory,
      mentalGenerals,
      miasmaticDiagnosis,
      clinicalDiagnosis,
      doctorObservations,
      prescriptionDetails,
      faceImagePath: faceImage ? faceImage.path : null,
    });

    await newCase.save();

    res.json({ message: 'Case saved successfully!', caseId: newCase._id });
  } catch (error) {
    console.error('Error saving case:', error);
    res.status(500).json({ message: 'Error saving case data' });
  }
});

// Serve uploaded images statically so frontend can access
app.use('/uploads', express.static(uploadDir));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
