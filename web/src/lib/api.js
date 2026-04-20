import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://sauce-market-api.onrender.com/v1';

export const api = axios.create({ baseURL: BASE_URL, timeout: 60000 });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const AuthAPI = {
  register: (data) => api.post('/auth/register', data).then((r) => r.data),
  login:    (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data),
  me:       () => api.get('/auth/me').then((r) => r.data),
};

export const ProductAPI = {
  list:       (params) => api.get('/products', { params }).then((r) => r.data),
  detail:     (id) => api.get(`/products/${id}`).then((r) => r.data),
  categories: () => api.get('/categories').then((r) => r.data),
};

export const MessageAPI = {
  openConv: (productId) => api.post('/conversations', { productId }).then((r) => r.data),
};

export { BASE_URL };
