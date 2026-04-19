import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/v1';

export const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('adminToken');
      if (location.pathname !== '/login') location.href = '/login';
    }
    return Promise.reject(err);
  },
);

// --- Endpoints ---
export const AuthAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
};

export const AdminAPI = {
  stats:          () => api.get('/admin/stats').then((r) => r.data),
  users:          (params) => api.get('/admin/users', { params }).then((r) => r.data),
  updateUser:     (id, data) => api.patch(`/admin/users/${id}`, data).then((r) => r.data),
  subscriptions:  (params) => api.get('/admin/subscriptions', { params }).then((r) => r.data),
  productsModeration: (params) => api.get('/admin/products', { params }).then((r) => r.data),
  approveProduct: (id) => api.post(`/admin/products/${id}/approve`).then((r) => r.data),
  rejectProduct:  (id, reason) => api.post(`/admin/products/${id}/reject`, { reason }).then((r) => r.data),
  reports:        (params) => api.get('/admin/reports', { params }).then((r) => r.data),
  updateConfig:   (key, value) => api.patch('/admin/config', { key, value }).then((r) => r.data),
};

export { BASE_URL };
