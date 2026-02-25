import { useEffect, useState } from 'react';
import api, { IMAGE_BASE } from '../../api/axios';
import './Gallery.css';

const toArr = (v) => (Array.isArray(v) ? v : []);
const CATEGORIES = ['all', 'construction', 'welfare', 'events', 'general'];
const labelMap = { all: 'All', construction: '🏗️ Construction', welfare: '🤝 Social Welfare', events: '🎉 Events', general: '📷 General' };

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
                const gpArr = toArr(gp.data);
                const allArr = toArr(all.data);
                // Merge: gallery_page first, then any remaining
                const ids = new Set(gpArr.map(i => i._id));
                const combined = [...gpArr, ...allArr.filter(i => !ids.has(i._id))];
                setImages(combined);
                setFiltered(combined);
                setContent(c.data || {});
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const filter = (cat) => {
        setActiveCategory(cat);
        setFiltered(cat === 'all' ? images : images.filter(i => i.category === cat));
    };

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
                                    <img src={`${IMAGE_BASE}${img.url}`} alt={img.caption} loading="lazy" />
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
                        <img src={`${IMAGE_BASE}${lightbox.url}`} alt={lightbox.caption} />
                        {lightbox.caption && <div className="lightbox-caption">{lightbox.caption}</div>}
                    </div>
                </div>
            )}
        </div>
    );
}
