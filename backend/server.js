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
// Increased limits to allow image uploads (10MB)
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// 2. PRODUCTION CORS CONFIGURATION
const allowedOrigins = [
    "https://astu-smart-complaint-zeta.vercel.app",
    "http://localhost:5173"
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS Policy blocked this origin'), false);
        }
        return callback(null, true);
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 200
}));

// 3. STATIC FILES
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 4. HEALTH CHECK / WELCOME ROUTE (To avoid "Cannot GET /")
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: "Online", 
        message: "ASTU Smart Complaint API is running",
        environment: "Production"
    });
});

// 5. MAIN API ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// 6. ADVANCED AI CHATBOT ENGINE
app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ reply: "I'm listening!" });
    const input = message.toLowerCase();
    let reply = "";

    if (input.includes("category")) {
        reply = "ASTU uses 4 categories: Dormitory, Internet, Classroom, and Laboratory.";
    } else if (input.includes("status")) {
        reply = "Check your Dashboard: 'Open' is received, 'In Progress' is being fixed, 'Resolved' is finished.";
    } else if (input.includes("hello") || input.includes("hi")) {
        reply = "Hello! 👋 I am your ASTU Assistant. How can I help you today?";
    } else {
        reply = "I suggest submitting a formal ticket with a photo so our staff can investigate immediately.";
    }
    res.json({ reply });
});

// 7. DATABASE CONNECTION
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Atlas Connected Successfully!"))
    .catch(err => console.error("❌ DB Error:", err.message));

// 8. START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Production Server running on port ${PORT}`);
});