const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Import Route Files
const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');

// Load Environment Variables
dotenv.config();

const app = express();

// 1. GLOBAL MIDDLEWARE
app.use(express.json()); 
app.use(cors());         

// 2. STATIC FILES (For Image Uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. MAIN API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// 4. ADVANCED ASTU AI CHATBOT ENGINE
app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "I'm here! What would you like to know about the ticket system?" });

    const input = message.toLowerCase();
    let reply = "";

    // 1. TICKET CATEGORIES (Explanation of Functions)
    if (input.includes("category") || input.includes("categories")) {
        reply = "ASTU uses 4 main categories to route your issue to the right department: \n\n" +
                "• Dormitory: For water, electricity, or bed issues (Housing Office).\n" +
                "• Internet: For WiFi and network connection issues (ICT Directorate).\n" +
                "• Classroom: For broken chairs, boards, or projectors (Property Management).\n" +
                "• Laboratory: For lab equipment and computer malfunctions (Department Techs).";
    }

    // 2. SUBJECT & DESCRIPTION (How to write a good ticket)
    else if (input.includes("subject") || input.includes("description") || input.includes("how to fill")) {
        reply = "To get your issue fixed fast: \n\n" +
                "• Subject: Keep it short (e.g., 'Leaking Pipe'). It helps staff prioritize.\n" +
                "• Description: Very Important! You MUST include your Room Number and Block Number so the technician can find you. Without a location, repair will be delayed.";
    }

    // 3. LOGGING IDENTITY (Accountability)
    else if (input.includes("logging") || input.includes("my name") || input.includes("who is submitting")) {
        reply = "The system automatically detects your identity (e.g., Logging issue as: Sura Abraham). This ensures accountability—staff know exactly which student reported the issue and can contact you if they need more details about the location.";
    }

    // 4. STATUS DEFINITIONS (Keep previous logic)
    else if (input.includes("open")) {
        reply = "An 'OPEN' status means your ticket is successfully in our system and waiting for staff to pick it up.";
    } 
    else if (input.includes("progress")) {
        reply = "An 'IN PROGRESS' status means a technician has been assigned and is currently working on your repair.";
    } 
    else if (input.includes("resolved") || input.includes("fixed")) {
        reply = "A 'RESOLVED' status means the work is finished. If the issue persists, please submit a new ticket.";
    }

    // 5. REGISTRATION HELP 
    else if (input.includes("create account") || input.includes("register") || input.includes("no google")) {
        reply = "If you don't have a Google account, click 'Create Account' at the bottom of the login page to sign up manually with your university email.";
    }

    // 6. SYSTEM PURPOSE 
    else if (input.includes("why") || input.includes("purpose") || input.includes("important")) {
        reply = "This system replaces old paper forms. It ensures every ASTU student has a digital voice, and every campus problem is tracked until it is 100% resolved.";
    }

    // 7. APPRECIATION (Social)
    else if (input.includes("amazing") || input.includes("thanks") || input.includes("thank you") || input.includes("great")) {
        reply = "You're welcome! I am proud to assist ASTU students. Don't forget to attach a clear photo to your complaint to help the maintenance team!";
    }

    // 8. GREETINGS
    else if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
        reply = "Hello! I am the ASTU Smart Assistant. You can ask me about 'categories', 'how to write a description', or 'ticket statuses'. How can I help?";
    }

    // 9. SMART RANDOM FALLBACK
    else {
        const fallbacks = [
            "I'm not quite sure about that. Try asking about 'categories', 'ticket status', or 'how to register'!",
            "I'm still learning! If you have a campus issue, please click '+ New Complaint' and provide a clear description and photo.",
            "Interesting question! For ASTU maintenance issues, the best step is to file an official ticket with your room/block details."
        ];
        reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    res.json({ reply });
});
// 5. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Connected Successfully!");
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err.message);
    });

// 6. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
// Security Middleware: CORS is enabled to allow the React frontend to communicate with this API