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
  
  // DIAGNOSTIC LOGS: Check these in your Render Dashboard
  const key = process.env.GEMINI_API_KEY;
  console.log("--- Request Received ---");
  console.log("Message:", message);
  console.log("API Key present:", !!key);
  if (key) {
    console.log("API Key Length:", key.length);
    console.log("API Key Starts with:", key.substring(0, 3));
  }

  if (!key) {
    return res.json({ reply: "Configuration error: API Key is missing on the server." });
  }

  try {
    const genAI = new GoogleGenerativeAI(key);
    
    // Using gemini-1.5-flash as it is the most compatible with newer library versions
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash" 
    });

    const prompt = `You are CampusSync AI for ${profile.college}. 
    Respond to the student: "${message}". 
    Context: Dept is ${profile.dept}, Attendance is ${profile.attendance}.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("✅ Response generated successfully");
    res.json({ reply: text });

  } catch (error) {
    console.error("❌ GEMINI ERROR:", error.message);
    
    // This will help us identify if it's an Auth issue (403) or Model issue (404)
    let errorMessage = "I'm having a connection issue. Please try again.";
    
    if (error.message.includes("API_KEY_INVALID") || error.message.includes("403")) {
      errorMessage = "Invalid API Key. Please regenerate the key in Google AI Studio and update Render.";
    } else if (error.message.includes("404")) {
      errorMessage = "Model not found. Server is trying to reconnect...";
    }

    res.json({ reply: errorMessage });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SMVEC Backend Live on Port ${PORT}`);
});