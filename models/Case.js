const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema({
  patientInfo: {
    name: String,
    age: String,
    gender: String,
    phone: String,
    address: String,
    email: String,
  },
  chiefComplaints: {
    mainComplaint: String,
    duration: String,
    severity: String,
    aggravatingFactors: String,
    relievingFactors: String,
  },
  clinicalDiagnosis: {
    primaryDiagnosis: String,
    diagnosisNotes: String,
  },
  doctorObservations: {
    generalAppearance: String,
    physicalFindings: String,
    emotionalState: String,
    otherObservations: String,
  },
  mentalGenerals: {
    mindState: String,
    fearAnxiety: String,
    sleepPatterns: String,
  },
  familyHistory: {
    familyDiseases: String,
    hereditaryConditions: String,
    mentalIllnessHistory: String,
    otherHistory: String,
  },
  personalHistory: {
    habits: String,
    occupation: String,
    sleepPattern: String,
    appetite: String,
    thirst: String,
  },
  pastHistory: {
    pastIllnesses: String,
    pastSurgeries: String,
    allergies: String,
    hospitalizations: String,
  },
  miasmaticDiagnosis: {
    psora: String,
    sycosis: String,
    syphilis: String,
    tubercular: String,
  },
  prescriptionDetails: {
    medicine: String,
    dosage: String,
    frequency: String,
  },
  faceImage: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Case", caseSchema);
