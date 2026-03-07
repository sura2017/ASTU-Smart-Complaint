const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const sendEmail = require('../utils/sendEmail');

// 1. Submit a new complaint (Student) - UPDATED FOR CLOUDINARY
exports.submitComplaint = async (req, res) => {
    try {
        const { studentId, title, description, category } = req.body;
        
        // When using Cloudinary, req.file.path is the FULL permanent URL
        // Example: https://res.cloudinary.com/dilhesmdd/image/upload/...
        const attachmentUrl = req.file ? req.file.path : null;

        const newComplaint = new Complaint({
            student: studentId,
            title,
            description,
            category,
            attachment: attachmentUrl // Saving the permanent cloud link
        });

        await newComplaint.save();

        // --- 1. Create In-App Notification ---
        await Notification.create({
            recipient: studentId,
            message: `Success: Your ticket "${title}" has been logged for review.`,
            complaintId: newComplaint._id
        });

        // --- 2. Send Confirmation Email ---
        const User = require('../models/User');
        const user = await User.findById(studentId);
        
        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 15px;">
                <h2 style="color: #1e3a8a;">ASTU Smart Complaint System</h2>
                <p>Hello <b>${user.name}</b>,</p>
                <p>Your ticket has been successfully submitted and is now <b>OPEN</b>.</p>
                <div style="background: #f8fafc; padding: 15px; border-radius: 10px; margin: 15px 0;">
                    <p><b>Ticket ID:</b> #${newComplaint._id.toString().slice(-8).toUpperCase()}</p>
                    <p><b>Subject:</b> ${title}</p>
                </div>
                <p>Our maintenance team will review your issue shortly.</p>
            </div>
        `;
        
        await sendEmail(user.email, "Ticket Received: " + title, emailHtml);

        res.status(201).json({ message: "Complaint submitted successfully!", complaint: newComplaint });
    } catch (err) {
        console.error("Submission Error:", err);
        res.status(500).json({ error: err.message });
    }
};

// 2. Get complaints for a specific student (Dashboard)
exports.getStudentComplaints = async (req, res) => {
    try {
        const { studentId } = req.params;
        const complaints = await Complaint.find({ student: studentId }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Get ALL complaints (For Admin/Staff Panel)
exports.getAllComplaints = async (req, res) => {
    try {
        const complaints = await Complaint.find()
            .populate('student', 'name email')
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. Update Complaint Status + IN-APP NOTIF + EMAIL NOTIF
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedComplaint = await Complaint.findByIdAndUpdate(id, { status }, { new: true })
            .populate('student', 'name email');

        if (!updatedComplaint) {
            return res.status(404).json({ message: "Complaint not found" });
        }

        await Notification.create({
            recipient: updatedComplaint.student._id,
            message: `Ticket Update: Your issue "${updatedComplaint.title}" is now ${status.toUpperCase()}.`,
            complaintId: updatedComplaint._id
        });

        const trackingID = updatedComplaint._id.toString().slice(-8).toUpperCase();
        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #e2e8f0; padding: 30px; border-radius: 20px;">
                <h1 style="color: #1e3a8a; font-size: 22px;">ASTU Maintenance Update</h1>
                <p>Hello <b>${updatedComplaint.student.name}</b>,</p>
                <p>The status of your ticket <b>#${trackingID}</b> has been updated.</p>
                <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin: 20px 0;">
                    <p style="margin: 0; color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">Current Status</p>
                    <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: ${status === 'Resolved' ? '#059669' : '#2563eb'};">
                        ${status.toUpperCase()}
                    </p>
                </div>
                <p>Please log in to the portal to track the full resolution process.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 10px; color: #94a3b8; text-align: center;">This is an automated message from the ASTU Smart Complaint System.</p>
            </div>
        `;

        await sendEmail(updatedComplaint.student.email, `Update on Ticket #${trackingID}`, emailHtml);

        res.json({ message: "Status updated and student notified", updatedComplaint });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. Get Notifications
exports.getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        const notifications = await Notification.find({ recipient: userId }).sort({ createdAt: -1 }).limit(10);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 6. Mark Read
exports.markAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.params.userId }, { isRead: true });
        res.json({ message: "Read" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};