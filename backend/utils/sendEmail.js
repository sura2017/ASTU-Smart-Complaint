const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {
    console.log(`Attempting to send email to: ${to}...`); // LOG 1
    
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
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
        console.log("✅ NODEMAILER SUCCESS:", info.response); // LOG 2
    } catch (error) {
        console.error("❌ NODEMAILER CRASH:", error.message); // LOG 3
    }
};

module.exports = sendEmail;