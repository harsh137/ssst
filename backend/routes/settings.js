const router = require('express').Router();
const SiteSettings = require('../models/SiteSettings');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const getSettings = async () => {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});
    return settings;
};

// GET /api/settings (public)
router.get('/', async (req, res) => {
    try {
        res.json(await getSettings());
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/settings (admin)
router.put('/', auth, async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) settings = new SiteSettings();
        Object.assign(settings, req.body);
        await settings.save();
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/settings/logo (admin) - upload logo
router.put('/logo', auth, upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
        const url = `/uploads/${req.file.filename}`;
        let settings = await SiteSettings.findOne();
        if (!settings) settings = new SiteSettings();
        settings.logoUrl = url;
        await settings.save();
        res.json({ logoUrl: url, settings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/settings/hero-banner (admin) - upload hero banner
router.put('/hero-banner', auth, upload.single('banner'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
        const url = `/uploads/${req.file.filename}`;
        let settings = await SiteSettings.findOne();
        if (!settings) settings = new SiteSettings();
        settings.heroBannerUrl = url;
        await settings.save();
        res.json({ heroBannerUrl: url, settings });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
