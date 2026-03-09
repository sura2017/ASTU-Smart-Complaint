const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            // --- CRITICAL FIX FOR ENETUNREACH ---
            family: 4, // Forces Nodemailer to use IPv4 instead of IPv6
            tls: {
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
        console.log("📧 Success: Email sent via IPv4 to", to);
        return info;
    } catch (error) {
        console.error("❌ NODEMAILER ERROR:", error.message);
        throw error; 
    }
};

module.exports = sendEmail;