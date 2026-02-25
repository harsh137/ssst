import axios from 'axios';

// In dev: VITE_API_URL=http://localhost:5000/api  (in frontend/.env.local)
// In prod: VITE_API_URL=https://ssst-production.up.railway.app/api  (in Vercel env vars)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const IMAGE_BASE = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace('/api', '')
    : 'http://localhost:5000';

// Smart image URL resolver:
// - Full Cloudinary URL (https://...) → returned as-is
// - Legacy local path (/uploads/...) → prefixed with IMAGE_BASE
export const imgSrc = (url) =>
    !url ? '' : url.startsWith('http') ? url : `${IMAGE_BASE}${url}`;

const api = axios.create({ baseURL: API_BASE });

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;
