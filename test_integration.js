const axios = require('axios');

(async () => {
    console.log("Testing API Endpoint: http://localhost:5000/api/chat");
    try {
        const response = await axios.post('http://localhost:5000/api/chat', {
            message: "System Check",
            context: "Testing connectivity"
        });
        console.log("Status:", response.status);
        console.log("Response:", response.data);
    } catch (error) {
        console.error("API Error:", error.message);
        if (error.response) {
            console.error("Data:", error.response.data);
        }
    }
})();
