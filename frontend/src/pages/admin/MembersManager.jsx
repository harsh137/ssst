import { useEffect, useState, useRef } from 'react';
import api, { IMAGE_BASE } from '../../api/axios';

// Handle both Cloudinary full URLs and legacy local paths
const imgSrc = (url) => !url ? '' : url.startsWith('http') ? url : `${IMAGE_BASE}${url}`;

export default function MembersManager() {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', designation: '', bio: '', order: 0 });
    const [editId, setEditId] = useState(null);
    const [file, setFile] = useState(null);
    const [msg, setMsg] = useState('');
    const fileRef = useRef();

    const load = () => {
        setLoading(true);
        api.get('/members/all').then(r => setMembers(r.data)).finally(() => setLoading(false));
    };
    useEffect(load, []);

    const resetForm = () => { setForm({ name: '', designation: '', bio: '', order: 0 }); setFile(null); setEditId(null); if (fileRef.current) fileRef.current.value = ''; };

    const handleSubmit = async e => {
        e.preventDefault();
        setSaving(true); setMsg('');
        const fd = new FormData();
        Object.entries(form).forEach(([k, v]) => fd.append(k, v));
        if (file) fd.append('photo', file);
        try {
            if (editId) await api.put(`/members/${editId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            else await api.post('/members', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            setMsg(editId ? '✅ Member updated!' : '✅ Member added!');
            resetForm();
            load();
        } catch { setMsg('❌ Failed to save.'); }
        finally { setSaving(false); }
    };

    const startEdit = m => {
        setEditId(m._id);
        setForm({ name: m.name, designation: m.designation, bio: m.bio, order: m.order });
    };

    const toggleActive = async m => {
        await api.put(`/members/${m._id}`, new URLSearchParams({ ...m, isActive: !m.isActive }));
        load();
    };

    const deleteMember = async id => {
        if (!confirm('Delete this member?')) return;
        await api.delete(`/members/${id}`);
        load();
    };

    return (
        <div>
            <h1 className="admin-page-title">👥 Members Manager</h1>
            <p className="admin-page-sub">Add, edit, and manage founder members displayed on the public website.</p>

            {/* Form */}
            <div className="admin-card">
                <div className="admin-card-title">{editId ? '✏️ Edit Member' : '➕ Add New Member'}</div>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                        <label className="form-label">Full Name *</label>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Member's full name" className="form-input" required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Designation</label>
                        <input value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))} placeholder="e.g. President, Secretary" className="form-input" />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                        <label className="form-label">Bio / Description</label>
                        <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="Brief bio..." className="form-textarea" rows={3} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Photo</label>
                        <input ref={fileRef} type="file" accept="image/*" className="form-input" onChange={e => setFile(e.target.files[0])} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Display Order</label>
                        <input type="number" value={form.order} onChange={e => setForm(f => ({ ...f, order: e.target.value }))} className="form-input" />
                    </div>
                    <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 12, alignItems: 'center' }}>
                        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? '⏳ Saving…' : editId ? '💾 Update Member' : '➕ Add Member'}</button>
                        {editId && <button type="button" className="btn btn-outline btn-sm" onClick={resetForm}>Cancel</button>}
                        {msg && <span style={{ fontSize: '0.875rem', color: msg.includes('✅') ? '#065F46' : '#991B1B' }}>{msg}</span>}
                    </div>
                </form>
            </div>

            {/* Table */}
            <div className="admin-card">
                <div className="admin-card-title">👥 All Members ({members.length})</div>
                {loading ? <div className="loader"><div className="spinner" /></div> : (
                    <div className="table-wrap">
                        <table>
                            <thead><tr><th>Photo</th><th>Name</th><th>Designation</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
                            <tbody>
                                {members.map(m => (
                                    <tr key={m._id}>
                                        <td>
                                            {m.photoUrl
                                                ? <img src={imgSrc(m.photoUrl)} alt="" className="img-thumb" style={{ borderRadius: '50%' }} />
                                                : <div className="img-thumb" style={{ borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', background: 'var(--cream-dark)' }}>👤</div>
                                            }
                                        </td>
                                        <td><strong>{m.name}</strong></td>
                                        <td>{m.designation || '–'}</td>
                                        <td>{m.order}</td>
                                        <td>
                                            <button className={`toggle-btn ${m.isActive ? 'active' : 'inactive'}`} onClick={() => toggleActive(m)}>
                                                {m.isActive ? '✅ Active' : '❌ Hidden'}
                                            </button>
                                        </td>
                                        <td style={{ whiteSpace: 'nowrap' }}>
                                            <button className="btn btn-sm" style={{ background: '#EEF2FF', color: '#4338CA', marginRight: 6 }} onClick={() => startEdit(m)}>✏️ Edit</button>
                                            <button className="btn-danger" onClick={() => deleteMember(m._id)}>🗑️</button>
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
