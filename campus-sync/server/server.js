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
    return res.json({ reply: "API Key missing in Render settings." });
  }

  try {
    // UPDATED URL: Using the precise model path to stop the 404 error
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are CampusSync AI for ${profile.college}. Student says: "${message}". Context: ${profile.dept}, ${profile.attendance} attendance.`
          }]
        }]
      })
    });

    const data = await response.json();

    // Catching Google-specific rejections
    if (data.error) {
      console.error("Google API Error:", data.error.message);
      return res.json({ reply: `AI Error: ${data.error.message}` });
    }

    const botReply = data.candidates[0].content.parts[0].text;
    res.json({ reply: botReply });

  } catch (error) {
    console.error("Server Error:", error.message);
    res.json({ reply: "Connection failed. Please check your Render logs or try a mobile hotspot." });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CampusSync Server Live on Port ${PORT}`);
});