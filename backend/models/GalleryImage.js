const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
    filename: { type: String, required: true },
    url: { type: String, required: true },
    caption: { type: String, default: '' },
    category: {
        type: String,
        enum: ['construction', 'welfare', 'events', 'general'],
        default: 'general',
    },
    displaySection: {
        // Controls WHERE on the public site this image appears
        type: String,
        enum: ['home_banner', 'home_gallery', 'gallery_page', 'progress_update', 'none'],
        default: 'gallery_page',
    },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('GalleryImage', galleryImageSchema);
