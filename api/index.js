const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const OpenAI = require("openai");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());

const upload = multer({ dest: "uploads/" });

app.post("/transcribe", upload.single("audio"), async (req, res) => {
  try {
    const audioFile = fs.createReadStream(req.file.path);

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
    });

    fs.unlinkSync(req.file.path); // Delete temp file
    res.json({ text: transcription.text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Transcription failed" });
  }
});

app.listen(port, () => console.log(`Server running on port ${port}`));
