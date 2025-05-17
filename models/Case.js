const mongoose = require("mongoose");

// Follow-up schema
const followUpSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
    required: true,
  },
});

// Main case schema
const caseSchema = new mongoose.Schema({
  patientName: {
    type: String,
    required: true,
  },
  age: String,
  gender: String,
  phone: String,
  address: String,
  chiefComplaints: String,
  history: String,
  mind: String,
  physical: String,
  generals: String,
  familyHistory: String,
  investigations: String,
  diagnosis: String,
  miasm: String,
  constitution: String,
  prescription: String,
  date: String,
  faceImage: Buffer, // Optional: Store face image as binary data
  followUps: [followUpSchema], // Embedded follow-ups
});

module.exports = mongoose.model("Case", caseSchema);
