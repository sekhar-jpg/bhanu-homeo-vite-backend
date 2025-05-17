const express = require("express");
const multer = require("multer");
const router = express.Router();
const Case = require("../models/Case"); // MongoDB schema

// Memory storage (or you can use diskStorage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST route
router.post("/submit-case", upload.single("faceImage"), async (req, res) => {
  try {
    const caseData = JSON.parse(req.body.data); // frontend nundi 'data' as string ostundi
    const faceImage = req.file ? req.file.buffer : null;

    const newCase = new Case({
      ...caseData,
      faceImage,
    });

    await newCase.save();

    res.status(200).json({ message: "Case submitted successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Case saving failed" });
  }
});

module.exports = router;
