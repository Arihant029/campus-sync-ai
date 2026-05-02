import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] })
    });

    const data = await response.json();
    res.json({ reply: data.candidates[0].content.parts[0].text });
  } catch (error) {
    res.json({ reply: "The hostel network is blocking the AI connection. Switch to a mobile hotspot to verify!" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0');