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
    return res.json({ reply: "API Key is missing in Render settings." });
  }

  try {
    // FIX for 404: Using the correct v1 endpoint and model path
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are CampusSync AI for ${profile.college}. 
            Student: "${message}". 
            Context: ${profile.dept}, ${profile.attendance} attendance.`
          }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Google API Error:", data.error.message);
      return res.json({ reply: `Google Error: ${data.error.message}` });
    }

    const botReply = data.candidates[0].content.parts[0].text;
    res.json({ reply: botReply });

  } catch (error) {
    console.error("Server Error:", error.message);
    res.json({ reply: "Connection failed. Try switching to a mobile hotspot!" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SMVEC Backend Live on Port ${PORT}`);
});