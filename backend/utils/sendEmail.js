const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            // Use host for better reliability on live servers
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"ASTU Smart Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("📧 Success: Email sent to", to, "| ID:", info.messageId);
    } catch (error) {
        console.error("❌ Nodemailer Error:", error.message);
    }
};

module.exports = sendEmail;