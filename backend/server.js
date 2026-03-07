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

// 1. GLOBAL MIDDLEWARE & PRODUCTION CORS FIX
app.use(express.json()); 

// --- CRITICAL: ALLOW VERCEL TO COMMUNICATE WITH RENDER ---
app.use(cors({
    origin: [
        "https://astu-smart-complaint-zeta.vercel.app", 
        "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

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

    if (input.includes("category") || input.includes("categories")) {
        reply = "ASTU uses 4 main categories to route your issue to the right department: \n\n • Dormitory: For water, electricity, or bed issues. \n • Internet: For WiFi and network connection issues. \n • Classroom: For broken furniture or projectors. \n • Laboratory: For lab equipment and computers.";
    }
    else if (input.includes("subject") || input.includes("description") || input.includes("how to fill")) {
        reply = "To get your issue fixed fast: \n\n • Subject: Keep it short (e.g., 'Leaking Pipe'). \n • Description: Include your Room and Block Number so the technician can find you.";
    }
    else if (input.includes("status") || input.includes("open") || input.includes("progress")) {
        reply = "An 'OPEN' status means we received it. 'IN PROGRESS' means a technician is working on it. 'RESOLVED' means it is fixed!";
    } 
    else if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
        reply = "Hello! 👋 Welcome to the ASTU Smart Support Portal. I am your dedicated Virtual Assistant. I can help you understand categories, guide you in writing descriptions, or check ticket status. How can I help?";
    }
    else {
        const fallbacks = [
            "I'm not quite sure about that. Try asking about 'categories', 'ticket status', or 'how to register'!",
            "For ASTU maintenance issues, the best step is to file an official ticket with your room/block details."
        ];
        reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    res.json({ reply });
});

// 5. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

// 6. START SERVER (Production Dynamic Port)
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});