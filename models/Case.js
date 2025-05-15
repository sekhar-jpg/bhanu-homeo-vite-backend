const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  patientInfo: {
    name: String,
    age: String,
    gender: String,
    maritalStatus: String,
    occupation: String,
    address: String,
    phone: String,
    dateOfVisit: String,
  },
  chiefComplaints: [
    {
      complaint: String,
      duration: String,
      description: String,
    },
  ],
  historyOfPresentIllness: String,
  pastHistory: {
    childhoodDiseases: String,
    surgeriesInjuries: String,
    majorIllnesses: String,
  },
  familyHistory: String,
  personalHistory: {
    appetite: String,
    cravingsAversions: String,
    thirst: String,
    bowelMovement: String,
    urine: String,
    sleep: String,
    dreams: String,
    sweat: String,
    thermalNature: String,
    habits: String,
    menstrualHistory: String,
  },
  mentalSymptoms: String,
  generalRemarks: String,
  doctorObservations: String,
  prescription: [
    {
      date: String,
      remedyName: String,
      potency: String,
      dose: String,
      instructions: String,
    },
  ],
  faceImageUrl: String,
});

module.exports = mongoose.model('Case', caseSchema);
