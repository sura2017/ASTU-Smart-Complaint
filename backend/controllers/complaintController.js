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

        const attachmentUrl = req.file ? req.file.path.replace(/\\/g, "/") : null;

        const newComplaint = new Complaint({
            student: studentId,
            title,
            description,
            category,
            attachment: attachmentUrl 
        });

        await newComplaint.save();
        const trackingID = newComplaint._id.toString().slice(-8).toUpperCase();

        // Create In-App Notification
        await Notification.create({
            recipient: studentId,
            message: `Submission Successful: Ticket #${trackingID} is now OPEN.`,
            complaintId: newComplaint._id
        });

        // Respond to Frontend Immediately
        res.status(201).json({ message: "Success", complaint: newComplaint });

        // --- BACKGROUND EMAIL LOGIC ---
        const triggerEmails = async () => {
            try {
                const student = await User.findById(studentId);
                if (student && student.email) {
                    // STUDENT EMAIL TEMPLATE
                    const studentHtml = `
                        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background-color: #ffffff; color: #1e293b;">
                            <div style="background-color: #1e3a8a; padding: 30px; text-align: center;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px;">ASTU Smart Support 👋</h1>
                            </div>
                            <div style="padding: 40px;">
                                <h2 style="color: #1e3a8a; margin-top: 0;">Hi ${student.name}!</h2>
                                <p style="font-size: 16px; line-height: 1.6;">We have successfully received your ticket. Our campus maintenance team has been notified and will review your issue shortly. 🚀</p>
                                
                                <div style="background-color: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 30px 0; border-radius: 12px;">
                                    <p style="margin: 0; color: #64748b; font-size: 12px; font-weight: bold; text-transform: uppercase;">Tracking Reference</p>
                                    <p style="margin: 5px 0; font-size: 22px; font-weight: 1000; color: #1e3a8a;">#${trackingID}</p>
                                    <p style="margin: 15px 0 5px 0;"><b>Issue:</b> ${title}</p>
                                    <p style="margin: 0;"><b>Department:</b> ${category}</p>
                                </div>

                                <p style="font-size: 14px; color: #64748b;">You can check the live progress and talk to our AI Assistant anytime via your personal dashboard.</p>
                                
                                <div style="text-align: center; margin-top: 30px;">
                                    <a href="https://astu-smart-complaint-zeta.vercel.app" style="background-color: #1e3a8a; color: #ffffff; padding: 14px 30px; text-decoration: none; border-radius: 14px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(30, 58, 138, 0.2);">Open Dashboard</a>
                                </div>
                            </div>
                            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
                                Authorized ASTU Smart Management System &copy; 2026
                            </div>
                        </div>
                    `;
                    await sendEmail(student.email, `🎫 Ticket Confirmed: #${trackingID}`, `Hello ${student.name}`, studentHtml);

                    // ADMIN ALERT EMAIL TEMPLATE
                    const adminHtml = `
                        <div style="font-family: sans-serif; padding: 20px; border: 2px solid #ef4444; border-radius: 20px;">
                            <h2 style="color: #ef4444;">🚨 New Maintenance Alert</h2>
                            <p><b>Student:</b> ${student.name}</p>
                            <p><b>Category:</b> ${category}</p>
                            <p><b>Issue:</b> ${title}</p>
                            <p><b>Ref ID:</b> #${trackingID}</p>
                            <a href="https://astu-smart-complaint-zeta.vercel.app/admin">Click here to manage this issue</a>
                        </div>
                    `;
                    await sendEmail(process.env.ADMIN_EMAIL, `🚨 NEW TICKET: ${title}`, "New Ticket Alert", adminHtml);
                }
            } catch (err) { console.error("BG Mail Error:", err.message); }
        };
        triggerEmails();

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. Update Complaint Status (Beautiful Dynamic Updates)
exports.updateComplaintStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedComplaint = await Complaint.findByIdAndUpdate(id, { status }, { returnDocument: 'after' })
            .populate('student', 'name email');

        if (!updatedComplaint) return res.status(404).json({ message: "Ticket not found" });

        await Notification.create({
            recipient: updatedComplaint.student._id,
            message: `Ticket Update: Your issue "${updatedComplaint.title}" is now ${status.toUpperCase()}.`,
            complaintId: updatedComplaint._id
        });

        res.json({ message: "Status updated", updatedComplaint });

        // --- DYNAMIC STATUS EMAIL LOGIC ---
        const sendStatusEmail = async () => {
            try {
                const trackingID = updatedComplaint._id.toString().slice(-8).toUpperCase();
                
                // Determine Visual style based on status
                let statusEmoji = "📢";
                let statusHeader = "Update Received";
                let statusColor = "#3b82f6"; // Blue
                let statusMessage = "The department has reviewed your ticket and updated its progress.";

                if (status === 'In Progress') {
                    statusEmoji = "🛠️";
                    statusHeader = "Working On It";
                    statusColor = "#d97706"; // Amber
                    statusMessage = "Good news! A technician has been assigned and is currently working on your repair. We appreciate your patience while we fix this. ⏳";
                } else if (status === 'Resolved') {
                    statusEmoji = "✅";
                    statusHeader = "Issue Resolved!";
                    statusColor = "#059669"; // Green
                    statusMessage = "Excellent! Our team has completed the work and verified the fix. The ticket is now closed. Thank you for helping us keep ASTU beautiful! 🌟";
                }

                const emailHtml = `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; background-color: #ffffff; color: #1e293b;">
                        <div style="background-color: ${statusColor}; padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${statusEmoji} ${statusHeader}</h1>
                        </div>
                        <div style="padding: 40px;">
                            <h2 style="color: ${statusColor}; margin-top: 0;">Dear ${updatedComplaint.student.name},</h2>
                            <p style="font-size: 16px; line-height: 1.6;">${statusMessage}</p>
                            
                            <div style="background-color: #f8fafc; border-left: 4px solid ${statusColor}; padding: 20px; margin: 30px 0; border-radius: 12px;">
                                <p style="margin: 0; color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">Ticket Reference</p>
                                <p style="margin: 5px 0; font-size: 18px; font-weight: bold; color: #1e293b;">#${trackingID}</p>
                                <p style="margin: 15px 0 0 0; color: #64748b; font-size: 11px; font-weight: bold; text-transform: uppercase;">New Status</p>
                                <p style="margin: 5px 0 0 0; font-size: 22px; font-weight: 1000; color: ${statusColor}; uppercase">${status.toUpperCase()}</p>
                            </div>

                            <p style="font-size: 14px; margin-top: 30px;">Best Regards,<br/><b>ASTU Maintenance Department</b></p>
                        </div>
                        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 10px; color: #94a3b8;">
                            This is an automated university system notification. Please do not reply.
                        </div>
                    </div>
                `;

                await sendEmail(updatedComplaint.student.email, `${statusEmoji} Ticket Status: ${status.toUpperCase()} (#${trackingID})`, `Update for ${updatedComplaint.title}`, emailHtml);
            } catch (err) { console.error("Status Mail Error:", err.message); }
        };
        sendStatusEmail();

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- REMAINING FUNCTIONS (Keep exactly the same) ---
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