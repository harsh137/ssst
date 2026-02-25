import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function ContactsViewer() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState('all');

    const load = () => {
        setLoading(true);
        api.get('/contact').then(r => setContacts(r.data)).finally(() => setLoading(false));
    };
    useEffect(load, []);

    const markRead = async id => {
        await api.put(`/contact/${id}/read`);
        load();
    };
    const deleteContact = async id => {
        if (!confirm('Delete this message?')) return;
        await api.delete(`/contact/${id}`);
        if (selected?._id === id) setSelected(null);
        load();
    };

    const filtered = contacts.filter(c => filter === 'all' ? true : filter === 'unread' ? !c.isRead : c.isRead);
    const unread = contacts.filter(c => !c.isRead).length;

    return (
        <div>
            <h1 className="admin-page-title">✉️ Contact Messages</h1>
            <p className="admin-page-sub">View and manage messages submitted via the Contact Us form.</p>

            <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                {/* List */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="admin-card" style={{ marginBottom: 0 }}>
                        <div className="admin-card-title" style={{ justifyContent: 'space-between' }}>
                            <span>Messages ({contacts.length})</span>
                            {unread > 0 && <span className="badge badge-saffron">{unread} new</span>}
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                            {['all', 'unread', 'read'].map(f => (
                                <button key={f} onClick={() => setFilter(f)}
                                    className={filter === f ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                        {loading ? <div className="loader"><div className="spinner" /></div> : (
                            <div className="table-wrap">
                                <table>
                                    <thead><tr><th>Name</th><th>Phone/Email</th><th>Preview</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                                    <tbody>
                                        {filtered.map(c => (
                                            <tr key={c._id} onClick={() => setSelected(c)} style={{ cursor: 'pointer', background: !c.isRead ? '#FFFBF0' : 'transparent', fontWeight: !c.isRead ? 600 : 400 }}>
                                                <td>{c.name}</td>
                                                <td style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>{c.phone || c.email || '–'}</td>
                                                <td style={{ maxWidth: 180, fontSize: '0.85rem' }}>{c.message.slice(0, 50)}…</td>
                                                <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-light)' }}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                                                <td><span className={`badge ${c.isRead ? 'badge-gold' : 'badge-saffron'}`}>{c.isRead ? 'Read' : 'New'}</span></td>
                                                <td style={{ whiteSpace: 'nowrap' }} onClick={e => e.stopPropagation()}>
                                                    {!c.isRead && <button className="btn btn-sm" style={{ background: '#D1FAE5', color: '#065F46', marginRight: 6 }} onClick={() => markRead(c._id)}>✓ Mark Read</button>}
                                                    <button className="btn-danger" onClick={() => deleteContact(c._id)}>🗑️</button>
                                                </td>
                                            </tr>
                                        ))}
                                        {filtered.length === 0 && (
                                            <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-light)', padding: 32 }}>No messages found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail Panel */}
                {selected && (
                    <div className="admin-card" style={{ width: 320, flexShrink: 0, position: 'sticky', top: 80 }}>
                        <div className="admin-card-title">💬 Message Detail</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.875rem' }}>
                            <div><span style={{ color: 'var(--text-light)' }}>Name: </span><strong>{selected.name}</strong></div>
                            {selected.email && <div><span style={{ color: 'var(--text-light)' }}>Email: </span>{selected.email}</div>}
                            {selected.phone && <div><span style={{ color: 'var(--text-light)' }}>Phone: </span>{selected.phone}</div>}
                            <div><span style={{ color: 'var(--text-light)' }}>Date: </span>{new Date(selected.createdAt).toLocaleString('en-IN')}</div>
                            <div style={{ borderTop: '1px solid #F0F2F8', paddingTop: 12 }}>
                                <div style={{ color: 'var(--text-light)', marginBottom: 6, fontWeight: 600 }}>Message:</div>
                                <p style={{ lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selected.message}</p>
                            </div>
                            <div style={{ display: 'flex', gap: 8 }}>
                                {!selected.isRead && <button className="btn btn-primary btn-sm" onClick={() => { markRead(selected._id); setSelected(s => ({ ...s, isRead: true })); }}>✓ Mark as Read</button>}
                                <button className="btn-danger" onClick={() => deleteContact(selected._id)}>🗑️ Delete</button>
                                <button className="btn btn-sm" style={{ background: '#F3F4F6' }} onClick={() => setSelected(null)}>✕ Close</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
