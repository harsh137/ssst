import { useEffect, useState } from 'react';
import api from '../../api/axios';

const PAGES = [
    {
        page: 'home', label: '🏠 Home Page', sections: [
            { key: 'hero', label: 'Hero Section (Title & Subtitle)' },
            { key: 'about_snippet', label: 'About Snippet (Home page)' },
            { key: 'gallery_section', label: 'Gallery Section Heading' },
            { key: 'updates_section', label: 'Progress Updates Heading' },
            { key: 'cta', label: 'Call-to-Action Banner' },
            { key: 'stat1', label: 'Stat 1 (Title = number, Body = label)' },
            { key: 'stat2', label: 'Stat 2' },
            { key: 'stat3', label: 'Stat 3' },
            { key: 'stat4', label: 'Stat 4' },
        ]
    },
    {
        page: 'about', label: '📖 About Us Page', sections: [
            { key: 'hero', label: 'Page Banner' },
            { key: 'mission', label: 'Our Mission' },
            { key: 'vision', label: 'Our Vision' },
            { key: 'about_body', label: 'About Body Text' },
            { key: 'objectives', label: 'MoA Objectives list (JSON array in extra.list)' },
        ]
    },
    {
        page: 'members', label: '👥 Members Page', sections: [
            { key: 'hero', label: 'Page Banner' },
            { key: 'intro', label: 'Intro Text' },
        ]
    },
    {
        page: 'gallery', label: '📷 Gallery Page', sections: [
            { key: 'hero', label: 'Page Banner' },
        ]
    },
    {
        page: 'contact', label: '✉️ Contact Page', sections: [
            { key: 'hero', label: 'Page Banner' },
            { key: 'intro', label: 'Contact Intro Text' },
        ]
    },
];

export default function ContentManager() {
    const [activePage, setActivePage] = useState('home');
    const [content, setContent] = useState({});
    const [saving, setSaving] = useState({});
    const [msgs, setMsgs] = useState({});

    const pageObj = PAGES.find(p => p.page === activePage);

    useEffect(() => {
        api.get(`/content/${activePage}`).then(r => setContent(r.data));
        setMsgs({});
    }, [activePage]);

    const getVal = (section, field) => content[section]?.[field] || '';
    const setVal = (section, field, val) => {
        setContent(c => ({ ...c, [section]: { ...c[section], [field]: val } }));
    };

    const save = async (page, section) => {
        const key = `${page}_${section}`;
        setSaving(s => ({ ...s, [key]: true }));
        try {
            const data = content[section] || {};
            await api.put(`/content/${page}/${section}`, { title: data.title || '', body: data.body || '', extra: data.extra || {} });
            setMsgs(m => ({ ...m, [key]: '✅ Saved!' }));
            setTimeout(() => setMsgs(m => ({ ...m, [key]: '' })), 3000);
        } catch {
            setMsgs(m => ({ ...m, [key]: '❌ Failed' }));
        } finally {
            setSaving(s => ({ ...s, [key]: false }));
        }
    };

    return (
        <div>
            <h1 className="admin-page-title">📝 Content Manager</h1>
            <p className="admin-page-sub">Edit the text content for each page and section. Changes reflect immediately on the public site.</p>

            {/* Page Tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
                {PAGES.map(p => (
                    <button key={p.page} onClick={() => setActivePage(p.page)}
                        className={activePage === p.page ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}>
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Sections */}
            {pageObj?.sections.map(({ key, label }) => (
                <div key={key} className="admin-card">
                    <div className="admin-card-title">{label}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div className="form-group">
                            <label className="form-label">Title</label>
                            <input value={getVal(key, 'title')} onChange={e => setVal(key, 'title', e.target.value)} className="form-input" placeholder="Section title..." />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Body Text</label>
                            <textarea value={getVal(key, 'body')} onChange={e => setVal(key, 'body', e.target.value)} className="form-textarea" rows={4} placeholder="Section body content..." />
                        </div>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <button className="btn btn-primary btn-sm"
                                onClick={() => save(activePage, key)}
                                disabled={saving[`${activePage}_${key}`]}>
                                {saving[`${activePage}_${key}`] ? '⏳ Saving…' : '💾 Save'}
                            </button>
                            {msgs[`${activePage}_${key}`] && (
                                <span style={{ fontSize: '0.875rem', color: msgs[`${activePage}_${key}`].includes('✅') ? '#065F46' : '#991B1B' }}>
                                    {msgs[`${activePage}_${key}`]}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
