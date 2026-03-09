const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// 1. Submit a new complaint (Student Submits -> Student & Admin get notified)
exports.submitComplaint = async (req, res) => {
    try {
        const { studentId, title, description, category } = req.body;
        
        if (!studentId) {
            return res.status(400).json({ message: "Student ID is required." });
        }

        const attachmentUrl = req.file ? req.file.path : null;

        const newComplaint = new Complaint({
            student: studentId,
            title,
            description,
            category,
            attachment: attachmentUrl 
        });

        await newComplaint.save();
        const trackingID = newComplaint._id.toString().slice(-8).toUpperCase();

        // Find the student to get their email and name
        const student = await User.findById(studentId);

        // --- 1. Create In-App Notification for Student ---
        await Notification.create({
            recipient: studentId,
            message: `Submission Successful: Ticket #${trackingID} is now OPEN.`,
            complaintId: newComplaint._id
        });

        if (student) {
            // --- 2. Email to Student (Confirmation) ---
            const studentHtml = `
                <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 15px;">
                    <h2 style="color: #1e3a8a;">ASTU Smart Support</h2>
                    <p>Hello <b>${student.name}</b>,</p>
                    <p>Your ticket has been successfully logged. Tracking ID: <b>#${trackingID}</b>.</p>
                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 10px; margin: 15px 0;">
                        <p><b>Subject:</b> ${title}</p>
                        <p><b>Status:</b> OPEN</p>
                    </div>
                    <p>Maintenance staff will review this shortly.</p>
                </div>
            `;
            // CRITICAL: Added 'await' to ensure email sends before response
            await sendEmail(student.email, `Ticket Received [#${trackingID}]`, `Ticket confirmed`, studentHtml);

            // --- 3. Email to Administrator (Alerting You) ---
            const adminHtml = `
                <div style="font-family: sans-serif; border: 2px solid #3b82f6; padding: 20px; border-radius: 15px;">
                    <h2 style="color: #1e3a8a;">🚨 New Campus Issue Reported</h2>
                    <p><b>From Student:</b> ${student.name} (${student.email})</p>
                    <p><b>Department:</b> ${category}</p>
                    <p><b>Subject:</b> ${title}</p>
                    <p><b>Tracking ID:</b> #${trackingID}</p>
                    <br/>
                    <a href="https://astu-smart-complaint-zeta.vercel.app/admin" style="background: #1e3a8a; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold;">Access Admin Portal</a>
                </div>
            `;
            // CRITICAL: Added 'await' and ensures ADMIN_EMAIL is used
            await sendEmail(process.env.ADMIN_EMAIL, "NEW TICKET ALERT: " + title, "Action required", adminHtml);
        }

        res.status(201).json({ message: "Complaint submitted and notifications sent!", complaint: newComplaint });
    } catch (err) {
        console.error("Submission Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// 2. Update Complaint Status (Admin Updates -> Student gets notified)
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedComplaint = await Complaint.findByIdAndUpdate(id, { status }, { new: true })
            .populate('student', 'name email');

        if (!updatedComplaint) return res.status(404).json({ message: "Ticket not found" });

        // --- 1. Create In-App Notification ---
        await Notification.create({
            recipient: updatedComplaint.student._id,
            message: `Ticket Update: Your issue "${updatedComplaint.title}" is now ${status.toUpperCase()}.`,
            complaintId: updatedComplaint._id
        });

        // --- 2. Email to Student (Status Update Alert) ---
        const trackingID = updatedComplaint._id.toString().slice(-8).toUpperCase();
        const statusColor = status === 'Resolved' ? '#059669' : '#2563eb';
        
        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #e2e8f0; padding: 30px; border-radius: 20px;">
                <h2 style="color: #1e3a8a;">ASTU Ticket Update</h2>
                <p>Hello <b>${updatedComplaint.student.name}</b>,</p>
                <p>The status of your ticket <b>#${trackingID}</b> has been changed.</p>
                <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <p style="margin: 0; color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">New Status</p>
                    <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: bold; color: ${statusColor};">${status.toUpperCase()}</p>
                </div>
                <p>Log in to the student portal to view updates.</p>
            </div>
        `;

        if (updatedComplaint.student.email) {
            // CRITICAL: Added 'await'
            await sendEmail(updatedComplaint.student.email, `Update on Ticket #${trackingID}`, `Status: ${status}`, emailHtml);
        }

        res.json({ message: "Status updated and student notified", updatedComplaint });

    } catch (err) {
        console.error("Update Status Email Error:", err.message);
        res.status(500).json({ error: err.message });
    }
};

// --- OTHERS STAY THE SAME ---
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