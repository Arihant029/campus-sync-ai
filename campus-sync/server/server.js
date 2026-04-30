import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();

// 1. LOGGING MIDDLEWARE: This will show every request in your Render logs
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} request to ${req.url}`);
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
  res.send("CampusSync API is Live and Connected!");
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  
  // Log the incoming message
  console.log(`📩 Incoming message: "${message}"`);

  try {
    const input = message?.toLowerCase() || "";

    if (input.includes("leave")) {
      console.log("📄 Generating Leave Letter...");
      const reply = `To\nThe Head of Department,\nDepartment of ${profile.dept},\n${profile.college}.\n\nSubject: Leave Application\n\nRespected Sir/Madam,\nI request leave due to personal reasons. My current attendance is ${profile.attendance}.\n\nThank you.`;
      return res.json({ reply });
    }

    if (process.env.GEMINI_API_KEY) {
      console.log("🤖 Sending to Gemini AI...");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `Student from ${profile.college} asks: ${message}`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      console.log("✅ Gemini response received");
      return res.json({ reply: response.text() });
    }

    console.warn("⚠️ No API Key found, sending fallback");
    res.json({ reply: "I can generate Leave Letters. Type 'leave letter' to try!" });

  } catch (error) {
    // CRITICAL: This will log the EXACT error in Render
    console.error("❌ SERVER ERROR DETAILS:", error.message);
    console.error("❌ FULL STACK TRACE:", error.stack);
    
    res.status(500).json({ 
      reply: "The server encountered an error. Please check Render logs for details.",
      error_debug: error.message 
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SMVEC Automation Suite Live on Port ${PORT}`);
});