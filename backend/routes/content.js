const router = require('express').Router();
const PageContent = require('../models/PageContent');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { cloudinary } = require('../middleware/upload');

// Helper: extract Cloudinary public_id from URL
const getPublicId = (url) => {
    if (!url || !url.startsWith('http')) return null;
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    return match ? match[1] : null;
};

// GET /api/content/:page (public) - get all sections for a page
router.get('/:page', async (req, res) => {
    try {
        const sections = await PageContent.find({ page: req.params.page });
        const result = {};
        sections.forEach((s) => (result[s.section] = s));
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/content (admin) - get all content
router.get('/', auth, async (req, res) => {
    try {
        const all = await PageContent.find().sort({ page: 1, section: 1 });
        res.json(all);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/content/:page/:section (admin) - upsert a section
router.put('/:page/:section', auth, async (req, res) => {
    try {
        const { title, body, extra } = req.body;
        const content = await PageContent.findOneAndUpdate(
            { page: req.params.page, section: req.params.section },
            { title, body, extra },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.json(content);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/content/:page/:section/image (admin) - upload image for a section's extra.imageUrl
router.post('/:page/:section/image', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
        const newUrl = req.file.path; // Cloudinary URL

        // Get existing content to delete old image
        const existing = await PageContent.findOne({ page: req.params.page, section: req.params.section });
        if (existing?.extra?.imageUrl) {
            const pid = getPublicId(existing.extra.imageUrl);
            if (pid) await cloudinary.uploader.destroy(pid).catch(() => { });
        }

        // Save new image URL into extra.imageUrl
        const content = await PageContent.findOneAndUpdate(
            { page: req.params.page, section: req.params.section },
            { $set: { 'extra.imageUrl': newUrl } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.json({ imageUrl: newUrl, content });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
