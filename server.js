app.post("/submit-case", upload.single("faceImage"), async (req, res) => {
  try {
    console.log("Form Data:", req.body);          // 👈 Add this
    console.log("Uploaded Image:", req.file);      // 👈 Add this

    const formData = req.body;
    const faceImage = req.file ? req.file.filename : null;

    const newCase = new Case({
      ...formData,
      faceImage,
    });

    await newCase.save();
    res.status(200).json({ message: "Case saved successfully" });
  } catch (error) {
    console.error("Error saving case:", error);    // 👈 Will show actual MongoDB error
    res.status(500).json({ error: "Failed to save case" });
  }
});
