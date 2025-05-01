import { API_BASE_URL } from './config';
import { logout } from './services/auth/authService';

const handleUnauthorized = () => {
  logout();
  window.location.href = '/';
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  if (!token) {
    handleUnauthorized();
    throw new Error('No token provided');
  }

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, { ...options, headers });
    
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Session expired');
    }

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg || 'Request failed');
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message === 'Session expired') {
      throw error;
    }
    throw new Error('Network error');
  }
};

export const login = async (username: string, password: string) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || 'Login failed');
  }

  return res.json();
};

export const api = {
  get: (url: string) => fetchWithAuth(`${API_BASE_URL}${url}`, { method: 'GET' }).then(res => res.json()),
  post: <T extends object>(url: string, data: T) => fetchWithAuth(`${API_BASE_URL}${url}`, { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }).then(res => res.json()),
  put: <T extends object>(url: string, data: T) => fetchWithAuth(`${API_BASE_URL}${url}`, { 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }).then(res => res.json()),
  delete: (url: string) => fetchWithAuth(`${API_BASE_URL}${url}`, { method: 'DELETE' }).then(res => res.json()),
};
