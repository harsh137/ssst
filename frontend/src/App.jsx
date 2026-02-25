import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { preload } from './api/cache';
import api from './api/axios';
import './index.css';

// Kick off all public API fetches immediately in the background
// so data is cached before the user navigates to any page
preload([
  { key: 'settings', apiFn: () => api.get('/settings').then(r => r.data) },
  { key: 'content/home', apiFn: () => api.get('/content/home').then(r => r.data) },
  { key: 'content/about', apiFn: () => api.get('/content/about').then(r => r.data) },
  { key: 'content/members', apiFn: () => api.get('/content/members').then(r => r.data) },
  { key: 'content/gallery', apiFn: () => api.get('/content/gallery').then(r => r.data) },
  { key: 'content/contact', apiFn: () => api.get('/content/contact').then(r => r.data) },
  { key: 'members/public', apiFn: () => api.get('/members').then(r => r.data) },
  { key: 'gallery/home_banner', apiFn: () => api.get('/gallery?section=home_banner').then(r => r.data) },
  { key: 'gallery/home_gallery', apiFn: () => api.get('/gallery?section=home_gallery').then(r => r.data) },
  { key: 'gallery/progress', apiFn: () => api.get('/gallery?section=progress_update').then(r => r.data) },
  { key: 'gallery/gallery_page', apiFn: () => api.get('/gallery?section=gallery_page').then(r => r.data) },
  { key: 'gallery/all_public', apiFn: () => api.get('/gallery').then(r => r.data) },
]);

// Public Pages
import PublicLayout from './components/PublicLayout';
import Home from './pages/public/Home';
import AboutUs from './pages/public/AboutUs';
import Members from './pages/public/Members';
import Gallery from './pages/public/Gallery';
import Contact from './pages/public/Contact';

// Admin Pages
import AdminLogin from './pages/admin/Login';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import GalleryManager from './pages/admin/GalleryManager';
import MembersManager from './pages/admin/MembersManager';
import ContentManager from './pages/admin/ContentManager';
import SettingsManager from './pages/admin/SettingsManager';
import ContactsViewer from './pages/admin/ContactsViewer';

const ProtectedRoute = ({ children }) => {
  const { admin, loading } = useAuth();
  if (loading) return <div className="loader"><div className="spinner" /></div>;
  return admin ? children : <Navigate to="/admin/login" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public Site ── */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/members" element={<Members />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
          </Route>

          {/* ── Admin ── */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="gallery" element={<GalleryManager />} />
            <Route path="members" element={<MembersManager />} />
            <Route path="content" element={<ContentManager />} />
            <Route path="settings" element={<SettingsManager />} />
            <Route path="contacts" element={<ContactsViewer />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
