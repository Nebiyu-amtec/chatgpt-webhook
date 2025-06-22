const express = require('express');
const { OpenAI } = require('openai');
const app = express();

app.use(express.json());

// Verify API Key exists
if (!process.env.OPENAI_API_KEY) {
    console.error("FATAL ERROR: OPENAI_API_KEY environment variable is missing");
    process.exit(1);
}

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.post('/', async (req, res) => {
    // Validate request
    if (!req.body) {
        return res.status(400).json({ 
            fulfillmentResponse: {
                messages: [{
                    responseType: "RESPONSE_TYPE_TEXT",
                    text: { text: ["Invalid request format"] }
                }]
            }
        });
    }

    const userQuery = req.body.text || 
                     req.body.queryResult?.queryText || 
                     req.body.sessionInfo?.parameters?.text || 
                     "How can I help?";
    
    console.log("Processing query:", userQuery);

    try {
        const chat = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are an IT consultant. Keep answers professional and under 100 words." },
                { role: "user", content: userQuery }
            ],
            max_tokens: 100,
            temperature: 0.7
        });

        const responseText = chat.choices[0].message.content;
        console.log("Generated response:", responseText);

        res.json({
            fulfillmentResponse: {
                messages: [{
                    responseType: "RESPONSE_TYPE_TEXT",
                    text: { text: [responseText] }
                }]
            }
        });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({
            fulfillmentResponse: {
                messages: [{
                    responseType: "RESPONSE_TYPE_TEXT",
                    text: { text: ["Sorry, I'm experiencing technical difficulties. Please try again later."] }
                }]
            }
        });
    }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log("OpenAI API Key:", process.env.OPENAI_API_KEY ? "***" + process.env.OPENAI_API_KEY.slice(-4) : "MISSING");
});
