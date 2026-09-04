const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function clearAuth() {
  ['token', 'access_token', 'refresh_token', 'user'].forEach(key => localStorage.removeItem(key));
}

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) throw new Error('No refresh token');
  const response = await fetch(`${baseUrl}/auth/refresh`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken })
  });
  if (!response.ok) throw new Error('Session expired');
  const data = await response.json();
  const token = data.access_token || data.accessToken;
  localStorage.setItem('token', token);
  localStorage.setItem('access_token', token);
  localStorage.setItem('refresh_token', data.refresh_token || data.refreshToken);
  return token;
}

export async function api(path, options = {}, retry = true) {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  if (response.status === 401 && retry && !path.startsWith('/auth/')) {
    try {
      const fresh = await refreshAccessToken();
      return api(path, { ...options, headers: { ...headers, Authorization: `Bearer ${fresh}` } }, false);
    } catch {
      clearAuth();
      window.location.assign('/login');
    }
  }
  if (response.status === 204) return null;
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || `Request failed (${response.status})`);
  return payload;
}

export { clearAuth };
