const mongoose = require('mongoose');

const siteSettingsSchema = new mongoose.Schema({
    siteName: { type: String, default: 'Shree Foundation' },
    tagline: { type: String, default: 'Building Faith, Serving Humanity' },
    logoUrl: { type: String, default: '' },
    heroTitle: { type: String, default: 'Welcome to Shree Foundation' },
    heroSubtitle: { type: String, default: 'Dedicated to temple construction and social welfare' },
    heroBannerUrl: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    address: { type: String, default: '' },
    facebookUrl: { type: String, default: '' },
    instagramUrl: { type: String, default: '' },
    twitterUrl: { type: String, default: '' },
    youtubeUrl: { type: String, default: '' },
    footerText: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('SiteSettings', siteSettingsSchema);
