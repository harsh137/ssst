import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';

export default function Dashboard() {
    const [stats, setStats] = useState({ gallery: 0, members: 0, contacts: 0, unread: 0 });
    const [recentContacts, setRecentContacts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get('/gallery/all'),
            api.get('/members/all'),
            api.get('/contact'),
        ]).then(([g, m, c]) => {
            setStats({
                gallery: g.data.length,
                members: m.data.length,
                contacts: c.data.length,
                unread: c.data.filter(x => !x.isRead).length,
            });
            setRecentContacts(c.data.slice(0, 5));
        }).finally(() => setLoading(false));
    }, []);

    const statItems = [
        { icon: '🖼️', num: stats.gallery, label: 'Gallery Images', color: 'var(--saffron)', to: '/admin/gallery' },
        { icon: '👥', num: stats.members, label: 'Founder Members', color: 'var(--gold)', to: '/admin/members' },
        { icon: '✉️', num: stats.contacts, label: 'Total Messages', color: 'var(--maroon)', to: '/admin/contacts' },
        { icon: '🔔', num: stats.unread, label: 'Unread Messages', color: '#DC2626', to: '/admin/contacts' },
    ];

    return (
        <div>
            <h1 className="admin-page-title">Dashboard</h1>
            <p className="admin-page-sub">Welcome back! Here's an overview of your website.</p>

            {loading ? (
                <div className="loader"><div className="spinner" /></div>
            ) : (
                <>
                    <div className="stat-grid">
                        {statItems.map(s => (
                            <Link to={s.to} key={s.label} className="stat-card" style={{ borderLeftColor: s.color, textDecoration: 'none' }}>
                                <div className="stat-icon">{s.icon}</div>
                                <div>
                                    <div className="stat-num">{s.num}</div>
                                    <div className="stat-label">{s.label}</div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Quick Actions */}
                    <div className="admin-card">
                        <div className="admin-card-title">⚡ Quick Actions</div>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            {[
                                { to: '/admin/gallery', label: '📸 Upload Image' },
                                { to: '/admin/members', label: '👤 Add Member' },
                                { to: '/admin/content', label: '📝 Edit Content' },
                                { to: '/admin/settings', label: '⚙️ Site Settings' },
                                { to: '/admin/contacts', label: '✉️ View Messages' },
                            ].map(a => (
                                <Link key={a.to} to={a.to} className="btn btn-outline btn-sm">{a.label}</Link>
                            ))}
                        </div>
                    </div>

                    {/* Recent Messages */}
                    <div className="admin-card">
                        <div className="admin-card-title">✉️ Recent Messages</div>
                        {recentContacts.length === 0 ? (
                            <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>No messages yet.</p>
                        ) : (
                            <div className="table-wrap">
                                <table>
                                    <thead><tr><th>Name</th><th>Phone</th><th>Message</th><th>Date</th><th>Status</th></tr></thead>
                                    <tbody>
                                        {recentContacts.map(c => (
                                            <tr key={c._id}>
                                                <td><strong>{c.name}</strong></td>
                                                <td>{c.phone || '–'}</td>
                                                <td style={{ maxWidth: 220 }}>{c.message.slice(0, 60)}{c.message.length > 60 ? '…' : ''}</td>
                                                <td style={{ whiteSpace: 'nowrap', fontSize: '0.8rem', color: 'var(--text-light)' }}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                                                <td>
                                                    <span className={`badge ${c.isRead ? 'badge-gold' : 'badge-saffron'}`}>{c.isRead ? 'Read' : 'New'}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
