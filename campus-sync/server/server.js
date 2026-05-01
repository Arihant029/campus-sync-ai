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
  
  // Verify key exists
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.json({ reply: "API Key missing in Render settings." });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // 1.5-flash is faster and less likely to time out on hostel WiFi
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are CampusSync AI for ${profile.college}. 
    Respond to: "${message}". 
    Use Dept: ${profile.dept} and Attendance: ${profile.attendance} for letter requests.`;

    // Added a fast-response configuration
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: 500, // Keeps responses concise to prevent timeouts
        temperature: 0.7,
      },
    });

    const response = await result.response;
    res.json({ reply: response.text() });

  } catch (error) {
    console.error("❌ CONNECTION ERROR:", error.message);
    
    // If it's a safety block or heavy traffic, give a specific hint
    const msg = error.message.toLowerCase();
    if (msg.includes("safety")) {
        res.json({ reply: "I can't generate that specific content due to safety filters. Try asking differently!" });
    } else {
        res.json({ reply: "The hostel network is a bit slow. Please wait 10 seconds and try again!" });
    }
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SMVEC Backend Ready on Port ${PORT}`);
});