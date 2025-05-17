// server.js

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Replace this with your own MongoDB connection string
const MONGODB_URI = 'mongodb+srv://bhanuhomeopathy:sekhar123456@cluster0.wm2pxqs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Connect to MongoDB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json()); // For parsing application/json

// Set up multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // folder where images will be saved
  },
  filename: function (req, file, cb) {
    // Unique filename: timestamp + original name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// Create uploads folder if not exists
const fs = require('fs');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Define Mongoose Schema and Model for Case

const FollowUpSchema = new mongoose.Schema({
  date: Date,
  notes: String,
  status: String, // e.g. "pending", "done"
});

const CaseSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  age: Number,
  gender: String,
  phoneNumber: String,
  address: String,
  caseDate: { type: Date, default: Date.now },
  chiefComplaints: [String],  // multiple complaints
  history: String,
  physicalSymptoms: String,
  mindSymptoms: String,
  miasm: String,
  constitution: String,
  prescribedRemedy: String,
  followUps: [FollowUpSchema],
  faceImagePath: String, // store filename of uploaded face image
}, { timestamps: true });

const Case = mongoose.model('Case', CaseSchema);

// Routes

app.get('/', (req, res) => {
  res.send('Bhanu Homeopathy Case API is running');
});

// Submit a new case with optional image upload
app.post('/submit-case', upload.single('faceImage'), async (req, res) => {
  try {
    // console.log('req.body:', req.body);
    // console.log('req.file:', req.file);

    // multer parses multipart/form-data. Text fields come in req.body
    // image file info in req.file

    const {
      patientName,
      age,
      gender,
      phoneNumber,
      address,
      caseDate,
      chiefComplaints,  // expected as JSON string array or CSV string
      history,
      physicalSymptoms,
      mindSymptoms,
      miasm,
      constitution,
      prescribedRemedy,
      followUps, // expected as JSON string array of objects
    } = req.body;

    // Parse chiefComplaints and followUps if sent as JSON strings
    let parsedChiefComplaints = [];
    if (chiefComplaints) {
      if (typeof chiefComplaints === 'string') {
        try {
          parsedChiefComplaints = JSON.parse(chiefComplaints);
        } catch {
          // fallback split by comma
          parsedChiefComplaints = chiefComplaints.split(',').map(s => s.trim());
        }
      } else if (Array.isArray(chiefComplaints)) {
        parsedChiefComplaints = chiefComplaints;
      }
    }

    let parsedFollowUps = [];
    if (followUps) {
      if (typeof followUps === 'string') {
        try {
          parsedFollowUps = JSON.parse(followUps);
        } catch {
          parsedFollowUps = [];
        }
      } else if (Array.isArray(followUps)) {
        parsedFollowUps = followUps;
      }
    }

    // Construct new case document
    const newCase = new Case({
      patientName,
      age: age ? Number(age) : undefined,
      gender,
      phoneNumber,
      address,
      caseDate: caseDate ? new Date(caseDate) : undefined,
      chiefComplaints: parsedChiefComplaints,
      history,
      physicalSymptoms,
      mindSymptoms,
      miasm,
      constitution,
      prescribedRemedy,
      followUps: parsedFollowUps,
      faceImagePath: req.file ? req.file.filename : undefined,
    });

    const savedCase = await newCase.save();
    res.status(201).json({ message: 'Case saved successfully', case: savedCase });
  } catch (error) {
    console.error('Error saving case:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all cases
app.get('/cases', async (req, res) => {
  try {
    const cases = await Case.find().sort({ caseDate: -1 });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// Get follow-up cases for today or specific date
app.get('/follow-ups', async (req, res) => {
  try {
    // Query param: date in YYYY-MM-DD format; default = today
    const dateStr = req.query.date || new Date().toISOString().slice(0,10);
    const start = new Date(dateStr + 'T00:00:00.000Z');
    const end = new Date(dateStr + 'T23:59:59.999Z');

    // Find cases with followUps having date in [start,end]
    const cases = await Case.find({
      followUps: {
        $elemMatch: {
          date: { $gte: start, $lte: end },
          status: 'pending'
        }
      }
    });

    // For each case, filter followUps to only those on this date and pending
    const filteredCases = cases.map(c => {
      const followUpsForDate = c.followUps.filter(fu => {
        return fu.date >= start && fu.date <= end && fu.status === 'pending';
      });
      return {
        _id: c._id,
        patientName: c.patientName,
        phoneNumber: c.phoneNumber,
        followUps: followUpsForDate,
      };
    });

    res.json(filteredCases);

  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    res.status(500).json({ error: 'Failed to fetch follow-ups' });
  }
});

// Static serve uploaded images (face images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
