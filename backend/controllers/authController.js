const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');

// 1. MANUAL REGISTRATION
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
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

// 3. GOOGLE LOGIN
exports.googleLogin = async (req, res) => {
    const { name, email, googleId } = req.body;
    try {
        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                name,
                email,
                password: googleId, 
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
        // Step A: Exchange code for Access Token
        const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code
        }, { headers: { accept: 'application/json' } });

        const accessToken = tokenRes.data.access_token;
        if (!accessToken) {
            return res.status(400).json({ error: "Invalid or expired GitHub code" });
        }

        // Step B: Get Profile Info
        const userRes = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${accessToken}` }
        });

        // Step C: Get Private Emails (Professional Step)
        // Some GitHub users hide their email; this fetches all their emails to find the primary one.
        const emailRes = await axios.get('https://api.github.com/user/emails', {
            headers: { Authorization: `token ${accessToken}` }
        });

        // Find the primary verified email
        const primaryEmailObj = emailRes.data.find(e => e.primary && e.verified) || emailRes.data[0];
        const primaryEmail = primaryEmailObj.email;

        // Step D: Find or Create User
        let user = await User.findOne({ email: primaryEmail });
        if (!user) {
            user = new User({
                name: userRes.data.name || userRes.data.login || "GitHub User",
                email: primaryEmail,
                password: userRes.data.id.toString(), // Dummy password using GitHub ID
                role: 'Student'
            });
            await user.save();
        }

        // Step E: Generate App JWT
        const token = jwt.sign(
            { id: user._id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({ 
            token, 
            user: { id: user._id, name: user.name, role: user.role } 
        });

    } catch (err) {
        console.error("GITHUB LOGIN ERROR:", err.response?.data || err.message);
        res.status(500).json({ error: "GitHub Authentication Failed" });
    }
};