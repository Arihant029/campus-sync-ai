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
    // Corrected endpoint URL to avoid the 404 error seen in your logs
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are CampusSync AI, an assistant for students at ${profile.college}. 
            Student question: "${message}". 
            Context: The student is in ${profile.dept} with ${profile.attendance} attendance. 
            Provide a helpful, professional response.`
          }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error("Google API Error:", data.error.message);
      return res.json({ reply: `System Error: ${data.error.message}` });
    }

    const botReply = data.candidates[0].content.parts[0].text;
    res.json({ reply: botReply });

  } catch (error) {
    console.error("Server Error:", error.message);
    res.json({ reply: "I'm having trouble connecting to the AI right now. This usually happens on restricted hostel networks. Please try using a mobile hotspot!" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CampusSync AI Server Live on Port ${PORT}`);
});