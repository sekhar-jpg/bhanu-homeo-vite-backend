const express = require("express");
const multer = require("multer");
const router = express.Router();
const Case = require("../models/Case"); // MongoDB schema

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Submit new case
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
    console.error("Error:", err);
    res.status(500).json({ error: "Case saving failed" });
  }
});

// Get all cases
router.get("/all-cases", async (req, res) => {
  try {
    const cases = await Case.find();
    res.status(200).json(cases);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch cases" });
  }
});

// Add follow-up
router.post("/add-followup/:caseId", async (req, res) => {
  try {
    const { date, notes } = req.body;
    const foundCase = await Case.findById(req.params.caseId);
    if (!foundCase) return res.status(404).json({ error: "Case not found" });

    foundCase.followUps.push({ date, notes });
    await foundCase.save();
    res.json({ message: "Follow-up added" });
  } catch (err) {
    res.status(500).json({ error: "Failed to add follow-up" });
  }
});

// Edit follow-up
router.put("/edit-followup/:caseId/:followupId", async (req, res) => {
  try {
    const { date, notes } = req.body;
    const foundCase = await Case.findById(req.params.caseId);
    if (!foundCase) return res.status(404).json({ error: "Case not found" });

    const followup = foundCase.followUps.id(req.params.followupId);
    if (!followup) return res.status(404).json({ error: "Follow-up not found" });

    followup.date = date;
    followup.notes = notes;
    await foundCase.save();
    res.json({ message: "Follow-up updated" });
  } catch (err) {
    res.status(500).json({ error: "Failed to edit follow-up" });
  }
});

// Delete follow-up
router.delete("/delete-followup/:caseId/:followupId", async (req, res) => {
  try {
    const foundCase = await Case.findById(req.params.caseId);
    if (!foundCase) return res.status(404).json({ error: "Case not found" });

    foundCase.followUps = foundCase.followUps.filter(
      (f) => f._id.toString() !== req.params.followupId
    );
    await foundCase.save();
    res.json({ message: "Follow-up deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete follow-up" });
  }
});

// Get today's reminders
router.get("/reminders", async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const cases = await Case.find({
      followUps: {
        $elemMatch: { date: today },
      },
    });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: "Failed to get reminders" });
  }
});

module.exports = router;
