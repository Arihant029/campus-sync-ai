import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Define profile for context
const profile = {
  college: "Sri Manakula Vinayagar Engineering College",
  dept: "Computer Science and Engineering",
  attendance: "85%"
};

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  // Verify key exists in Render Environment Variables
  if (!process.env.GEMINI_API_KEY) {
    return res.json({ reply: "API Key missing in Render settings." });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Switch to 'gemini-pro' to resolve the 404 error seen in logs
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // We pass instructions directly in the prompt to ensure the AI knows its role
    const prompt = `You are CampusSync AI, the official assistant for ${profile.college}. 
    The student says: "${message}". 
    
    Guidelines:
    - Respond helpfully to any greetings or general questions.
    - If they ask for a leave letter, draft one for the ${profile.dept} department mentioning their ${profile.attendance} attendance.
    - If they ask for a bonafide certificate, draft a request to the HOD for internship purposes.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ reply: text });
  } catch (error) {
    // Log the specific error to Render for easier debugging
    console.error("❌ Gemini Error:", error.message);
    res.json({ reply: "I'm having a small connection issue. Please try sending your message again!" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SMVEC Server Live on Port ${PORT}`);
});