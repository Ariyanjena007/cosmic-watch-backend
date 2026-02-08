/**
 * Risk Analysis Engine
 * Calculates a risk score (0-100) based on asteroid characteristics.
 */

const calculateRiskScore = (asteroid) => {
    let score = 0;

    // 1. Hazardous Status (Weight: 40)
    if (asteroid.is_potentially_hazardous) {
        score += 40;
    }

    // 2. Diameter (Weight: 20)
    // Max diameter above 1km is high risk
    const maxDia = asteroid.diameter.max;
    if (maxDia > 1) score += 20;
    else if (maxDia > 0.5) score += 15;
    else if (maxDia > 0.1) score += 10;
    else score += 5;

    // 3. Velocity (Weight: 20)
    // Relative velocity above 30km/s is high risk
    const velocity = asteroid.velocity.km_per_second;
    if (velocity > 30) score += 20;
    else if (velocity > 20) score += 15;
    else if (velocity > 10) score += 10;
    else score += 5;

    // 4. Miss Distance (Weight: 20)
    // Close approach within 1 million km is high risk
    const missDist = asteroid.miss_distance.kilometers;
    if (missDist < 1000000) score += 20;
    else if (missDist < 5000000) score += 15;
    else if (missDist < 10000000) score += 10;
    else score += 5;

    // Cap score at 100
    score = Math.min(score, 100);

    let category = 'Low';
    if (score >= 70) category = 'High';
    else if (score >= 40) category = 'Medium';

    return { score, category };
};

module.exports = { calculateRiskScore };
