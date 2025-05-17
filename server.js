const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();

// Configure multer for file upload storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // folder to save uploaded images; create if not exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// Make sure uploads folder exists or create it:
const fs = require('fs');
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// Route to handle form submission with file upload + JSON fields
app.post('/submit-case', upload.single('faceImage'), (req, res) => {
  try {
    // multer puts file info in req.file
    const faceImage = req.file;

    // All other fields come in req.body as JSON strings
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

    // Now you have all data and the uploaded file info.
    // TODO: Save data to database here (MongoDB or whatever you use)

    console.log('Received patientInfo:', patientInfo);
    console.log('Received faceImage file:', faceImage);

    res.json({ message: 'Case saved successfully!' });
  } catch (error) {
    console.error('Error processing case:', error);
    res.status(500).json({ message: 'Error saving case data' });
  }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
