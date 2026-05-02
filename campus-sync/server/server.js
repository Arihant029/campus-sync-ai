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

  try {
    // SWITCHED TO v1 STABLE ENDPOINT
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    console.log("--- Sending Request to Google v1 API ---");
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are CampusSync AI for ${profile.college}. 
            Respond to: "${message}". 
            Context: ${profile.dept}, ${profile.attendance} attendance.`
          }]
        }]
      })
    });

    const data = await response.json();

    // DETAILED LOGGING: This will help us see the exact error if it persists
    if (data.error) {
      console.error("❌ GOOGLE REJECTION DETAILS:");
      console.error("Status:", data.error.status);
      console.error("Message:", data.error.message);
      return res.json({ reply: `Google API Error: ${data.error.message}` });
    }

    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "The AI is processing, please try again!";
    console.log("✅ AI Response Successful");
    res.json({ reply: botReply });

  } catch (error) {
    console.error("❌ SERVER CRASH:", error.message);
    res.json({ reply: "The hostel network is likely blocking this request. Try a mobile hotspot!" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SMVEC Backend Fully Operational on Port ${PORT}`);
});