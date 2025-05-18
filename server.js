const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://bhanuhomeopathy:sekhar123456@cluster0.wm2pxqs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define Mongoose schema & model for cases
const caseSchema = new mongoose.Schema({
  patientInfo: {
    name: String,
    age: Number,
    gender: String,
  },
  chiefComplaints: Array,
  pastHistory: Array,
  familyHistory: Array,
  personalHistory: Array,
  mentalGenerals: Array,
  miasmaticDiagnosis: String,
  clinicalDiagnosis: String,
  doctorObservations: String,
  prescriptionDetails: Array,
  faceImageUrl: String,
  followUps: [{
    date: Date,
    notes: String,
  }],
}, { timestamps: true });

const CaseModel = mongoose.model('Case', caseSchema);

// Setup multer for face image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Routes

// 1. Submit new case with face image
app.post('/submit-case', upload.single('faceImage'), async (req, res) => {
  try {
    const caseData = JSON.parse(req.body.caseData);
    if (req.file) {
      caseData.faceImageUrl = `/uploads/${req.file.filename}`;
    }
    const newCase = new CaseModel(caseData);
    await newCase.save();
    res.json({ message: 'Case submitted', caseId: newCase._id });
  } catch (err) {
    console.error('Error submitting case:', err);
    res.status(500).json({ message: 'Failed to submit case' });
  }
});

// 2. Get all cases
app.get('/all-cases', async (req, res) => {
  try {
    const cases = await CaseModel.find();
    res.json(cases);
  } catch (err) {
    console.error('Error getting cases:', err);
    res.status(500).json({ message: 'Failed to get cases' });
  }
});

// 3. Edit entire case or partial update
app.put('/edit-case/:caseId', async (req, res) => {
  try {
    const updateData = req.body;
    const updatedCase = await CaseModel.findByIdAndUpdate(req.params.caseId, updateData, { new: true });
    if (!updatedCase) return res.status(404).json({ message: 'Case not found' });
    res.json({ message: 'Case updated', updatedCase });
  } catch (err) {
    console.error('Error editing case:', err);
    res.status(500).json({ message: 'Failed to edit case' });
  }
});

// 4. Delete a case
app.delete('/delete-case/:caseId', async (req, res) => {
  try {
    const deleted = await CaseModel.findByIdAndDelete(req.params.caseId);
    if (!deleted) return res.status(404).json({ message: 'Case not found' });
    res.json({ message: 'Case deleted' });
  } catch (err) {
    console.error('Error deleting case:', err);
    res.status(500).json({ message: 'Failed to delete case' });
  }
});

// 5. Add follow-up to case
app.post('/add-followup/:caseId', async (req, res) => {
  try {
    const { date, notes } = req.body;
    const updated = await CaseModel.findByIdAndUpdate(
      req.params.caseId,
      { $push: { followUps: { date, notes } } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Case not found' });
    res.json({ message: 'Follow-up added', updated });
  } catch (err) {
    console.error('Error adding follow-up:', err);
    res.status(500).json({ message: 'Failed to add follow-up' });
  }
});

// 6. Edit a follow-up by index
app.put('/edit-followup/:caseId/:followUpIndex', async (req, res) => {
  try {
    const { date, notes } = req.body;
    const caseDoc = await CaseModel.findById(req.params.caseId);
    if (!caseDoc) return res.status(404).json({ message: 'Case not found' });
    if (caseDoc.followUps.length <= req.params.followUpIndex) return res.status(404).json({ message: 'Follow-up not found' });

    caseDoc.followUps[req.params.followUpIndex] = { date, notes };
    await caseDoc.save();
    res.json({ message: 'Follow-up updated', followUps: caseDoc.followUps });
  } catch (err) {
    console.error('Error editing follow-up:', err);
    res.status(500).json({ message: 'Failed to edit follow-up' });
  }
});

// 7. Delete a follow-up by index
app.delete('/delete-followup/:caseId/:followUpIndex', async (req, res) => {
  try {
    const caseDoc = await CaseModel.findById(req.params.caseId);
    if (!caseDoc) return res.status(404).json({ message: 'Case not found' });
    if (caseDoc.followUps.length <= req.params.followUpIndex) return res.status(404).json({ message: 'Follow-up not found' });

    caseDoc.followUps.splice(req.params.followUpIndex, 1);
    await caseDoc.save();
    res.json({ message: 'Follow-up deleted', followUps: caseDoc.followUps });
  } catch (err) {
    console.error('Error deleting follow-up:', err);
    res.status(500).json({ message: 'Failed to delete follow-up' });
  }
});

// 8. Get today's follow-up reminders
app.get('/today-followups', async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const cases = await CaseModel.find({
      followUps: {
        $elemMatch: {
          date: { $gte: todayStart, $lte: todayEnd }
        }
      }
    });

    // Prepare reminder list with patient info + followup notes for today
    const reminders = [];
    cases.forEach(c => {
      c.followUps.forEach(fu => {
        if (fu.date >= todayStart && fu.date <= todayEnd) {
          reminders.push({
            caseId: c._id,
            patientName: c.patientInfo.name,
            followUpDate: fu.date,
            notes: fu.notes,
          });
        }
      });
    });

    res.json(reminders);
  } catch (err) {
    console.error('Error getting today follow-ups:', err);
    res.status(500).json({ message: 'Failed to get follow-ups' });
  }
});

// 9. Search cases by patient name (case insensitive)
app.get('/search-cases', async (req, res) => {
  try {
    const nameQuery = req.query.name;
    if (!nameQuery) return res.status(400).json({ message: 'Name query param required' });

    const cases = await CaseModel.find({
      'patientInfo.name': { $regex: nameQuery, $options: 'i' }
    });
    res.json(cases);
  } catch (err) {
    console.error('Error searching cases:', err);
    res.status(500).json({ message: 'Failed to search cases' });
  }
});

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
