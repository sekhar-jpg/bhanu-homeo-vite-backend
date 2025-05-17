// 1. Import modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const Case = require("./models/Case");

// 2. Init express app
const app = express();

// 3. Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 4. Multer setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// 5. Route (AFTER app is defined!)
app.post("/submit-case", upload.single("faceImage"), async (req, res) => {
  try {
    console.log("Form Data:", req.body);
    console.log("Uploaded Image:", req.file);

    const formData = req.body;
    const faceImage = req.file ? req.file.filename : null;

    const newCase = new Case({
      ...formData,
      faceImage,
    });

    await newCase.save();
    res.status(200).json({ message: "Case saved successfully" });
  } catch (error) {
    console.error("Error saving case:", error);
    res.status(500).json({ error: "Failed to save case" });
  }
});

// 6. MongoDB connection
mongoose.connect("your-mongodb-url", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("MongoDB connected");
}).catch(err => console.log("MongoDB error:", err));

// 7. Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
