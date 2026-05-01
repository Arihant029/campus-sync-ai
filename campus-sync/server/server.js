import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const profile = {
  college: "Sri Manakula Vinayagar Engineering College",
  dept: "Computer Science and Engineering",
  attendance: "85%"
};

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  // LOGGING: This will show up in your Render Dashboard > Logs
  console.log("--- New Request ---");
  console.log("Message received:", message);
  
  // 1. Check if the variable exists
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error("❌ ERROR: GEMINI_API_KEY is not defined in Render Environment Variables.");
    return res.json({ reply: "API Key is missing on the server. Please check Render settings." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are CampusSync AI for ${profile.college}. 
    Student asks: "${message}". 
    Use ${profile.dept} and ${profile.attendance} for letter requests.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ AI Response successful");
    res.json({ reply: text });

  } catch (error) {
    console.error("❌ GEMINI API ERROR:", error.message);
    res.json({ reply: "The AI is having trouble connecting. Please try again in a moment." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});