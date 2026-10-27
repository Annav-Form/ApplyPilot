import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('applypilot_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('applypilot_token') || null);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState({ connected: true, readyState: 1 });

  const checkHealth = useCallback(async () => {
    try {
      const data = await api.getHealth();
      if (data && data.db) {
        setDbStatus(data.db);
      }
    } catch (err) {
      setDbStatus({ connected: false, readyState: 0, error: err.message });
    }
  }, []);

  const loadCurrentUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await api.auth.getMe();
      if (res && res.user) {
        setUser(res.user);
        localStorage.setItem('applypilot_user', JSON.stringify(res.user));
      }
    } catch (err) {
      // If token invalid, clear
      if (err.status === 401) {
        setUser(null);
        setToken(null);
        localStorage.removeItem('applypilot_token');
        localStorage.removeItem('applypilot_user');
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    checkHealth();
    loadCurrentUser();

    const handleAuthExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [checkHealth, loadCurrentUser]);

  const login = async (email, password) => {
    const res = await api.auth.login({ email, password });
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('applypilot_token', res.token);
      localStorage.setItem('applypilot_user', JSON.stringify(res.user));
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.auth.register(userData);
    if (res.token && res.user) {
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('applypilot_token', res.token);
      localStorage.setItem('applypilot_user', JSON.stringify(res.user));
    }
    return res;
  };

  const logout = () => {
    api.auth.logout().catch(() => {});
    setUser(null);
    setToken(null);
    localStorage.removeItem('applypilot_token');
    localStorage.removeItem('applypilot_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        dbStatus,
        checkHealth,
        isAuthenticated: Boolean(user && token),
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
