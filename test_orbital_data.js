const axios = require('axios');

(async () => {
    // Asteroid ID from screenshot: 513529 (2010 CR1) -> actually using 2513529 from logs or known IDs.
    // Let's use a known ID like 3542519 (Apophis) or just a random one.
    // The logs showed: GET /asteroid/2513529
    const id = "2513529";
    console.log(`Testing Asteroid API for ID: ${id}`);

    try {
        const response = await axios.get(`http://localhost:5000/api/neo/${id}`);
        console.log("Keys in response:", Object.keys(response.data));
        if (response.data.orbital_data) {
            console.log("Orbital Data Found: YES");
            console.log("Eccentricity:", response.data.orbital_data.eccentricity);
        } else {
            console.error("Orbital Data Found: NO");
        }
    } catch (error) {
        console.error("API Error:", error.message);
        if (error.response) console.log(error.response.data);
    }
})();
