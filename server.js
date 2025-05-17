import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('✅ MongoDB connected'));

// CORS Middleware
app.use(cors());

// Multer Setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Mongoose Schema
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
  faceImage: {
    data: Buffer,
    contentType: String,
    filename: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CaseModel = mongoose.model('Case', caseSchema);

// Route
app.post('/submit-case', upload.single('faceImage'), async (req, res) => {
  try {
    const faceImage = req.file;

    const newCase = new CaseModel({
      patientInfo: JSON.parse(req.body.patientInfo),
      chiefComplaints: JSON.parse(req.body.chiefComplaints),
      pastHistory: JSON.parse(req.body.pastHistory),
      familyHistory: JSON.parse(req.body.familyHistory),
      personalHistory: JSON.parse(req.body.personalHistory),
      mentalGenerals: JSON.parse(req.body.mentalGenerals),
      miasmaticDiagnosis: JSON.parse(req.body.miasmaticDiagnosis),
      clinicalDiagnosis: JSON.parse(req.body.clinicalDiagnosis),
      doctorObservations: JSON.parse(req.body.doctorObservations),
      prescriptionDetails: JSON.parse(req.body.prescriptionDetails),
      faceImage: faceImage
        ? {
            data: faceImage.buffer,
            contentType: faceImage.mimetype,
            filename: faceImage.originalname,
          }
        : undefined,
    });

    await newCase.save();
    res.json({ message: 'Case submitted successfully and saved to DB' });
  } catch (err) {
    console.error('❌ Error saving case:', err);
    res.status(500).json({ message: 'Error saving case', error: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
