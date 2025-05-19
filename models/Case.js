const mongoose = require('mongoose');

const CaseSchema = new mongoose.Schema({
  name: String,
  age: Number,
  gender: String,
  phone: String,
  address: String,
  faceImageUrl: String
});

module.exports = mongoose.model('Case', CaseSchema);
