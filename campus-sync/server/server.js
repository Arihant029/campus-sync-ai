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
  
  console.log("--- NEW REQUEST RECEIVED ---");
  console.log("User Message:", message);

  // 1. Log Environment Variable Status (Do NOT log the actual key for security)
  if (!process.env.GEMINI_API_KEY) {
    console.error("❌ LOG: GEMINI_API_KEY is MISSING in Render Environment Variables");
    return res.json({ reply: "Server Error: API Key not configured." });
  } else {
    console.log("✅ LOG: GEMINI_API_KEY is detected");
  }

  try {
    console.log("📡 LOG: Attempting to initialize GoogleGenerativeAI...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    console.log("📡 LOG: Fetching gemini-pro model...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are CampusSync AI for ${profile.college}. Student says: "${message}"`;

    console.log("📡 LOG: Sending prompt to Google Gemini API...");
    const result = await model.generateContent(prompt);
    
    console.log("📡 LOG: Waiting for response...");
    const response = await result.response;
    const text = response.text();

    console.log("✅ LOG: Response received successfully!");
    res.json({ reply: text });

  } catch (error) {
    // 2. Log the EXACT error message to the Render console
    console.error("❌ LOG: Gemini API Failure!");
    console.error("Error Message:", error.message);
    console.error("Error Stack:", error.stack);

    let userFriendlyError = "I'm having a small connection issue. Please try again!";
    
    if (error.message.includes("403")) userFriendlyError = "API Key Error: Please check your Gemini Key in Render.";
    if (error.message.includes("404")) userFriendlyError = "Model Error: 'gemini-pro' not found. Try 'gemini-1.5-flash'.";
    
    res.json({ reply: userFriendlyError });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 DEBUG SERVER LIVE ON PORT ${PORT}`);
});