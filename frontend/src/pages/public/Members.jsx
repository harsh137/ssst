import { useEffect, useState } from 'react';
import api, { IMAGE_BASE } from '../../api/axios';
import { cachedGet } from '../../api/cache';
import './Members.css';

const toArr = (v) => (Array.isArray(v) ? v : []);

export default function Members() {
    const [members, setMembers] = useState([]);
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            cachedGet(() => api.get('/members').then(r => r.data), 'members/public'),
            cachedGet(() => api.get('/content/members').then(r => r.data), 'content/members'),
        ])
            .then(([m, c]) => { setMembers(toArr(m)); setContent(c || {}); })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="loader"><div className="spinner" /><p>Loading…</p></div>;

    return (
        <div className="members-page">
            <div className="page-hero">
                <div className="container">
                    <h1>{content.hero?.title || 'Founder Members'}</h1>
                    <p>{content.hero?.body || 'The distinguished individuals who laid the foundation of our trust'}</p>
                </div>
            </div>
            <section className="section">
                <div className="container">
                    <div className="text-center" style={{ marginBottom: 48 }}>
                        <div className="badge badge-maroon">Leadership</div>
                        <h2 className="section-title">Our Founder Members</h2>
                        <p className="section-subtitle">
                            {content.intro?.body || 'These are the visionary founders who came together with a shared goal of building a temple and serving the community.'}
                        </p>
                    </div>
                    {members.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">👥</div>
                            <p>Member list will be updated soon.</p>
                        </div>
                    ) : (
                        <div className="members-grid">
                            {members.map((m, i) => (
                                <div key={m._id} className="member-card card fade-up" style={{ animationDelay: `${i * 0.05}s` }}>
                                    <div className="member-photo-wrap">
                                        {m.photoUrl
                                            ? <img src={`${IMAGE_BASE}${m.photoUrl}`} alt={m.name} className="member-photo" />
                                            : <div className="member-photo-placeholder">👤</div>
                                        }
                                        <div className="member-number">#{String(i + 1).padStart(2, '0')}</div>
                                    </div>
                                    <div className="member-info">
                                        <h3 className="member-name">{m.name}</h3>
                                        {m.designation && <div className="member-designation badge badge-saffron">{m.designation}</div>}
                                        {m.bio && <p className="member-bio">{m.bio}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
