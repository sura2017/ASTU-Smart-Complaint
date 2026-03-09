const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {
    console.log(`📡 Attempting SMTP connection to send email to: ${to}`);
    
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Use SSL
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            // CRITICAL: This helps bypass firewall blocks on cloud servers
            tls: {
                rejectUnauthorized: false
            },
            connectionTimeout: 10000, // 10 seconds
        });

        const mailOptions = {
            from: `"ASTU Smart Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ NODEMAILER SUCCESS: Email sent!");
        return info;
    } catch (error) {
        console.error("❌ NODEMAILER ERROR DETAILS:", error.message);
        // We throw the error so the controller knows it failed
        throw error; 
    }
};

module.exports = sendEmail;