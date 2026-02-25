import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';

const API_BASE = 'http://localhost:5000';
const SECTIONS = ['home_banner', 'home_gallery', 'gallery_page', 'progress_update', 'none'];
const CATEGORIES = ['general', 'construction', 'welfare', 'events'];
const SECTION_LABELS = { home_banner: '🏠 Home Banner', home_gallery: '🏠 Home Gallery', gallery_page: '📷 Gallery Page', progress_update: '🏗️ Progress Update', none: '🚫 Hidden' };

export default function GalleryManager() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({});
    const [form, setForm] = useState({ caption: '', category: 'general', displaySection: 'gallery_page', order: 0 });
    const [file, setFile] = useState(null);
    const [uploadMsg, setUploadMsg] = useState('');
    const fileRef = useRef();

    const load = () => {
        setLoading(true);
        api.get('/gallery/all').then(r => setImages(r.data)).finally(() => setLoading(false));
    };
    useEffect(load, []);

    const handleUpload = async e => {
        e.preventDefault();
        if (!file) return;
        setUploading(true); setUploadMsg('');
        const fd = new FormData();
        fd.append('image', file);
        fd.append('caption', form.caption);
        fd.append('category', form.category);
        fd.append('displaySection', form.displaySection);
        fd.append('order', form.order);
        try {
            await api.post('/gallery', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setUploadMsg('✅ Image uploaded successfully!');
            setForm({ caption: '', category: 'general', displaySection: 'gallery_page', order: 0 });
            setFile(null);
            if (fileRef.current) fileRef.current.value = '';
            load();
        } catch { setUploadMsg('❌ Upload failed.'); }
        finally { setUploading(false); }
    };

    const startEdit = img => { setEditId(img._id); setEditData({ caption: img.caption, category: img.category, displaySection: img.displaySection, isActive: img.isActive, order: img.order }); };
    const saveEdit = async id => {
        await api.put(`/gallery/${id}`, editData);
        setEditId(null);
        load();
    };
    const toggleActive = async img => {
        await api.put(`/gallery/${img._id}`, { ...img, isActive: !img.isActive });
        load();
    };
    const deleteImg = async id => {
        if (!confirm('Delete this image permanently?')) return;
        await api.delete(`/gallery/${id}`);
        load();
    };

    return (
        <div>
            <h1 className="admin-page-title">🖼️ Gallery Manager</h1>
            <p className="admin-page-sub">Upload photos and control where they appear on the public website.</p>

            {/* Upload Form */}
            <div className="admin-card">
                <div className="admin-card-title">📤 Upload New Image</div>
                <form onSubmit={handleUpload} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Image File *</label>
                        <input ref={fileRef} type="file" accept="image/*" className="form-input" onChange={e => setFile(e.target.files[0])} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Caption</label>
                        <input value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} placeholder="Image caption..." className="form-input" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Display Section</label>
                        <select value={form.displaySection} onChange={e => setForm(f => ({ ...f, displaySection: e.target.value }))} className="form-select">
                            {SECTIONS.map(s => <option key={s} value={s}>{SECTION_LABELS[s]}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Category</label>
                        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="form-select">
                            {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Order (lower = first)</label>
                        <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} className="form-input" />
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, alignItems: 'center' }}>
                        <button type="submit" className="btn btn-primary" disabled={uploading}>{uploading ? '⏳ Uploading…' : '📤 Upload Image'}</button>
                        {uploadMsg && <span style={{ fontSize: '0.875rem', color: uploadMsg.includes('✅') ? '#065F46' : '#991B1B' }}>{uploadMsg}</span>}
                    </div>
                </form>
            </div>

            {/* Images Table */}
            <div className="admin-card">
                <div className="admin-card-title">📷 All Images ({images.length})</div>
                {loading ? <div className="loader"><div className="spinner" /></div> : (
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Preview</th><th>Caption</th><th>Display Section</th><th>Category</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {images.map(img => (
                                    <tr key={img._id}>
                                        <td>
                                            <img src={`${API_BASE}${img.url}`} alt="" className="img-thumb" />
                                        </td>
                                        <td>
                                            {editId === img._id
                                                ? <input value={editData.caption} onChange={e => setEditData(d => ({ ...d, caption: e.target.value }))} className="form-input" style={{ minWidth: 140 }} />
                                                : img.caption || <span style={{ color: 'var(--text-light)' }}>–</span>
                                            }
                                        </td>
                                        <td>
                                            {editId === img._id
                                                ? <select value={editData.displaySection} onChange={e => setEditData(d => ({ ...d, displaySection: e.target.value }))} className="form-select">
                                                    {SECTIONS.map(s => <option key={s} value={s}>{SECTION_LABELS[s]}</option>)}
                                                </select>
                                                : <span className="badge badge-saffron" style={{ fontSize: '0.7rem' }}>{SECTION_LABELS[img.displaySection]}</span>
                                            }
                                        </td>
                                        <td>
                                            {editId === img._id
                                                ? <select value={editData.category} onChange={e => setEditData(d => ({ ...d, category: e.target.value }))} className="form-select">
                                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                                : <span className="badge badge-gold">{img.category}</span>
                                            }
                                        </td>
                                        <td>
                                            {editId === img._id
                                                ? <input type="number" value={editData.order} onChange={e => setEditData(d => ({ ...d, order: e.target.value }))} className="form-input" style={{ width: 60 }} />
                                                : img.order
                                            }
                                        </td>
                                        <td>
                                            <button className={`toggle-btn ${img.isActive ? 'active' : 'inactive'}`} onClick={() => toggleActive(img)}>
                                                {img.isActive ? '✅ Active' : '❌ Hidden'}
                                            </button>
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap' }}>
                                            {editId === img._id ? (
                                                <>
                                                    <button className="btn btn-primary btn-sm" onClick={() => saveEdit(img._id)} style={{ marginRight: 6 }}>💾 Save</button>
                                                    <button className="btn btn-sm" style={{ background: '#F3F4F6', color: 'var(--text-mid)' }} onClick={() => setEditId(null)}>Cancel</button>
                                                </>
                                            ) : (
                                                <>
                                                    <button className="btn btn-sm" style={{ background: '#EEF2FF', color: '#4338CA', marginRight: 6 }} onClick={() => startEdit(img)}>✏️ Edit</button>
                                                    <button className="btn-danger" onClick={() => deleteImg(img._id)}>🗑️</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
