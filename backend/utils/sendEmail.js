const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {
    try {
        // We use port 587 (STARTTLS) which is more stable on Render than 465
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // Must be false for port 587
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            tls: {
                // This prevents the "Unreachable" error on some cloud networks
                rejectUnauthorized: false 
            }
        });

        const mailOptions = {
            from: `"ASTU Smart Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("📧 Success: Email delivered to", to);
        return info;
    } catch (error) {
        // Detailed logging to help you during the demo
        console.error("❌ NODEMAILER ERROR:", error.message);
        throw error; // Pass the error to the controller
    }
};

module.exports = sendEmail;