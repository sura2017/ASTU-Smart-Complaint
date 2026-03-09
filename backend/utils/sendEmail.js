const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {
    try {
        // Create the transporter with specific cloud-hosting fixes
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // Must be false for port 587
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
            // --- THE CRITICAL FIXES FOR RENDER ---
            family: 4,           // FORCES IPv4 (Fixes ENETUNREACH)
            connectionTimeout: 20000, // 20 seconds wait for connection
            greetingTimeout: 20000,   // 20 seconds wait for Gmail to say hello
            socketTimeout: 25000,     // 25 seconds wait for data
            tls: {
                rejectUnauthorized: false // Prevents SSL certificate blocks
            }
        });

        const mailOptions = {
            from: `"ASTU Smart Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        };

        console.log(`📡 Attempting to send email to: ${to}...`);
        
        const info = await transporter.sendMail(mailOptions);
        
        console.log("📧 Success: Email delivered! ID:", info.messageId);
        return info;
    } catch (error) {
        // This will now show much more detail in your Render logs
        console.error("❌ NODEMAILER ERROR:", error.message);
        if (error.code === 'ECONNRESET') console.error("Tip: The connection was closed by the server.");
        if (error.code === 'ETIMEDOUT') console.error("Tip: Connection took too long. Check Render's outbound rules.");
        
        throw error; 
    }
};

module.exports = sendEmail;