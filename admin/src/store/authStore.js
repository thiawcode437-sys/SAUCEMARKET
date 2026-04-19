import { create } from 'zustand';
import { AuthAPI } from '../lib/api';

export const useAuth = create((set) => ({
  user: null,
  loading: true,

  init: async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return set({ loading: false });
    try {
      const user = await AuthAPI.me();
      if (user.role !== 'ADMIN') {
        localStorage.removeItem('adminToken');
        return set({ loading: false });
      }
      set({ user, loading: false });
    } catch {
      localStorage.removeItem('adminToken');
      set({ loading: false });
    }
  },

  login: async (email, password) => {
    const data = await AuthAPI.login(email, password);
    if (data.user.role !== 'ADMIN') {
      throw new Error('Accès admin uniquement');
    }
    localStorage.setItem('adminToken', data.accessToken);
    set({ user: data.user });
  },

  logout: () => {
    localStorage.removeItem('adminToken');
    set({ user: null });
  },
}));
