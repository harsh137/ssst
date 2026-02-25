import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

export default function AdminLogin() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();
        setError(''); setLoading(true);
        try {
            await login(form.email, form.password);
            navigate('/admin');
        } catch {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-left-content">
                    <div className="login-logo">🛕</div>
                    <h1>Foundation Management System</h1>
                    <p>Secure admin portal for managing temple construction updates, gallery, members, and content.</p>
                    <div className="login-features">
                        {['Manage Gallery & Photos', 'Update Founder Members', 'Edit Website Content', 'View Contact Messages'].map(f => (
                            <div key={f} className="login-feature-item">✓ {f}</div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="login-right">
                <div className="login-form-card">
                    <div className="login-form-header">
                        <h2>Admin Login</h2>
                        <p>Sign in to access the management panel</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                type="email" required
                                value={form.email}
                                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                placeholder="admin@foundation.com"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Password</label>
                            <input
                                type="password" required
                                value={form.password}
                                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                placeholder="••••••••"
                                className="form-input"
                            />
                        </div>
                        {error && <div className="alert alert-error">❌ {error}</div>}
                        <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: 4 }} disabled={loading}>
                            {loading ? '⏳ Signing in…' : '🔐 Sign In'}
                        </button>
                    </form>

                    <div style={{ marginTop: 16, fontSize: '0.8rem', color: 'var(--text-light)', textAlign: 'center' }}>
                        Default: admin@foundation.com / admin123
                    </div>
                </div>
            </div>
        </div>
    );
}
