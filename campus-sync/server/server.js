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

// 1. Initialize the API at the top level to prevent repeated handshakes
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  if (!genAI) {
    return res.json({ reply: "API Key missing. Please check Render Environment variables." });
  }

  try {
    // 2. Use 'gemini-1.5-flash' - it is the current standard for fast, stable responses
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are the CampusSync AI Assistant for students at ${profile.college}. 
    Student Message: "${message}"
    If asked for a leave letter or bonafide certificate, include that they are from ${profile.dept} with ${profile.attendance} attendance. 
    Always be professional and helpful.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });

  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    
    // 3. Fallback: If 1.5-flash fails, try the legacy 'gemini-pro' name
    try {
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
      const fallbackResult = await fallbackModel.generateContent(message);
      const fallbackResponse = await fallbackResult.response;
      return res.json({ reply: fallbackResponse.text() });
    } catch (innerError) {
      res.json({ reply: "Connection failed. Ensure your Gemini API Key is valid and try again." });
    }
  }
});

// 4. Force binding to 0.0.0.0 for Render compatibility
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SMVEC Server Final Build Live on Port ${PORT}`);
});