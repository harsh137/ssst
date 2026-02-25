import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import api, { IMAGE_BASE } from '../api/axios';
import { cachedGet } from '../api/cache';
import './Navbar.css';

export default function Navbar() {
    const [settings, setSettings] = useState({});
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        cachedGet(() => api.get('/settings').then(r => r.data), 'settings')
            .then(s => setSettings(s || {})).catch(() => { });
    }, []);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    useEffect(() => { setMenuOpen(false); }, [location]);

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/about', label: 'About Us' },
        { to: '/members', label: 'Founder Members' },
        { to: '/gallery', label: 'Gallery' },
        { to: '/contact', label: 'Contact Us' },
    ];

    // Handle both Cloudinary full URLs (https://...) and legacy local paths (/uploads/...)
    const logoSrc = settings.logoUrl
        ? (settings.logoUrl.startsWith('http') ? settings.logoUrl : `${IMAGE_BASE}${settings.logoUrl}`)
        : null;

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-inner">
                <Link to="/" className="navbar-brand">
                    {logoSrc ? (
                        <img src={logoSrc} alt="Logo" className="navbar-logo" />
                    ) : (
                        <span className="navbar-logo-text">🛕</span>
                    )}
                    <div>
                        <div className="navbar-name">{settings.siteName || 'Shree Foundation'}</div>
                        <div className="navbar-tagline">{settings.tagline || 'Building Faith, Serving Humanity'}</div>
                    </div>
                </Link>

                <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
                    {navLinks.map(l => (
                        <NavLink key={l.to} to={l.to} end={l.to === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                            {l.label}
                        </NavLink>
                    ))}
                </div>

                <button className="hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
                    <span className={`ham-bar ${menuOpen ? 'open' : ''}`} />
                    <span className={`ham-bar ${menuOpen ? 'open' : ''}`} />
                    <span className={`ham-bar ${menuOpen ? 'open' : ''}`} />
                </button>
            </div>
        </nav>
    );
}
