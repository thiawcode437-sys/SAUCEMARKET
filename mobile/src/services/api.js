import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          await AsyncStorage.setItem('accessToken', data.accessToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        }
      }
    }
    return Promise.reject(error);
  },
);

// --- API helpers ---
export const AuthAPI = {
  requestOtp: (phone) => api.post('/auth/otp/request', { phone }),
  verifyOtp: (phone, code) => api.post('/auth/otp/verify', { phone, code }).then((r) => r.data),
  me: () => api.get('/auth/me').then((r) => r.data),
  updateMe: (data) => api.patch('/auth/me', data).then((r) => r.data),
};

export const ProductAPI = {
  list: (params) => api.get('/products', { params }).then((r) => r.data),
  detail: (id) => api.get(`/products/${id}`).then((r) => r.data),
  create: (body) => api.post('/products', body).then((r) => r.data),
  mine: () => api.get('/products/mine').then((r) => r.data),
  categories: () => api.get('/categories').then((r) => r.data),
};

export const SubscriptionAPI = {
  plans: () => api.get('/subscriptions/plans').then((r) => r.data),
  subscribe: (provider) => api.post('/subscriptions', { provider }).then((r) => r.data),
  me: () => api.get('/subscriptions/me').then((r) => r.data),
};

export const MessageAPI = {
  conversations: () => api.get('/conversations').then((r) => r.data),
  openConv: (productId) => api.post('/conversations', { productId }).then((r) => r.data),
  history: (id, cursor) => api.get(`/conversations/${id}/messages`, { params: { cursor } }).then((r) => r.data),
  send: (id, body) => api.post(`/conversations/${id}/messages`, body).then((r) => r.data),
};

export const SellerAPI = {
  stats: () => api.get('/seller/stats').then((r) => r.data),
};

export { BASE_URL };
