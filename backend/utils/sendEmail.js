const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,        // Use 465 for Secure SMTP
            secure: true,      // Must be true for 465
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            // FORCE IPv4 (Fixes the ENETUNREACH error)
            family: 4, 
            connectionTimeout: 10000, // 10 seconds is enough for a good connection
            greetingTimeout: 10000,
            // Add logging so you can see the handshake in Render Logs
            logger: true,
            debug: true 
        });

        const mailOptions = {
            from: `"ASTU Smart Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        console.log(`📡 SMTP Handshake started for: ${to}`);
        const info = await transporter.sendMail(mailOptions);
        console.log("📧 EMAIL SENT SUCCESSFULLY:", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ NODEMAILER ERROR:", error.message);
        // Do not throw error here so the background task doesn't crash the server
        return null;
    }
};

module.exports = sendEmail;