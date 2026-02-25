import { useEffect, useState } from 'react';
import api from '../../api/axios';
import './Contact.css';

export default function Contact() {
    const [settings, setSettings] = useState({});
    const [content, setContent] = useState({});
    const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle | sending | success | error
    const [msg, setMsg] = useState('');

    useEffect(() => {
        Promise.all([api.get('/settings'), api.get('/content/contact')])
            .then(([s, c]) => { setSettings(s.data); setContent(c.data); });
    }, []);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async e => {
        e.preventDefault();
        if (!form.name || !form.message) return;
        setStatus('sending');
        try {
            const res = await api.post('/contact', form);
            setStatus('success');
            setMsg(res.data.message || 'Message sent successfully!');
            setForm({ name: '', email: '', phone: '', message: '' });
        } catch {
            setStatus('error');
            setMsg('Something went wrong. Please try again.');
        }
    };

    return (
        <div className="contact-page">
            <div className="page-hero">
                <div className="container">
                    <h1>{content.hero?.title || 'Contact Us'}</h1>
                    <p>{content.hero?.body || 'We would love to hear from you. Reach out to us anytime.'}</p>
                </div>
            </div>

            <section className="section">
                <div className="container contact-grid">
                    {/* Info */}
                    <div className="contact-info">
                        <h2 className="section-title" style={{ textAlign: 'left' }}>Get In Touch</h2>
                        <div className="ornamental-divider" style={{ justifyContent: 'flex-start', maxWidth: 200 }}><span>✦</span></div>
                        <p className="contact-intro">{content.intro?.body || 'Reach out to us for inquiries, donations, or to learn more about our foundation and the temple construction project.'}</p>
                        <div className="contact-details">
                            {settings.address && (
                                <div className="contact-detail-item">
                                    <div className="contact-detail-icon">📍</div>
                                    <div>
                                        <div className="contact-detail-label">Address</div>
                                        <div className="contact-detail-value">{settings.address}</div>
                                    </div>
                                </div>
                            )}
                            {settings.contactPhone && (
                                <div className="contact-detail-item">
                                    <div className="contact-detail-icon">📞</div>
                                    <div>
                                        <div className="contact-detail-label">Phone</div>
                                        <div className="contact-detail-value">{settings.contactPhone}</div>
                                    </div>
                                </div>
                            )}
                            {settings.contactEmail && (
                                <div className="contact-detail-item">
                                    <div className="contact-detail-icon">✉️</div>
                                    <div>
                                        <div className="contact-detail-label">Email</div>
                                        <div className="contact-detail-value">{settings.contactEmail}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form */}
                    <div className="contact-form-card card">
                        <h3 style={{ marginBottom: 20, color: 'var(--maroon-dark)', fontFamily: "'Cinzel', serif" }}>Send us a Message</h3>
                        <form onSubmit={handleSubmit} className="contact-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="form-label">Full Name *</label>
                                    <input name="name" value={form.name} onChange={handleChange} required placeholder="Your full name" className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number</label>
                                    <input name="phone" value={form.phone} onChange={handleChange} placeholder="Your phone number" className="form-input" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className="form-input" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Message *</label>
                                <textarea name="message" value={form.message} onChange={handleChange} required placeholder="Write your message here…" className="form-textarea" rows={5} />
                            </div>

                            {status === 'success' && <div className="alert alert-success">✅ {msg}</div>}
                            {status === 'error' && <div className="alert alert-error">❌ {msg}</div>}

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={status === 'sending'}>
                                {status === 'sending' ? '⏳ Sending…' : '🙏 Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
}
