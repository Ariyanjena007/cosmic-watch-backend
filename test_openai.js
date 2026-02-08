require('dotenv').config();
const OpenAI = require("openai");

(async () => {
    console.log("Testing OpenAI Model: gpt-4.1-turbo");
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4.1-turbo",
            messages: [{ role: "user", content: "Hello" }],
            max_tokens: 10
        });
        console.log("Success:", completion.choices[0].message.content);
    } catch (error) {
        console.error("Error:", error.message);
    }
})();
