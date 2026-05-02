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
    // UPDATED URL: Using the correct direct model path to fix the 404/NOT_FOUND error
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are CampusSync AI, the student assistant for ${profile.college}. 
            Student question: "${message}". 
            Student info: ${profile.dept}, ${profile.attendance} attendance. 
            Give a helpful and clear response.`
          }]
        }]
      })
    });

    const data = await response.json();

    // Check for Google-side errors
    if (data.error) {
      console.error("Google API Rejection:", data.error.message);
      return res.json({ reply: `System Error: ${data.error.message}` });
    }

    // Safely extract the bot's reply
    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble thinking right now. Please try again.";
    res.json({ reply: botReply });

  } catch (error) {
    console.error("Critical Connection Error:", error.message);
    res.json({ reply: "The hostel network blocked the connection. Please try a mobile hotspot!" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Final CampusSync AI Live on Port ${PORT}`);
});