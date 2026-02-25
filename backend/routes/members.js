const router = require('express').Router();
const Member = require('../models/Member');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

// GET /api/members (public) - active members sorted by order
router.get('/', async (req, res) => {
    try {
        const members = await Member.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
        res.json(members);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/members/all (admin)
router.get('/all', auth, async (req, res) => {
    try {
        const members = await Member.find().sort({ order: 1 });
        res.json(members);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/members (admin) - add member with optional photo
router.post('/', auth, upload.single('photo'), async (req, res) => {
    try {
        const { name, designation, bio, order } = req.body;
        const photoUrl = req.file ? `/uploads/${req.file.filename}` : '';
        const member = await Member.create({
            name,
            designation: designation || '',
            photoUrl,
            bio: bio || '',
            order: order ? parseInt(order) : 0,
        });
        res.status(201).json(member);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/members/:id (admin) - update member
router.put('/:id', auth, upload.single('photo'), async (req, res) => {
    try {
        const { name, designation, bio, order, isActive } = req.body;
        const update = { name, designation, bio, order: order ? parseInt(order) : 0, isActive };
        if (req.file) {
            // Delete old photo
            const existing = await Member.findById(req.params.id);
            if (existing && existing.photoUrl) {
                const old = path.join(__dirname, '..', existing.photoUrl);
                if (fs.existsSync(old)) fs.unlinkSync(old);
            }
            update.photoUrl = `/uploads/${req.file.filename}`;
        }
        const member = await Member.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!member) return res.status(404).json({ message: 'Member not found.' });
        res.json(member);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/members/:id (admin)
router.delete('/:id', auth, async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);
        if (!member) return res.status(404).json({ message: 'Member not found.' });
        if (member.photoUrl) {
            const filePath = path.join(__dirname, '..', member.photoUrl);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        await Member.findByIdAndDelete(req.params.id);
        res.json({ message: 'Member deleted.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
