import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import './Footer.css';

export default function Footer() {
    const [settings, setSettings] = useState({});
    useEffect(() => { api.get('/settings').then(r => setSettings(r.data)).catch(() => { }); }, []);

    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-pattern" />
            <div className="container">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <h3>{settings.siteName || 'Shree Foundation'}</h3>
                        <p>{settings.footerText || 'Dedicated to the construction of the temple and the service of humanity. Together we build a place of faith and hope.'}</p>
                        <div className="footer-social">
                            {settings.facebookUrl && <a href={settings.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook">𝔽</a>}
                            {settings.instagramUrl && <a href={settings.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram">📷</a>}
                            {settings.youtubeUrl && <a href={settings.youtubeUrl} target="_blank" rel="noreferrer" aria-label="YouTube">▶</a>}
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4>Quick Links</h4>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/members">Founder Members</Link></li>
                            <li><Link to="/gallery">Gallery</Link></li>
                            <li><Link to="/contact">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div className="footer-col">
                        <h4>Contact</h4>
                        <ul>
                            {settings.address && <li>📍 {settings.address}</li>}
                            {settings.contactPhone && <li>📞 {settings.contactPhone}</li>}
                            {settings.contactEmail && <li>✉️ {settings.contactEmail}</li>}
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="ornamental-divider"><span>🛕</span></div>
                    <p>© {year} {settings.siteName || 'Shree Foundation'}. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
