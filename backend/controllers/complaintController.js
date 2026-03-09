const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// 1. Submit a new complaint (Fault-Tolerant Version)
exports.submitComplaint = async (req, res) => {
    try {
        const { studentId, title, description, category } = req.body;
        
        if (!studentId) {
            return res.status(400).json({ message: "Student ID is required." });
        }

        const attachmentUrl = req.file ? req.file.path.replace(/\\/g, "/") : null;

        // STEP 1: SAVE TO DATABASE FIRST
        const newComplaint = new Complaint({
            student: studentId,
            title,
            description,
            category,
            attachment: attachmentUrl 
        });

        await newComplaint.save();
        const trackingID = newComplaint._id.toString().slice(-8).toUpperCase();

        // STEP 2: CREATE IN-APP NOTIFICATION
        await Notification.create({
            recipient: studentId,
            message: `Ticket #${trackingID} opened successfully.`,
            complaintId: newComplaint._id
        });

        // STEP 3: RESPOND TO FRONTEND IMMEDIATELY (Before Email)
        // This stops the "Submission Failed" error on the website
        res.status(201).json({ 
            message: "Complaint submitted successfully!", 
            complaint: newComplaint 
        });

        // STEP 4: SEND EMAILS IN THE BACKGROUND (Non-blocking)
        // We do NOT use 'await' on this whole block so the student doesn't wait
        const triggerBackgroundEmails = async () => {
            try {
                const student = await User.findById(studentId);
                if (student && student.email) {
                    // Email to Student
                    const studentHtml = `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 15px;">
                            <h2 style="color: #1e3a8a;">ASTU Smart Support</h2>
                            <p>Hello <b>${student.name}</b>,</p>
                            <p>Ticket <b>#${trackingID}</b> has been logged.</p>
                        </div>
                    `;
                    await sendEmail(student.email, `Ticket Received [#${trackingID}]`, `Confirmed`, studentHtml);

                    // Email to Admin (Sura)
                    const adminHtml = `<h2>🚨 New Ticket Alert</h2><p>Student: ${student.name}</p><p>Issue: ${title}</p>`;
                    await sendEmail(process.env.ADMIN_EMAIL, "NEW TICKET ALERT: " + title, "Alert", adminHtml);
                }
            } catch (mailError) {
                console.error("⚠️ Background Email Delay/Error:", mailError.message);
            }
        };

        triggerBackgroundEmails(); // Execute without blocking res.status(201)

    } catch (err) {
        console.error("❌ Critical Submission Error:", err.message);
        res.status(500).json({ error: "Server Error", details: err.message });
    }
};

// 2. Update Complaint Status (Fault-Tolerant Version)
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedComplaint = await Complaint.findByIdAndUpdate(
            id, 
            { status }, 
            { returnDocument: 'after' } 
        ).populate('student', 'name email');

        if (!updatedComplaint) return res.status(404).json({ message: "Ticket not found" });

        // Create in-app notification
        await Notification.create({
            recipient: updatedComplaint.student._id,
            message: `Ticket Update: Your issue "${updatedComplaint.title}" is now ${status.toUpperCase()}.`,
            complaintId: updatedComplaint._id
        });

        // Respond to Admin immediately
        res.json({ message: "Status updated", updatedComplaint });

        // Send Email in background
        (async () => {
            try {
                const trackingID = updatedComplaint._id.toString().slice(-8).toUpperCase();
                const emailHtml = `<h2>ASTU Update</h2><p>Ticket #${trackingID} is now ${status.toUpperCase()}.</p>`;
                await sendEmail(updatedComplaint.student.email, `Ticket Update #${trackingID}`, `Status: ${status}`, emailHtml);
            } catch (mailErr) {
                console.error("⚠️ Background Status Email Error:", mailErr.message);
            }
        })();

    } catch (err) {
        console.error("Update Status Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// --- OTHERS ---
exports.getStudentComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find({ student: req.params.studentId }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find().populate('student', 'name email').sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.params.userId }).sort({ createdAt: -1 }).limit(10);
        res.json(notifications);
    } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.markAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.params.userId }, { isRead: true });
        res.json({ message: "Read" });
    } catch (err) { res.status(500).json({ error: err.message }); }
};