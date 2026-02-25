const router = require('express').Router();
const SiteSettings = require('../models/SiteSettings');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { cloudinary } = require('../middleware/upload');

const getSettings = async () => {
    let settings = await SiteSettings.findOne();
    if (!settings) settings = await SiteSettings.create({});
    return settings;
};

// Helper: extract Cloudinary public_id from a stored URL
const getPublicId = (url) => {
    if (!url) return null;
    // Cloudinary URL pattern: .../upload/v12345/folder/public_id.ext
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    return match ? match[1] : null;
};

// GET /api/settings (public)
router.get('/', async (req, res) => {
    try { res.json(await getSettings()); }
    catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/settings (admin) - text fields only
router.put('/', auth, async (req, res) => {
    try {
        let settings = await SiteSettings.findOne();
        if (!settings) settings = new SiteSettings();
        Object.assign(settings, req.body);
        await settings.save();
        res.json(settings);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/settings/logo (admin) - upload logo to Cloudinary
router.put('/logo', auth, upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
        let settings = await getSettings();
        // Delete old logo from Cloudinary if it exists
        if (settings.logoUrl) {
            const pid = getPublicId(settings.logoUrl);
            if (pid) await cloudinary.uploader.destroy(pid).catch(() => { });
        }
        settings.logoUrl = req.file.path; // Cloudinary returns full URL in req.file.path
        await settings.save();
        res.json({ logoUrl: settings.logoUrl, settings });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/settings/logo (admin) - remove logo
router.delete('/logo', auth, async (req, res) => {
    try {
        let settings = await getSettings();
        if (settings.logoUrl) {
            const pid = getPublicId(settings.logoUrl);
            if (pid) await cloudinary.uploader.destroy(pid).catch(() => { });
        }
        settings.logoUrl = '';
        await settings.save();
        res.json({ message: 'Logo removed.', settings });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/settings/hero-banner (admin) - upload hero banner to Cloudinary
router.put('/hero-banner', auth, upload.single('banner'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });
        let settings = await getSettings();
        // Delete old banner
        if (settings.heroBannerUrl) {
            const pid = getPublicId(settings.heroBannerUrl);
            if (pid) await cloudinary.uploader.destroy(pid).catch(() => { });
        }
        settings.heroBannerUrl = req.file.path;
        await settings.save();
        res.json({ heroBannerUrl: settings.heroBannerUrl, settings });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/settings/hero-banner (admin) - remove hero banner
router.delete('/hero-banner', auth, async (req, res) => {
    try {
        let settings = await getSettings();
        if (settings.heroBannerUrl) {
            const pid = getPublicId(settings.heroBannerUrl);
            if (pid) await cloudinary.uploader.destroy(pid).catch(() => { });
        }
        settings.heroBannerUrl = '';
        await settings.save();
        res.json({ message: 'Banner removed.', settings });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
