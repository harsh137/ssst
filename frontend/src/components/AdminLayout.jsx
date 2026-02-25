import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const navItems = [
    { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
    { to: '/admin/gallery', label: 'Gallery', icon: '🖼️' },
    { to: '/admin/members', label: 'Members', icon: '👥' },
    { to: '/admin/content', label: 'Content', icon: '📝' },
    { to: '/admin/settings', label: 'Settings', icon: '⚙️' },
    { to: '/admin/contacts', label: 'Contacts', icon: '✉️' },
];

export default function AdminLayout() {
    const { admin, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => { logout(); navigate('/admin/login'); };

    return (
        <div className="admin-shell">
            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-brand">
                    <span className="sidebar-icon">🛕</span>
                    <div>
                        <div className="sidebar-title">Admin Panel</div>
                        <div className="sidebar-email">{admin?.email}</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                        >
                            <span className="sidebar-link-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <button className="sidebar-logout" onClick={handleLogout}>
                    🚪 Logout
                </button>
            </aside>

            {/* Overlay for mobile */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* Main content */}
            <div className="admin-main">
                <header className="admin-topbar">
                    <button className="topbar-menu-btn" onClick={() => setSidebarOpen(o => !o)}>☰</button>
                    <div className="topbar-breadcrumb">Foundation Management System</div>
                    <a href="/" target="_blank" className="topbar-view-site btn btn-outline" style={{ padding: '6px 16px', fontSize: '0.8rem' }}>
                        View Site ↗
                    </a>
                </header>
                <div className="admin-content">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
