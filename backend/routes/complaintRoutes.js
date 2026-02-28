const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { 
    submitComplaint, 
    getStudentComplaints, 
    getAllComplaints, 
    updateComplaintStatus,
    getNotifications,  // New controller function
    markAsRead        // New controller function
} = require('../controllers/complaintController');

// ==========================================
// 1. STUDENT ROUTES
// ==========================================

// Route to submit a new ticket (with photo support)
router.post('/submit', upload.single('attachment'), submitComplaint);

// Route to get tickets belonging to a specific student
router.get('/student/:studentId', getStudentComplaints);

// ==========================================
// 2. ADMIN / STAFF ROUTES
// ==========================================

// Route to get ALL tickets from all students for management
router.get('/all', getAllComplaints);

// Route to update a ticket status (e.g., Resolved)
router.put('/update/:id', updateComplaintStatus);

// ==========================================
// 3. NOTIFICATION SYSTEM ROUTES
// ==========================================

// Route to fetch a student's notifications (for the Bell Icon)
router.get('/notifications/:userId', getNotifications);

// Route to mark all notifications as read when the student opens the bell
router.put('/notifications/read/:userId', markAsRead);

module.exports = router;