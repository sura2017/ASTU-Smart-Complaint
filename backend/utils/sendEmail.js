const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465, // Use 465 for a secure, direct tunnel
            secure: true, 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            // --- THE CRITICAL FIX FOR RENDER ---
            family: 4,               // FORCES IPv4 (Fixes ENETUNREACH)
            connectionTimeout: 30000, // Wait 30 seconds for slow cloud network
            greetingTimeout: 30000,
            tls: {
                rejectUnauthorized: false // Prevents security certificate blocks
            }
        });

        const mailOptions = {
            from: `"ASTU Smart Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        console.log(`📡 SMTP: Handshaking with Google for ${to}...`);
        const info = await transporter.sendMail(mailOptions);
        console.log("📧 Success! Email delivered:", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ NODEMAILER ERROR:", error.message);
        return null; // Don't crash the server if email fails
    }
};

module.exports = sendEmail;