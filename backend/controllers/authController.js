const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');

// --- PASSWORD STRENGTH CONFIGURATION ---
// Requires: 8-32 characters, 1 Uppercase, 1 Lowercase, 1 Number, 1 Special Character
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,32}$/;

// 1. MANUAL REGISTRATION
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // --- NEW: BACKEND PASSWORD VALIDATION ---
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                message: "Password does not meet ASTU security requirements: 8-32 characters, including uppercase, lowercase, number, and special character." 
            });
        }
        
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        user = new User({ name, email, password, role });
        await user.save();
        
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. MANUAL LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // --- NEW: FORMAT VALIDATION BEFORE DB CALL ---
        if (!passwordRegex.test(password)) {
            return res.status(401).json({ message: "Invalid credentials format." });
        }

        const user = await User.findOne({ email });
        
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ 
            token, 
            user: { id: user._id, name: user.name, role: user.role } 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. GOOGLE LOGIN (Password rule not required as Google handles security)
exports.googleLogin = async (req, res) => {
    const { name, email, googleId } = req.body;
    try {
        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                name,
                email,
                password: googleId, // Google ID acts as a unique hash
                role: 'Student'
            });
            await user.save();
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
    } catch (err) {
        console.error("Google Login Error:", err.message);
        res.status(500).json({ error: "Server failed to process Google Login" });
    }
};

// 4. GITHUB LOGIN (Robust Version)
exports.githubLogin = async (req, res) => {
    const { code } = req.body;
    try {
        const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        }, { headers: { accept: 'application/json' } });

        const accessToken = tokenRes.data.access_token;
        if (!accessToken) {
            return res.status(400).json({ error: "Invalid or expired GitHub code" });
        }

        const userRes = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` }
        });

        const emailRes = await axios.get('https://api.github.com/user/emails', {
            headers: { Authorization: `token ${accessToken}` }
        });

        const primaryEmail = emailRes.data.find(e => e.primary && e.verified)?.email || emailRes.data[0].email;

        let user = await User.findOne({ email: primaryEmail });
        if (!user) {
            user = new User({
                name: userRes.data.name || userRes.data.login,
                email: primaryEmail,
                password: userRes.data.id.toString(), 
                role: 'Student'
            });
            await user.save();
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ 
            token, 
            user: { id: user._id, name: user.name, role: user.role } 
        });

    } catch (err) {
        console.error("GITHUB LOGIN ERROR:", err.response?.data || err.message);
        res.status(500).json({ error: "GitHub Authentication Failed" });
    }
};