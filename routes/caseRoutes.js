const express = require("express");
const multer = require("multer");
const router = express.Router();
const Case = require("../models/Case"); // MongoDB case schema
const FollowUp = require("../models/FollowUp"); // MongoDB follow-up schema

// Setup multer for image upload
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * Submit a new case with optional image
 */
router.post("/submit-case", upload.single("faceImage"), async (req, res) => {
  try {
    const caseData = JSON.parse(req.body.data);
    const faceImage = req.file ? req.file.buffer : null;

    const newCase = new Case({
      ...caseData,
      faceImage,
    });

    await newCase.save();
    res.status(200).json({ message: "Case submitted successfully" });
  } catch (err) {
    console.error("Submit case error:", err);
    res.status(500).json({ error: "Case saving failed" });
  }
});

/**
 * Get all cases
 */
router.get("/all-cases", async (req, res) => {
  try {
    const cases = await Case.find().sort({ createdAt: -1 });
    res.status(200).json(cases);
  } catch (err) {
    console.error("Fetch cases error:", err);
    res.status(500).json({ error: "Fetching cases failed" });
  }
});

/**
 * Add a follow-up to a case
 */
router.post("/add-followup/:caseId", async (req, res) => {
  try {
    const { caseId } = req.params;
    const followUpData = req.body;

    const followUp = new FollowUp({
      ...followUpData,
      caseId,
    });

    await followUp.save();
    res.status(200).json({ message: "Follow-up added successfully" });
  } catch (err) {
    console.error("Add follow-up error:", err);
    res.status(500).json({ error: "Adding follow-up failed" });
  }
});

/**
 * Get all follow-ups for a case
 */
router.get("/get-followups/:caseId", async (req, res) => {
  try {
    const { caseId } = req.params;
    const followUps = await FollowUp.find({ caseId }).sort({ createdAt: -1 });
    res.status(200).json(followUps);
  } catch (err) {
    console.error("Fetch follow-ups error:", err);
    res.status(500).json({ error: "Fetching follow-ups failed" });
  }
});

module.exports = router;
