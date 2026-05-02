import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Your specific SMVEC profile for the chatbot's "brain"
const profile = {
  college: "Sri Manakula Vinayagar Engineering College",
  dept: "Computer Science and Engineering",
  attendance: "85%"
};

app.post('/api/chat', async (req, res) => {
  const { message } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.json({ reply: "Chatbot Error: API Key is not configured in Render." });
  }

  try {
    // We use a direct fetch call to bypass library-level connection blocks
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are CampusSync AI, the assistant for students at ${profile.college}. 
            Student says: "${message}". 
            If they ask for a leave letter or bonafide certificate, use their info: ${profile.dept} with ${profile.attendance} attendance. 
            Be helpful, professional, and friendly.`
          }]
        }]
      })
    });

    const data = await response.json();

    // Check if the API returned an error (like an invalid key)
    if (data.error) {
      console.error("Google API Error:", data.error.message);
      return res.json({ reply: "The AI is currently sleepy. Please check if your API key is valid." });
    }

    // Extract the text from the Gemini response structure
    const botReply = data.candidates[0].content.parts[0].text;
    res.json({ reply: botReply });

  } catch (error) {
    console.error("Fetch Error:", error.message);
    res.json({ reply: "I'm having trouble connecting to the campus server. Please try again in a few seconds!" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CampusSync Chatbot Live on Port ${PORT}`);
});