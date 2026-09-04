import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearAuth } from '../api/client';

const AuthContext = createContext(null);

function readUser() {
  try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(Boolean(user));

  const loadForms = useCallback(async () => {
    const response = await api('/forms');
    setForms(response.data || []);
  }, []);

  useEffect(() => {
    if (!user) { setLoading(false); setForms([]); return; }
    loadForms().catch(() => {}).finally(() => setLoading(false));
  }, [user, loadForms]);

  const login = async (username, password) => {
    const response = await api('/auth/userlogin', { method: 'POST', body: JSON.stringify({ username, password }) });
    const access = response.access_token;
    const refresh = response.refresh_token || response.refreshToken;
    localStorage.setItem('token', access);
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
    return response.user;
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    try { await api('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }); } catch {}
    clearAuth(); setUser(null); setForms([]);
  };

  const permissionFor = useCallback(code => {
    if (user?.isAdmin) return { CanView: true, CanAdd: true, CanEdit: true, CanDelete: true, CanPrint: true, CanMenu: true, CanOther: true };
    return user?.permissions?.find(item => item.FormCode === code) || {};
  }, [user]);

  const value = useMemo(() => ({ user, forms, loading, login, logout, reloadForms: loadForms, permissionFor }), [user, forms, loading, loadForms, permissionFor]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be inside AuthProvider');
  return value;
}
