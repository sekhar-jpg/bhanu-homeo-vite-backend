const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');

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

// Middleware
app.use(cors());
app.use(express.json());

// Multer setup for file uploads in memory
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
  followUps: [
    {
      date: String,
      notes: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CaseModel = mongoose.model('Case', caseSchema);

// ✅ Submit new case
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

// ✅ Get all cases
app.get('/all-cases', async (req, res) => {
  try {
    const cases = await CaseModel.find();
    res.json(cases);
  } catch (err) {
    console.error('❌ Error fetching cases:', err);
    res.status(500).json({ message: 'Failed to fetch cases' });
  }
});

// ✅ Add follow-up
app.post('/add-followup/:caseId', async (req, res) => {
  try {
    const { date, notes } = req.body;
    const foundCase = await CaseModel.findById(req.params.caseId);
    if (!foundCase) return res.status(404).json({ message: 'Case not found' });

    foundCase.followUps.push({ date, notes });
    await foundCase.save();
    res.json({ message: 'Follow-up added' });
  } catch (err) {
    console.error('❌ Error adding follow-up:', err);
    res.status(500).json({ message: 'Failed to add follow-up' });
  }
});

// ✅ Edit follow-up
app.put('/edit-followup/:caseId/:followupId', async (req, res) => {
  try {
    const { date, notes } = req.body;
    const foundCase = await CaseModel.findById(req.params.caseId);
    if (!foundCase) return res.status(404).json({ message: 'Case not found' });

    const followup = foundCase.followUps.id(req.params.followupId);
    if (!followup) return res.status(404).json({ message: 'Follow-up not found' });

    followup.date = date;
    followup.notes = notes;
    await foundCase.save();
    res.json({ message: 'Follow-up updated' });
  } catch (err) {
    console.error('❌ Error editing follow-up:', err);
    res.status(500).json({ message: 'Failed to edit follow-up' });
  }
});

// ✅ Delete follow-up
app.delete('/delete-followup/:caseId/:followupId', async (req, res) => {
  try {
    const foundCase = await CaseModel.findById(req.params.caseId);
    if (!foundCase) return res.status(404).json({ message: 'Case not found' });

    foundCase.followUps = foundCase.followUps.filter(
      (f) => f._id.toString() !== req.params.followupId
    );
    await foundCase.save();
    res.json({ message: 'Follow-up deleted' });
  } catch (err) {
    console.error('❌ Error deleting follow-up:', err);
    res.status(500).json({ message: 'Failed to delete follow-up' });
  }
});

// ✅ Get today's follow-up reminders
app.get('/reminders', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const cases = await CaseModel.find({
      followUps: {
        $elemMatch: { date: today },
      },
    });
    res.json(cases);
  } catch (err) {
    console.error('❌ Error fetching reminders:', err);
    res.status(500).json({ message: 'Failed to get reminders' });
  }
});

// ✅ Edit full case
app.put('/edit-case/:id', async (req, res) => {
  const { id } = req.params;
  const updatedCase = req.body;

  try {
    const result = await CaseModel.findByIdAndUpdate(id, updatedCase, { new: true });
    res.json(result);
  } catch (err) {
    console.error('❌ Error editing case:', err);
    res.status(500).json({ error: 'Failed to update case' });
  }
});

// ✅ Delete full case
app.delete('/delete-case/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await CaseModel.findByIdAndDelete(id);
    res.json({ message: 'Case deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting case:', err);
    res.status(500).json({ error: 'Failed to delete case' });
  }
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
