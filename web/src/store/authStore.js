import { create } from 'zustand';
import { AuthAPI } from '../lib/api';

export const useAuth = create((set) => ({
  user: null,
  loading: true,

  init: async () => {
    const token = localStorage.getItem('token');
    if (!token) return set({ loading: false });
    try {
      const user = await AuthAPI.me();
      set({ user, loading: false });
    } catch {
      localStorage.removeItem('token');
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    const data = await AuthAPI.login(email, password);
    localStorage.setItem('token', data.accessToken);
    set({ user: data.user });
    return data.user;
  },

  register: async (payload) => {
    await AuthAPI.register(payload);
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null });
  },
}));
