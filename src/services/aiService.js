const OpenAI = require("openai");

let openai = null;

const initializeAI = () => {
    if (process.env.OPENAI_API_KEY) {
        console.log("✅ AI Service: OPENAI_API_KEY loaded.");
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    } else {
        console.warn("⚠️ AI Service: OPENAI_API_KEY MISSING in .env");
    }
};

// Auto-initialize on load
initializeAI();

const getChatResponse = async (message, context = "") => {
    if (!openai) initializeAI();
    if (!openai) return "System Error: AI Neural Link Offline (Missing OpenAI API Key).";

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are "Cosmic AI", an advanced asteroid tracking assistant for the Cosmic Watch platform. 
                    Your tone is futuristic, precise, yet helpful. You analyze astronomical data.
                    
                    Context Data about current asteroids: ${context}
                    
                    Answer the user briefly and accurately. Use space-themed terminology where appropriate.`
                },
                { role: "user", content: message }
            ],
            max_tokens: 150
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error("OpenAI Error:", error);
        return "Communications Disrupted. Solar flare interference detected.";
    }
};

module.exports = { getChatResponse };
