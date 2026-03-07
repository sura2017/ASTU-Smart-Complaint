const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 1. Configure Cloudinary with your keys
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Setup Cloudinary Storage Logic
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'astu_complaints', // Images will be saved in this folder in your Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }] // Automatically resizes for speed
  },
});

const upload = multer({ storage: storage });

module.exports = upload;