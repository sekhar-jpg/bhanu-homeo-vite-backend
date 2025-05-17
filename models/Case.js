const mongoose = require("mongoose");

const followUpSchema = new mongoose.Schema({
  date: String,
  notes: String,
});

const caseSchema = new mongoose.Schema({
  patientName: String,
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
  faceImage: Buffer,
  followUps: [followUpSchema],
});

module.exports = mongoose.model("Case", caseSchema);
