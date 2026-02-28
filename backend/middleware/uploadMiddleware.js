const multer = require('multer');
const path = require('path');

// Tell multer where to save files and what to name them
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Example: 172345678.jpg
    }
});

const upload = multer({ storage: storage });
module.exports = upload;