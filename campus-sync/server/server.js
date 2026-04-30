import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} to ${req.url}`);
  next();
});

app.use(express.json());
app.use(cors()); 

const profile = {
  college: "Sri Manakula Vinayagar Engineering College",
  dept: "Computer Science and Engineering",
  attendance: "85%"
};

app.get('/', (req, res) => {
  console.log("✅ Health check hit");
  res.send("CampusSync API is Live!");
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  console.log(`📩 Received: "${message}"`);

  try {
    const input = message?.toLowerCase() || "";

    // Template Logic
    if (input.includes("leave")) {
      console.log("📄 Generating Leave Letter...");
      const reply = `To\nThe Head of Department,\nDepartment of ${profile.dept},\n${profile.college}.\n\nSubject: Leave Application\n\nRespected Sir/Madam,\nI request leave due to personal reasons. My current attendance is ${profile.attendance}.\n\nThank you.`;
      return res.json({ reply });
    }

    // AI Logic (Requires GEMINI_API_KEY in Render Environment Variables)
    if (process.env.GEMINI_API_KEY) {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Student at ${profile.college} asks: ${message}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return res.json({ reply: response.text() });
    }

    res.json({ reply: "I can help with leave letters. Type 'leave letter'!" });

  } catch (error) {
    console.error("❌ ERROR:", error.message);
    res.status(500).json({ reply: "Server error. Check Render logs." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SMVEC Server Live on Port ${PORT}`);
});