const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary from env vars
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => ({
        folder: 'ssst_foundation',          // all uploads go into one folder
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    }),
});

// Expose cloudinary instance so routes can delete images
module.exports = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
module.exports.cloudinary = cloudinary;
