const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/content', require('./routes/content'));
app.use('/api/gallery', require('./routes/gallery'));
app.use('/api/members', require('./routes/members'));
app.use('/api/contact', require('./routes/contact'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    // Seed default admin if not exists
    const AdminUser = require('./models/AdminUser');
    const bcrypt = require('bcryptjs');
    const existing = await AdminUser.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existing) {
      const hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      await AdminUser.create({ email: process.env.ADMIN_EMAIL, passwordHash: hash });
      console.log('✅ Default admin created:', process.env.ADMIN_EMAIL);
    }
    app.listen(process.env.PORT, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
