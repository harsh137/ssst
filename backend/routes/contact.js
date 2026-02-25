const router = require('express').Router();
const ContactSubmission = require('../models/ContactSubmission');
const auth = require('../middleware/auth');

// POST /api/contact (public) - submit contact form
router.post('/', async (req, res) => {
    try {
        const { name, email, phone, message } = req.body;
        if (!name || !message) return res.status(400).json({ message: 'Name and message are required.' });
        const submission = await ContactSubmission.create({ name, email, phone, message });
        res.status(201).json({ message: 'Your message has been received. We will get back to you soon.', id: submission._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/contact (admin) - view all submissions
router.get('/', auth, async (req, res) => {
    try {
        const submissions = await ContactSubmission.find().sort({ createdAt: -1 });
        res.json(submissions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT /api/contact/:id/read (admin) - mark as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        const submission = await ContactSubmission.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        if (!submission) return res.status(404).json({ message: 'Submission not found.' });
        res.json(submission);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE /api/contact/:id (admin)
router.delete('/:id', auth, async (req, res) => {
    try {
        await ContactSubmission.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
