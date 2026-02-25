const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await AdminUser.findOne({ email });
        if (!admin) return res.status(401).json({ message: 'Invalid credentials.' });

        const match = await bcrypt.compare(password, admin.passwordHash);
        if (!match) return res.status(401).json({ message: 'Invalid credentials.' });

        const token = jwt.sign({ id: admin._id, email: admin.email, role: admin.role }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });

        res.json({ token, admin: { email: admin.email, role: admin.role } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
