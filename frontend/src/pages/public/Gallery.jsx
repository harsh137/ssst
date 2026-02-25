import { useEffect, useState } from 'react';
import api from '../../api/axios';
import './Gallery.css';

const API_BASE = 'http://localhost:5000';
const CATEGORIES = ['all', 'construction', 'welfare', 'events', 'general'];

export default function Gallery() {
    const [images, setImages] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [lightbox, setLightbox] = useState(null);
    const [content, setContent] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get('/gallery?section=gallery_page'), api.get('/gallery'), api.get('/content/gallery')])
            .then(([gp, all, c]) => {
                // Combine gallery_page section + any others not in home
                const combined = [...gp.data];
                all.data.forEach(img => { if (!combined.find(i => i._id === img._id)) combined.push(img); });
                setImages(combined);
                setFiltered(combined);
                setContent(c.data);
            }).finally(() => setLoading(false));
    }, []);

    const filter = (cat) => {
        setActiveCategory(cat);
        setFiltered(cat === 'all' ? images : images.filter(i => i.category === cat));
    };

    const labelMap = { all: 'All', construction: '🏗️ Construction', welfare: '🤝 Social Welfare', events: '🎉 Events', general: '📷 General' };

    if (loading) return <div className="loader"><div className="spinner" /><p>Loading…</p></div>;

    return (
        <div className="gallery-page">
            <div className="page-hero">
                <div className="container">
                    <h1>{content.hero?.title || 'Photo Gallery'}</h1>
                    <p>{content.hero?.body || 'A visual journey of our temple construction and social welfare activities'}</p>
                </div>
            </div>

            <section className="section">
                <div className="container">
                    {/* Filter Bar */}
                    <div className="gallery-filter-bar">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                                onClick={() => filter(cat)}
                            >{labelMap[cat]}</button>
                        ))}
                    </div>

                    {filtered.length === 0 ? (
                        <div className="empty-state">
                            <div style={{ fontSize: '3rem', marginBottom: 12 }}>📷</div>
                            <p>No photos in this category yet.</p>
                        </div>
                    ) : (
                        <div className="gallery-masonry">
                            {filtered.map(img => (
                                <div key={img._id} className="gallery-item" onClick={() => setLightbox(img)}>
                                    <img src={`${API_BASE}${img.url}`} alt={img.caption} loading="lazy" />
                                    <div className="gallery-item-overlay">
                                        <span className="gallery-item-zoom">🔍</span>
                                        {img.caption && <div className="gallery-item-caption">{img.caption}</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Lightbox */}
            {lightbox && (
                <div className="lightbox" onClick={() => setLightbox(null)}>
                    <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setLightbox(null)}>✕</button>
                        <img src={`${API_BASE}${lightbox.url}`} alt={lightbox.caption} />
                        {lightbox.caption && <div className="lightbox-caption">{lightbox.caption}</div>}
                    </div>
                </div>
            )}
        </div>
    );
}
