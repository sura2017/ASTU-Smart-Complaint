const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    // This links the complaint to the specific student (using the ID you saw in Compass)
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { 
        type: String, 
        enum: ['Dormitory', 'Laboratory', 'Internet', 'Classroom', 'Other'], 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Open', 'In Progress', 'Resolved'], 
        default: 'Open' 
    },
    attachment: { type: String }, // This will store the image path
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);