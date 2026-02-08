const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
    service: 'gmail', // Default to gmail, can be configured via env
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendAlertEmail = async (userEmail, alert) => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('⚠️  Email credentials not found in .env. Skipping email dispatch.');
        console.log(`   [MOCK EMAIL] To: ${userEmail} | Subject: ${alert.severity} Alert: ${alert.asteroidName}`);
        return;
    }

    try {
        const subject = `⚠️ Cosmic Watch Alert: ${alert.severity} Risk - ${alert.asteroidName}`;

        const getColor = (severity) => {
            switch (severity) {
                case 'CRITICAL': return '#ff0000';
                case 'HIGH': return '#ff4500';
                case 'MEDIUM': return '#ffa500';
                default: return '#00ced1';
            }
        };

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0b0d17; color: #ffffff; padding: 20px; border-radius: 10px;">
                <h2 style="color: ${getColor(alert.severity)}; text-align: center; text-transform: uppercase;">
                    ${alert.severity} ALERT
                </h2>
                <div style="background-color: #15192b; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #00f0ff;">${alert.asteroidName}</h3>
                    <p style="font-size: 16px; line-height: 1.5;">${alert.message.replace(/\n/g, '<br>')}</p>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                        <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 5px;">
                            <span style="display: block; font-size: 12px; color: #888;">RISK SCORE</span>
                            <span style="font-size: 18px; font-weight: bold;">${alert.riskScore}/100</span>
                        </div>
                        <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 5px;">
                            <span style="display: block; font-size: 12px; color: #888;">MISS DISTANCE</span>
                            <span style="font-size: 18px; font-weight: bold;">${alert.missDistance.toLocaleString()} km</span>
                        </div>
                    </div>
                </div>
                <p style="text-align: center; color: #555; font-size: 12px;">
                    Cosmic Watch Automated Alert System
                </p>
            </div>
        `;

        const info = await transporter.sendMail({
            from: `"Cosmic Watch System" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: subject,
            html: html
        });

        console.log(`📧 Email sent to ${userEmail}: ${info.messageId}`);
        return info;
    } catch (error) {
        console.error('❌ Error sending email:', error.message);
    }
};

module.exports = { sendAlertEmail };
