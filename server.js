const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect('your-mongo-uri', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

// Import routes
const submitCaseRoute = require('./routes/submitCase');
app.use('/api', submitCaseRoute);  // ⬅️ Now Step 1 route

// Add more steps here in future like:
// const complaintsRoute = require('./routes/chiefComplaints');
// app.use('/api', complaintsRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
