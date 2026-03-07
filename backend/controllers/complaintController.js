const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const User = require('../models/User'); // Moved to top
const sendEmail = require('../utils/sendEmail');

// 1. Submit a new complaint (Student) - OPTIMIZED FOR CLOUDINARY
exports.submitComplaint = async (req, res) => {
    try {
        const { studentId, title, description, category } = req.body;
        
        // Safety Check: Ensure studentId is sent from Frontend
        if (!studentId) {
            return res.status(400).json({ message: "Student ID is required. Please re-login." });
        }

        // With Cloudinary, req.file.path is the FULL permanent URL
        const attachmentUrl = req.file ? req.file.path : null;

        const newComplaint = new Complaint({
            student: studentId,
            title,
            description,
            category,
            attachment: attachmentUrl 
        });

        await newComplaint.save();

        // --- 1. Create In-App Notification ---
        await Notification.create({
            recipient: studentId,
            message: `Success: Your ticket "${title}" has been logged for review.`,
            complaintId: newComplaint._id
        });

        // --- 2. Send Confirmation Email ---
        // We find the user to ensure they exist before sending email
        const user = await User.findById(studentId);
        
        if (user) {
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
            // Non-blocking email send (won't crash the response if email fails)
            sendEmail(user.email, "Ticket Received: " + title, "Your ticket is received.", emailHtml).catch(e => console.log("Email error ignored"));
        }

        res.status(201).json({ message: "Complaint submitted successfully!", complaint: newComplaint });
    } catch (err) {
        console.error("SUBMISSION CRASH DETAILS:", err);
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// 2. Get complaints for a specific student
exports.getStudentComplaints = async (req, res) => {
    try {
        const { studentId } = req.params;
        const complaints = await Complaint.find({ student: studentId }).sort({ createdAt: -1 });
        res.json(complaints);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. Get ALL complaints (Admin)
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

// 4. Update Complaint Status
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
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="font-size: 10px; color: #94a3b8; text-align: center;">This is an automated message from the ASTU Smart Complaint System.</p>
            </div>
        `;

        sendEmail(updatedComplaint.student.email, `Update on Ticket #${trackingID}`, `Status: ${status}`, emailHtml).catch(e => console.log("Email error ignored"));

        res.json({ message: "Status updated", updatedComplaint });
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