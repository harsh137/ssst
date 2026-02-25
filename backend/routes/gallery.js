const router = require('express').Router();
const GalleryImage = require('../models/GalleryImage');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// GET /api/gallery?section=home_gallery (public) - active images, optional section filter
router.get('/', async (req, res) => {
    try {
        const filter = { isActive: true };
        if (req.query.section) filter.displaySection = req.query.section;
        const images = await GalleryImage.find(filter).sort({ order: 1, createdAt: -1 });
        res.json(images);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/gallery/all (admin) - all images including inactive
router.get('/all', auth, async (req, res) => {
    try {
        const images = await GalleryImage.find().sort({ createdAt: -1 });
        res.json(images);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/gallery (admin) - upload new image
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No image uploaded.' });
        const { caption, category, displaySection, order } = req.body;
        const url = `/uploads/${req.file.filename}`;
        const image = await GalleryImage.create({
            filename: req.file.filename,
            url,
            caption: caption || '',
            category: category || 'general',
            displaySection: displaySection || 'gallery_page',
            order: order ? parseInt(order) : 0,
        });
        res.status(201).json(image);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/gallery/:id (admin) - update metadata
router.put('/:id', auth, async (req, res) => {
    try {
        const { caption, category, displaySection, isActive, order } = req.body;
        const image = await GalleryImage.findByIdAndUpdate(
            req.params.id,
            { caption, category, displaySection, isActive, order },
            { new: true }
        );
        if (!image) return res.status(404).json({ message: 'Image not found.' });
        res.json(image);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/gallery/:id (admin)
router.delete('/:id', auth, async (req, res) => {
    try {
        const image = await GalleryImage.findById(req.params.id);
        if (!image) return res.status(404).json({ message: 'Image not found.' });

        // Delete physical file
        const filePath = path.join(__dirname, '..', 'uploads', image.filename);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

        await GalleryImage.findByIdAndDelete(req.params.id);
        res.json({ message: 'Image deleted.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
