import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { cachedGet } from '../../api/cache';
import './AboutUs.css';

export default function AboutUs() {
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        cachedGet(() => api.get('/content/about').then(r => r.data), 'content/about')
            .then(c => setContent(c || {}))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loader"><div className="spinner" /><p>Loading…</p></div>;

    const objectives = content.objectives?.extra?.list || [
        'To establish, construct, and maintain the temple for the benefit of the community.',
        'To promote religious, cultural, and social welfare activities.',
        'To provide educational support and scholarships to deserving students.',
        'To conduct health camps, blood donation drives, and medical assistance programs.',
        'To organize cultural programs and events to preserve our heritage.',
        'To protect the environment through plantation drives and eco-friendly initiatives.',
        'To render assistance to the poor, needy, and backward classes of society.',
        'To promote communal harmony and national integration.',
    ];

    return (
        <div className="about-page">
            {/* Page Hero */}
            <div className="page-hero">
                <div className="container">
                    <h1>{content.hero?.title || 'About Our Foundation'}</h1>
                    <p>{content.hero?.body || 'Our vision, mission and objectives as per the Memorandum of Association'}</p>
                </div>
            </div>

            {/* Mission & Vision */}
            <section className="section">
                <div className="container">
                    <div className="mv-grid">
                        <div className="mv-card mv-card--mission">
                            <div className="mv-icon">🎯</div>
                            <h3>Our Mission</h3>
                            <p>{content.mission?.body || 'To serve the community by constructing a magnificent temple that stands as a beacon of faith, unity, and social welfare for generations to come.'}</p>
                        </div>
                        <div className="mv-card mv-card--vision">
                            <div className="mv-icon">👁️</div>
                            <h3>Our Vision</h3>
                            <p>{content.vision?.body || 'A thriving community united by faith, empowered through education, and strengthened by social welfare — where the temple stands as the heart of all activities.'}</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About Body */}
            {content.about_body?.body && (
                <section className="section" style={{ background: 'var(--cream-dark)', paddingTop: 0 }}>
                    <div className="container about-body-text">
                        <h2 className="section-title text-center">Who We Are</h2>
                        <div className="ornamental-divider"><span>✦</span></div>
                        <p>{content.about_body.body}</p>
                    </div>
                </section>
            )}

            {/* Objectives (MoA) */}
            <section className="section objectives-section">
                <div className="container">
                    <div className="text-center" style={{ marginBottom: 48 }}>
                        <div className="badge badge-maroon">Memorandum of Association</div>
                        <h2 className="section-title">{content.objectives?.title || 'Our Objectives'}</h2>
                        <p className="section-subtitle">As defined in the Memorandum of Association of the Foundation</p>
                    </div>
                    <div className="objectives-grid">
                        {objectives.map((obj, i) => (
                            <div key={i} className="objective-card card">
                                <div className="obj-number">{String(i + 1).padStart(2, '0')}</div>
                                <p>{obj}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="section values-section" style={{ background: 'var(--cream-dark)' }}>
                <div className="container">
                    <div className="text-center" style={{ marginBottom: 40 }}>
                        <h2 className="section-title">Our Core Values</h2>
                    </div>
                    <div className="values-grid">
                        {(content.values?.extra?.list || [
                            { icon: '🙏', title: 'Faith', body: 'Rooted in devotion and spiritual conviction' },
                            { icon: '🤝', title: 'Service', body: 'Serving the community with love and compassion' },
                            { icon: '🌿', title: 'Integrity', body: 'Operating with full transparency and accountability' },
                            { icon: '🏫', title: 'Education', body: 'Empowering through knowledge and learning' },
                        ]).map((v, i) => (
                            <div key={i} className="value-card card">
                                <div className="value-icon">{v.icon}</div>
                                <h4>{v.title}</h4>
                                <p>{v.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
