import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Context for Sri Manakula Vinayagar Engineering College
const profile = {
  college: "Sri Manakula Vinayagar Engineering College",
  dept: "Computer Science and Engineering",
  attendance: "85%"
};

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ API Key is missing from environment variables.");
    return res.json({ reply: "Configuration error: API Key not found." });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Using gemini-pro for maximum reliability
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are CampusSync AI, the assistant for ${profile.college}. 
    Student Message: "${message}"
    
    Instructions:
    - Respond naturally to greetings like 'hlo' or 'hi'.
    - If they need a leave letter, use Dept: ${profile.dept} and Attendance: ${profile.attendance}.
    - If they need a bonafide request for an internship, draft a formal request to the HOD.
    - Keep responses professional.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ Successfully generated response");
    res.json({ reply: text });
    
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    res.json({ reply: "I'm having a small connection issue. Please try sending your message again!" });
  }
});

// Use 0.0.0.0 to ensure Render can bind to the port properly
const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CampusSync Backend Live on Port ${PORT}`);
});