// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginAdmin, getMe } from '../api';

const AuthContext = createContext(null);

const TOKEN_KEY = 'smartq_admin_token';

export function AuthProvider({ children }) {
  const [admin,    setAdmin]    = useState(null);
  const [loading,  setLoading]  = useState(true);  // checking stored token on boot
  const [authError, setAuthError] = useState('');

  // On mount: if we have a stored token, validate it with /api/auth/me
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) { setLoading(false); return; }

    getMe(stored)
      .then((data) => setAdmin(data.admin))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthError('');
    const data = await loginAdmin(email, password); // throws on error
    localStorage.setItem(TOKEN_KEY, data.token);
    setAdmin(data.admin);
    return data.admin;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setAdmin(null);
  }, []);

  const getToken = useCallback(() => localStorage.getItem(TOKEN_KEY), []);

  return (
    <AuthContext.Provider value={{ admin, loading, authError, setAuthError, login, logout, getToken, isLoggedIn: !!admin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
