const router = require('express').Router();
const PageContent = require('../models/PageContent');
const auth = require('../middleware/auth');

// GET /api/content/:page (public) - get all sections for a page
router.get('/:page', async (req, res) => {
    try {
        const sections = await PageContent.find({ page: req.params.page });
        // Convert to object keyed by section for easy consumption
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

module.exports = router;
