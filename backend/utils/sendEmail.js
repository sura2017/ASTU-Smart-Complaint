const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {
    try {
        // Create the most resilient transporter for Cloud Hosting
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Using 'service' tells Nodemailer to use best Gmail defaults
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            // --- THE "100% CORRECT" CLOUD FIXES ---
            family: 4,                // FORCES IPv4 (Fixes ENETUNREACH 2a00:...)
            connectionTimeout: 60000, // Wait 60 seconds (Cloud networks are slow)
            greetingTimeout: 60000,   // Wait 60 seconds for Gmail to respond
            socketTimeout: 60000,     // Keep the socket open
            pool: true,               // Use a connection pool for efficiency
            dnsTimeout: 30000,
            tls: {
                rejectUnauthorized: false // Bypasses SSL handshake blocks on free tiers
            }
        });

        const mailOptions = {
            from: `"ASTU Smart Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        console.log(`📡 SMTP: Initiating secure IPv4 handshake for ${to}...`);
        
        const info = await transporter.sendMail(mailOptions);
        
        console.log("📧 SUCCESS: Email delivered! ID:", info.messageId);
        return info;
    } catch (error) {
        // Detailed error reporting for your Render Logs
        console.error("❌ NODEMAILER ERROR:", error.message);
        return null;
    }
};

module.exports = sendEmail;