const router = require('express').Router();
const GalleryImage = require('../models/GalleryImage');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { cloudinary } = require('../middleware/upload');

// Helper: extract Cloudinary public_id from URL
const getPublicId = (url) => {
    if (!url || !url.startsWith('http')) return null;
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    return match ? match[1] : null;
};

// GET /api/gallery?section=home_gallery (public)
router.get('/', async (req, res) => {
    try {
        const filter = { isActive: true };
        if (req.query.section) filter.displaySection = req.query.section;
        res.json(await GalleryImage.find(filter).sort({ order: 1, createdAt: -1 }));
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/gallery/all (admin) - all images including inactive
router.get('/all', auth, async (req, res) => {
    try {
        res.json(await GalleryImage.find().sort({ createdAt: -1 }));
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/gallery (admin) - upload new image to Cloudinary
router.post('/', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No image uploaded.' });
        const { caption, category, displaySection, order } = req.body;
        // req.file.path = full Cloudinary URL, req.file.filename = public_id
        const image = await GalleryImage.create({
            filename: req.file.filename,   // Cloudinary public_id
            url: req.file.path,            // Full Cloudinary URL
            caption: caption || '',
            category: category || 'general',
            displaySection: displaySection || 'gallery_page',
            order: order ? parseInt(order) : 0,
        });
        res.status(201).json(image);
    } catch (err) { res.status(500).json({ message: err.message }); }
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
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/gallery/:id (admin) - delete from Cloudinary + DB
router.delete('/:id', auth, async (req, res) => {
    try {
        const image = await GalleryImage.findById(req.params.id);
        if (!image) return res.status(404).json({ message: 'Image not found.' });

        // Delete from Cloudinary if it's a cloud URL
        const pid = getPublicId(image.url);
        if (pid) {
            await cloudinary.uploader.destroy(pid).catch(() => { });
        }

        await GalleryImage.findByIdAndDelete(req.params.id);
        res.json({ message: 'Image deleted.' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
