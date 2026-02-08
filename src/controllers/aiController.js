const aiService = require('../services/aiService');

const chat = async (req, res) => {
    try {
        const { message, context } = req.body;

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }

        const response = await aiService.getChatResponse(message, context);
        res.json({ response });
    } catch (error) {
        console.error("Chat Controller Error:", error);
        if (error.response) {
            console.error("Google API Error Data:", error.response.data);
            console.error("Google API Error Status:", error.response.status);
        }
        res.status(500).json({ error: "Internal AI Error", details: error.message });
    }
};

module.exports = { chat };
