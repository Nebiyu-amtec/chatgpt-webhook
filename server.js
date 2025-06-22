const express = require('express');
const { OpenAI } = require('openai');
const app = express();

app.use(express.json());

// Use environment variables from Render
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post('/', async (req, res) => {
  const userQuery = req.body.text || "How can I help?";
  
  try {
    const chat = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an IT consultant. Answer professionally." },
        { role: "user", content: userQuery }
      ],
      max_tokens: 100
    });

    res.json({
      fulfillmentResponse: {
        messages: [{ text: { text: [chat.choices[0].message.content] } }]
      }
    });
  } catch (error) {
    res.json({
      fulfillmentResponse: {
        messages: [{ text: { text: ["Sorry, I’m having trouble. Try again later."] } }]
      }
    });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
