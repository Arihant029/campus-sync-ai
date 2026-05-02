import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// If your hostel blocks the API, this forces it through a public proxy
const proxyAgent = new HttpsProxyAgent("http://your-proxy-url:port"); 

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      agent: proxyAgent, // This routes the traffic through the proxy
      body: JSON.stringify({
        contents: [{ parts: [{ text: message }] }]
      })
    });

    const data = await response.json();
    const botReply = data.candidates[0].content.parts[0].text;
    res.json({ reply: botReply });

  } catch (error) {
    console.error("Connection failed:", error.message);
    res.json({ reply: "Hostel network is still blocking. Try switching to mobile data!" });
  }
});