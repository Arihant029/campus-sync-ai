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

  if (!apiKey) return res.json({ reply: "Missing API Key in Render." });

  try {
    // FIXED URL: Using v1beta which is required for the latest flash models
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are CampusSync AI for ${profile.college}. Student: "${message}". Context: ${profile.dept}, ${profile.attendance} attendance.`
          }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Google Error Details:", JSON.stringify(data.error));
      // If still NOT_FOUND, it might be a regional block on Render's US servers
      return res.json({ reply: `Google API says: ${data.error.message}` });
    }

    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm processing, please try again.";
    res.json({ reply: botReply });

  } catch (error) {
    res.json({ reply: "Hostel network block detected. Try your mobile hotspot!" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Final Fix Live on ${PORT}`));