const API_BASE = '/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isDbError = Boolean(data && data.isDbError);
  }
}

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('applypilot_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      if (res.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register')) {
        // Discard invalid session
        localStorage.removeItem('applypilot_token');
        localStorage.removeItem('applypilot_user');
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
      throw new ApiError(data.message || `Request failed with status ${res.status}`, res.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Network error occurred. Please check your connection.', 0);
  }
};

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Auth
  auth: {
    register: (userData) => request('/auth/register', { method: 'POST', body: userData }),
    login: (credentials) => request('/auth/login', { method: 'POST', body: credentials }),
    getMe: () => request('/auth/me'),
    updateProfile: (profileData) => request('/auth/profile', { method: 'PUT', body: profileData }),
    logout: () => request('/auth/logout', { method: 'POST' }),
  },

  // Applications
  applications: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== '') {
          query.append(key, params[key]);
        }
      });
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return request(`/applications${queryString}`);
    },
    getById: (id) => request(`/applications/${id}`),
    create: (data) => request('/applications', { method: 'POST', body: data }),
    update: (id, data) => request(`/applications/${id}`, { method: 'PUT', body: data }),
    updateStatus: (id, status) => request(`/applications/${id}/status`, { method: 'PATCH', body: { status } }),
    delete: (id) => request(`/applications/${id}`, { method: 'DELETE' }),
  },

  // Rounds
  rounds: {
    add: (appId, data) => request(`/applications/${appId}/rounds`, { method: 'POST', body: data }),
    update: (appId, roundId, data) => request(`/applications/${appId}/rounds/${roundId}`, { method: 'PUT', body: data }),
    delete: (appId, roundId) => request(`/applications/${appId}/rounds/${roundId}`, { method: 'DELETE' }),
    getUpcoming: () => request('/rounds/upcoming'),
  },

  // Dashboard
  dashboard: {
    getStats: () => request('/dashboard/stats'),
  },

  // Playbooks
  playbooks: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== '') {
          query.append(key, params[key]);
        }
      });
      const queryString = query.toString() ? `?${query.toString()}` : '';
      return request(`/playbooks${queryString}`);
    },
    create: (data) => request('/playbooks', { method: 'POST', body: data }),
    update: (id, data) => request(`/playbooks/${id}`, { method: 'PUT', body: data }),
    toggle: (id) => request(`/playbooks/${id}/toggle`, { method: 'PATCH' }),
    delete: (id) => request(`/playbooks/${id}`, { method: 'DELETE' }),
    seedStarter: () => request('/playbooks/seed-starter', { method: 'POST' }),
  },

  // Demo
  demo: {
    seed: (force = false) => request('/demo/seed', { method: 'POST', body: { force } }),
  },
};

export default api;
