import { useEffect, useState, useRef } from 'react';
import api from '../../api/axios';

const API_BASE = 'http://localhost:5000';

export default function SettingsManager() {
    const [settings, setSettings] = useState({});
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const logoRef = useRef(); const bannerRef = useRef();

    useEffect(() => { api.get('/settings').then(r => setSettings(r.data)); }, []);

    const handleChange = e => setSettings(s => ({ ...s, [e.target.name]: e.target.value }));

    const handleSave = async e => {
        e.preventDefault();
        setSaving(true); setMsg('');
        try {
            // Save text settings
            const { _id, __v, createdAt, updatedAt, logoUrl, heroBannerUrl, ...textFields } = settings;
            await api.put('/settings', textFields);
            // Upload logo if selected
            if (logoFile) {
                const fd = new FormData(); fd.append('logo', logoFile);
                const res = await api.put('/settings/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                setSettings(s => ({ ...s, logoUrl: res.data.logoUrl }));
                setLogoFile(null); if (logoRef.current) logoRef.current.value = '';
            }
            // Upload banner if selected
            if (bannerFile) {
                const fd = new FormData(); fd.append('banner', bannerFile);
                const res = await api.put('/settings/hero-banner', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                setSettings(s => ({ ...s, heroBannerUrl: res.data.heroBannerUrl }));
                setBannerFile(null); if (bannerRef.current) bannerRef.current.value = '';
            }
            setMsg('✅ Settings saved successfully!');
        } catch { setMsg('❌ Failed to save settings.'); }
        finally { setSaving(false); }
    };

    const Field = ({ name, label, placeholder, textarea }) => (
        <div className="form-group">
            <label className="form-label">{label}</label>
            {textarea
                ? <textarea name={name} value={settings[name] || ''} onChange={handleChange} className="form-textarea" rows={3} placeholder={placeholder} />
                : <input name={name} value={settings[name] || ''} onChange={handleChange} className="form-input" placeholder={placeholder} />
            }
        </div>
    );

    return (
        <div>
            <h1 className="admin-page-title">⚙️ Site Settings</h1>
            <p className="admin-page-sub">Configure your foundation's website details, contact info, and branding.</p>

            <form onSubmit={handleSave}>
                {/* Branding */}
                <div className="admin-card">
                    <div className="admin-card-title">🏷️ Branding</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Field name="siteName" label="Foundation Name" placeholder="Shree Foundation" />
                        <Field name="tagline" label="Tagline" placeholder="Building Faith, Serving Humanity" />
                        <div className="form-group">
                            <label className="form-label">Logo Image</label>
                            {settings.logoUrl && <img src={`${API_BASE}${settings.logoUrl}`} alt="Logo" style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 8, marginBottom: 8 }} />}
                            <input ref={logoRef} type="file" accept="image/*" className="form-input" onChange={e => setLogoFile(e.target.files[0])} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Footer Text</label>
                            <textarea name="footerText" value={settings.footerText || ''} onChange={handleChange} className="form-textarea" rows={3} placeholder="Footer description..." />
                        </div>
                    </div>
                </div>

                {/* Hero */}
                <div className="admin-card">
                    <div className="admin-card-title">🏠 Home Hero</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Field name="heroTitle" label="Hero Title" placeholder="Welcome to Shree Foundation" />
                        <Field name="heroSubtitle" label="Hero Subtitle" placeholder="Dedicated to..." />
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Hero Banner Image</label>
                            {settings.heroBannerUrl && (
                                <img src={`${API_BASE}${settings.heroBannerUrl}`} alt="Banner" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                            )}
                            <input ref={bannerRef} type="file" accept="image/*" className="form-input" onChange={e => setBannerFile(e.target.files[0])} />
                            <small style={{ color: 'var(--text-light)' }}>Or upload a photo via Gallery Manager with section "Home Banner"</small>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="admin-card">
                    <div className="admin-card-title">📞 Contact Information</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Field name="contactEmail" label="Email" placeholder="contact@foundation.com" />
                        <Field name="contactPhone" label="Phone" placeholder="+91 98765 43210" />
                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label className="form-label">Address</label>
                            <textarea name="address" value={settings.address || ''} onChange={handleChange} className="form-textarea" rows={2} placeholder="Full address..." />
                        </div>
                    </div>
                </div>

                {/* Social */}
                <div className="admin-card">
                    <div className="admin-card-title">🌐 Social Media Links</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <Field name="facebookUrl" label="Facebook URL" placeholder="https://facebook.com/..." />
                        <Field name="instagramUrl" label="Instagram URL" placeholder="https://instagram.com/..." />
                        <Field name="twitterUrl" label="Twitter URL" placeholder="https://twitter.com/..." />
                        <Field name="youtubeUrl" label="YouTube URL" placeholder="https://youtube.com/..." />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 16, alignItems: 'center', paddingBottom: 32 }}>
                    <button type="submit" className="btn btn-primary" disabled={saving} style={{ padding: '14px 32px' }}>
                        {saving ? '⏳ Saving…' : '💾 Save All Settings'}
                    </button>
                    {msg && <span style={{ fontSize: '0.9rem', color: msg.includes('✅') ? '#065F46' : '#991B1B', fontWeight: 600 }}>{msg}</span>}
                </div>
            </form>
        </div>
    );
}
