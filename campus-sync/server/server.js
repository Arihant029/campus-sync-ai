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
  
  if (!process.env.GEMINI_API_KEY) {
    return res.json({ reply: "API Key missing in Render settings." });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Use the most up-to-date model name format
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are CampusSync AI for ${profile.college}. 
    Student says: "${message}"
    If they need a letter, use Dept: ${profile.dept} and Attendance: ${profile.attendance}.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });

  } catch (error) {
    console.error("❌ ERROR:", error.message);
    
    // FALLBACK: If 1.5-flash fails, try the basic 'gemini-pro' one last time
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(message);
        const response = await result.response;
        return res.json({ reply: response.text() });
    } catch (innerError) {
        res.json({ reply: "I'm having a connection issue with Google's servers. Please try again in a minute." });
    }
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Final Debug Server Live on Port ${PORT}`);
});