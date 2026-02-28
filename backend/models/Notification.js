const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    complaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' }
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);