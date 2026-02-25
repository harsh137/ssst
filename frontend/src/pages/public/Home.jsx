import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { IMAGE_BASE } from '../../api/axios';
import { cachedGet } from '../../api/cache';
import './Home.css';

const toArr = (v) => (Array.isArray(v) ? v : []);

const fetchers = [
    { key: 'settings', fn: () => api.get('/settings').then(r => r.data) },
    { key: 'content/home', fn: () => api.get('/content/home').then(r => r.data) },
    { key: 'gallery/home_banner', fn: () => api.get('/gallery?section=home_banner').then(r => r.data) },
    { key: 'gallery/home_gallery', fn: () => api.get('/gallery?section=home_gallery').then(r => r.data) },
    { key: 'gallery/progress', fn: () => api.get('/gallery?section=progress_update').then(r => r.data) },
    { key: 'members/public', fn: () => api.get('/members').then(r => r.data) },
];

export default function Home() {
    const [settings, setSettings] = useState({});
    const [content, setContent] = useState({});
    const [heroBanner, setHeroBanner] = useState([]);
    const [homeGallery, setHomeGallery] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all(fetchers.map(f => cachedGet(f.fn, f.key)))
            .then(([s, c, hb, hg, up, mem]) => {
                setSettings(s || {});
                setContent(c || {});
                setHeroBanner(toArr(hb));
                setHomeGallery(toArr(hg).slice(0, 6));
                setUpdates(toArr(up).slice(0, 4));
                setMembers(toArr(mem).slice(0, 4));
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loader"><div className="spinner" /><p>Loading…</p></div>;

    const heroBg = heroBanner[0]?.url
        ? `${IMAGE_BASE}${heroBanner[0].url}`
        : settings.heroBannerUrl
            ? `${IMAGE_BASE}${settings.heroBannerUrl}`
            : null;

    return (
        <div className="home-page">
            {/* ── Hero Section ── */}
            <section className="hero-section" style={heroBg ? { backgroundImage: `url(${heroBg})` } : {}}>
                <div className="hero-overlay" />
                <div className="container hero-content">
                    <div className="badge badge-saffron fade-up" style={{ marginBottom: 16 }}>🛕 Welcome</div>
                    <h1 className="hero-title fade-up-delay-1">
                        {content.hero?.title || settings.heroTitle || 'Shree Foundation'}
                    </h1>
                    <p className="hero-subtitle fade-up-delay-2">
                        {content.hero?.body || settings.heroSubtitle || 'Dedicated to temple construction and social welfare activities'}
                    </p>
                    <div className="hero-actions fade-up-delay-3">
                        <Link to="/gallery" className="btn btn-primary">View Gallery</Link>
                        <Link to="/contact" className="btn btn-ghost">Get In Touch</Link>
                    </div>
                </div>
                <div className="hero-wave">
                    <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="#FBF7F0" />
                    </svg>
                </div>
            </section>

            {/* ── Stats Bar ── */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {[
                            { icon: '🏛️', num: content.stat1?.title || '2024', label: content.stat1?.body || 'Founded' },
                            { icon: '👥', num: content.stat2?.title || '500+', label: content.stat2?.body || 'Members' },
                            { icon: '🌿', num: content.stat3?.title || '100+', label: content.stat3?.body || 'Social Activities' },
                            { icon: '📍', num: content.stat4?.title || '1', label: content.stat4?.body || 'Temple Project' },
                        ].map((s, i) => (
                            <div key={i} className="stat-item">
                                <div className="stat-item-icon">{s.icon}</div>
                                <div className="stat-item-num">{s.num}</div>
                                <div className="stat-item-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── About Snippet ── */}
            <section className="section about-snippet">
                <div className="container about-snippet-inner">
                    <div className="about-snippet-text">
                        <div className="badge badge-maroon">About Us</div>
                        <h2 className="section-title" style={{ textAlign: 'left', marginTop: 12 }}>
                            {content.about_snippet?.title || 'Our Foundation'}
                        </h2>
                        <div className="ornamental-divider" style={{ justifyContent: 'flex-start', maxWidth: 200 }}><span>✦</span></div>
                        <p className="about-snippet-body">
                            {content.about_snippet?.body || 'We are a registered foundation committed to constructing a temple for the community and conducting social welfare activities for the upliftment of society.'}
                        </p>
                        <Link to="/about" className="btn btn-primary" style={{ marginTop: 24 }}>Learn More</Link>
                    </div>
                    <div className="about-snippet-img">
                        <div className="about-img-frame">
                            {content.about_snippet?.extra?.imageUrl ? (
                                <img src={`${IMAGE_BASE}${content.about_snippet.extra.imageUrl}`} alt="About" />
                            ) : (
                                <div className="img-placeholder" style={{ height: '100%', borderRadius: 16, minHeight: 280, fontSize: '4rem' }}>🛕</div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Gallery Preview ── */}
            {homeGallery.length > 0 && (
                <section className="section gallery-preview" style={{ background: 'var(--cream-dark)' }}>
                    <div className="container">
                        <div className="text-center" style={{ marginBottom: 40 }}>
                            <div className="badge badge-saffron">Gallery</div>
                            <h2 className="section-title">{content.gallery_section?.title || 'Project Gallery'}</h2>
                            <p className="section-subtitle">{content.gallery_section?.body || 'A glimpse of our temple construction progress and social welfare activities'}</p>
                        </div>
                        <div className="gallery-grid">
                            {homeGallery.map(img => (
                                <div key={img._id} className="gallery-card card">
                                    <img src={`${IMAGE_BASE}${img.url}`} alt={img.caption} loading="lazy" />
                                    {img.caption && <div className="gallery-card-caption">{img.caption}</div>}
                                </div>
                            ))}
                        </div>
                        <div className="text-center" style={{ marginTop: 32 }}>
                            <Link to="/gallery" className="btn btn-outline">View All Photos</Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Progress Updates ── */}
            {updates.length > 0 && (
                <section className="section updates-section">
                    <div className="container">
                        <div className="text-center" style={{ marginBottom: 40 }}>
                            <div className="badge badge-gold">Live Updates</div>
                            <h2 className="section-title">{content.updates_section?.title || 'Construction Progress'}</h2>
                            <p className="section-subtitle">{content.updates_section?.body || 'Latest updates from the temple construction site'}</p>
                        </div>
                        <div className="updates-grid">
                            {updates.map(img => (
                                <div key={img._id} className="update-card card">
                                    <div className="update-img-wrap">
                                        <img src={`${IMAGE_BASE}${img.url}`} alt={img.caption} loading="lazy" />
                                        <div className="update-overlay">
                                            <span className="badge badge-saffron">Update</span>
                                        </div>
                                    </div>
                                    {img.caption && <div className="update-caption">{img.caption}</div>}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── Members Snap ── */}
            {members.length > 0 && (
                <section className="section members-snap" style={{ background: 'var(--cream-dark)' }}>
                    <div className="container">
                        <div className="text-center" style={{ marginBottom: 40 }}>
                            <div className="badge badge-maroon">Leadership</div>
                            <h2 className="section-title">Founder Members</h2>
                            <p className="section-subtitle">The visionaries behind the foundation</p>
                        </div>
                        <div className="members-snap-grid">
                            {members.map(m => (
                                <div key={m._id} className="member-snap-card card">
                                    <div className="member-snap-photo">
                                        {m.photoUrl
                                            ? <img src={`${IMAGE_BASE}${m.photoUrl}`} alt={m.name} />
                                            : <div className="img-placeholder member-placeholder">👤</div>
                                        }
                                    </div>
                                    <div className="member-snap-info">
                                        <div className="member-snap-name">{m.name}</div>
                                        <div className="member-snap-designation">{m.designation}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center" style={{ marginTop: 32 }}>
                            <Link to="/members" className="btn btn-outline">View All Members</Link>
                        </div>
                    </div>
                </section>
            )}

            {/* ── CTA ── */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-box">
                        <div className="cta-icon">🙏</div>
                        <h2>{content.cta?.title || 'Join Us in Building a Better Tomorrow'}</h2>
                        <p>{content.cta?.body || 'Support our cause and be part of this sacred mission. Every contribution matters.'}</p>
                        <Link to="/contact" className="btn btn-primary">Contact Us</Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
