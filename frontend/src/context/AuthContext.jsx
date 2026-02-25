import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        const adminData = localStorage.getItem('admin_data');
        if (token && adminData) {
            setAdmin(JSON.parse(adminData));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('admin_token', res.data.token);
        localStorage.setItem('admin_data', JSON.stringify(res.data.admin));
        setAdmin(res.data.admin);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_data');
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{ admin, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
