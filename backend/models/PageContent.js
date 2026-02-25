const mongoose = require('mongoose');

const pageContentSchema = new mongoose.Schema({
    page: { type: String, required: true },      // 'home', 'about', 'contact'
    section: { type: String, required: true },   // 'hero', 'mission', 'vision', etc.
    title: { type: String, default: '' },
    body: { type: String, default: '' },
    extra: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

pageContentSchema.index({ page: 1, section: 1 }, { unique: true });

module.exports = mongoose.model('PageContent', pageContentSchema);
