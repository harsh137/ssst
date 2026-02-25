import { useEffect, useState, useRef } from 'react';
import api, { IMAGE_BASE } from '../../api/axios';
import { invalidateCachePrefix } from '../../api/cache';

export default function SettingsManager() {
    const [settings, setSettings] = useState({});
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState('');
    const [logoFile, setLogoFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const logoRef = useRef(); const bannerRef = useRef();

    useEffect(() => { api.get('/settings').then(r => setSettings(r.data || {})); }, []);

    const handleChange = e => setSettings(s => ({ ...s, [e.target.name]: e.target.value }));

    const handleSave = async e => {
        e.preventDefault();
        setSaving(true); setMsg('');
        try {
            const { _id, __v, createdAt, updatedAt, logoUrl, heroBannerUrl, ...textFields } = settings;
            await api.put('/settings', textFields);
            if (logoFile) {
                const fd = new FormData(); fd.append('logo', logoFile);
                const res = await api.put('/settings/logo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                setSettings(s => ({ ...s, logoUrl: res.data.logoUrl }));
                setLogoFile(null); if (logoRef.current) logoRef.current.value = '';
            }
            if (bannerFile) {
                const fd = new FormData(); fd.append('banner', bannerFile);
                const res = await api.put('/settings/hero-banner', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
                setSettings(s => ({ ...s, heroBannerUrl: res.data.heroBannerUrl }));
                setBannerFile(null); if (bannerRef.current) bannerRef.current.value = '';
            }
            invalidateCachePrefix('settings');
            setMsg('✅ Settings saved successfully!');
        } catch { setMsg('❌ Failed to save settings.'); }
        finally { setSaving(false); }
    };

    const removeLogo = async () => {
        if (!window.confirm('Remove the logo?')) return;
        try {
            await api.delete('/settings/logo');
            setSettings(s => ({ ...s, logoUrl: '' }));
            invalidateCachePrefix('settings');
            setMsg('✅ Logo removed.');
        } catch { setMsg('❌ Failed to remove logo.'); }
    };

    const removeBanner = async () => {
        if (!window.confirm('Remove the hero banner?')) return;
        try {
            await api.delete('/settings/hero-banner');
            setSettings(s => ({ ...s, heroBannerUrl: '' }));
            invalidateCachePrefix('settings');
            setMsg('✅ Banner removed.');
        } catch { setMsg('❌ Failed to remove banner.'); }
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

    // Determine image src — Cloudinary returns full https:// URL, local returns /uploads/...
    const logoSrc = settings.logoUrl?.startsWith('http') ? settings.logoUrl : settings.logoUrl ? `${IMAGE_BASE}${settings.logoUrl}` : null;
    const bannerSrc = settings.heroBannerUrl?.startsWith('http') ? settings.heroBannerUrl : settings.heroBannerUrl ? `${IMAGE_BASE}${settings.heroBannerUrl}` : null;

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
                            {logoSrc && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                                    <img src={logoSrc} alt="Logo" style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 8, border: '1px solid #eee' }} />
                                    <button type="button" onClick={removeLogo} style={{ padding: '4px 12px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer' }}>
                                        🗑️ Remove Logo
                                    </button>
                                </div>
                            )}
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
                            {bannerSrc && (
                                <div style={{ marginBottom: 8 }}>
                                    <img src={bannerSrc} alt="Banner" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 8 }} />
                                    <button type="button" onClick={removeBanner} style={{ padding: '4px 12px', background: '#fef2f2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer' }}>
                                        🗑️ Remove Banner
                                    </button>
                                </div>
                            )}
                            <input ref={bannerRef} type="file" accept="image/*" className="form-input" onChange={e => setBannerFile(e.target.files[0])} />
                            <small style={{ color: 'var(--text-light)' }}>Or upload via Gallery Manager → section "Home Banner"</small>
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
