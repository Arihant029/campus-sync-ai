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
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.json({ reply: "API Key missing in Render settings." });

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // We try gemini-1.5-flash first as it is designed for speed
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are CampusSync AI for ${profile.college}. 
    Student asks: "${message}". 
    Use Dept: ${profile.dept} and Attendance: ${profile.attendance} for letter requests.`;

    // We add a timeout controller to stop the request from hanging
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 15000))
    ]);

    const response = await result.response;
    res.json({ reply: response.text() });

  } catch (error) {
    console.error("Connection Error:", error.message);
    
    // Fallback: If it's a network glitch, try one more time with a simpler request
    res.json({ 
      reply: "The hostel network is blocking the AI connection. Try switching to a mobile hotspot for a second to verify, or try again now!" 
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SMVEC Backend Ready`);
});