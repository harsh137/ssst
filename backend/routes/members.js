const router = require('express').Router();
const Member = require('../models/Member');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { cloudinary } = require('../middleware/upload');

// Helper: extract Cloudinary public_id from URL
const getPublicId = (url) => {
    if (!url || !url.startsWith('http')) return null;
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    return match ? match[1] : null;
};

// GET /api/members (public)
router.get('/', async (req, res) => {
    try {
        res.json(await Member.find({ isActive: true }).sort({ order: 1, createdAt: 1 }));
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET /api/members/all (admin)
router.get('/all', auth, async (req, res) => {
    try {
        res.json(await Member.find().sort({ order: 1 }));
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST /api/members (admin) - add member with optional photo
router.post('/', auth, upload.single('photo'), async (req, res) => {
    try {
        const { name, designation, bio, order } = req.body;
        const photoUrl = req.file ? req.file.path : ''; // Cloudinary full URL
        const member = await Member.create({
            name,
            designation: designation || '',
            photoUrl,
            bio: bio || '',
            order: order ? parseInt(order) : 0,
        });
        res.status(201).json(member);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// PUT /api/members/:id (admin) - update member
router.put('/:id', auth, upload.single('photo'), async (req, res) => {
    try {
        const { name, designation, bio, order, isActive } = req.body;
        const update = { name, designation, bio, order: order ? parseInt(order) : 0, isActive };
        if (req.file) {
            // Delete old photo from Cloudinary
            const existing = await Member.findById(req.params.id);
            if (existing?.photoUrl) {
                const pid = getPublicId(existing.photoUrl);
                if (pid) await cloudinary.uploader.destroy(pid).catch(() => { });
            }
            update.photoUrl = req.file.path; // New Cloudinary URL
        }
        const member = await Member.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!member) return res.status(404).json({ message: 'Member not found.' });
        res.json(member);
    } catch (err) { res.status(500).json({ message: err.message }); }
});

// DELETE /api/members/:id (admin)
router.delete('/:id', auth, async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) return res.status(404).json({ message: 'Member not found.' });
        // Delete photo from Cloudinary
        if (member.photoUrl) {
            const pid = getPublicId(member.photoUrl);
            if (pid) await cloudinary.uploader.destroy(pid).catch(() => { });
        }
        await Member.findByIdAndDelete(req.params.id);
        res.json({ message: 'Member deleted.' });
    } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
