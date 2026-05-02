import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

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

  if (!apiKey) {
    return res.json({ reply: "API Key is missing in Render environment variables." });
  }

  // LOGGING: Check exactly what message is being sent
  console.log(`--- Request for ${profile.college} ---`);
  console.log("Input Message:", message);

  try {
    // FIX for 404: Using the most stable v1beta URL format
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are CampusSync AI for ${profile.college}. 
            Student asks: "${message}". 
            Context: Student is in ${profile.dept} with ${profile.attendance} attendance.`
          }]
        }]
      })
    });

    const data = await response.json();

    // LOGGING: See if Google rejected the request
    if (data.error) {
      console.error("❌ Google Rejection:", data.error.message);
      return res.json({ reply: `AI System Error: ${data.error.message}` });
    }

    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm processing, please try again!";
    console.log("✅ AI Response Successful");
    res.json({ reply: botReply });

  } catch (error) {
    console.error("❌ Network Crash:", error.message);
    res.json({ reply: "The hostel network blocked the connection. Please try a mobile hotspot!" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CampusSync Backend Fully Operational on Port ${PORT}`);
});