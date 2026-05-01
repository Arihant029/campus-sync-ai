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

// Initialize Gemini at the top level
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

app.get('/', (req, res) => {
  console.log("✅ Health check hit");
  res.send("CampusSync API is Live!");
});

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  console.log(`📩 Received: "${message}"`);

  if (!message) {
    return res.status(400).json({ reply: "Please provide a message." });
  }

  try {
    // If API Key is missing, the AI won't work
    if (!genAI) {
      console.error("❌ GEMINI_API_KEY is missing in environment variables.");
      return res.json({ reply: "AI is currently offline. Please check server configuration." });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Use 1.5-flash for faster responses in hostel networks
      systemInstruction: `You are the CampusSync AI Assistant for students at ${profile.college}. 
      You are helpful, professional, and friendly. 
      You can chat about anything (like greetings), but you are specifically an expert at:
      1. Drafting Leave Letters (Student is in ${profile.dept} with ${profile.attendance} attendance).
      2. Drafting Bonafide Certificate requests for internships addressed to the HOD.
      Keep your responses helpful and concise.`
    });

    // Pass the message directly to the AI
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    console.log("📤 AI Response sent successfully");
    return res.json({ reply: text });

  } catch (error) {
    console.error("❌ ERROR:", error.message);
    res.status(500).json({ reply: "The AI is sleepy. Please wait 30 seconds and try again." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SMVEC Server Live on Port ${PORT}`);
});