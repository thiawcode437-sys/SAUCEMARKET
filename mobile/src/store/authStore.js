import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthAPI } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  loading: true,

  hydrate: async () => {
    const [[, at], [, rt]] = await AsyncStorage.multiGet(['accessToken', 'refreshToken']);
    if (at) {
      try {
        const user = await AuthAPI.me();
        set({ accessToken: at, refreshToken: rt, user, loading: false });
        return;
      } catch {
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
      }
    }
    set({ loading: false });
  },

  setSession: async ({ accessToken, refreshToken, user }) => {
    await AsyncStorage.multiSet([
      ['accessToken', accessToken],
      ['refreshToken', refreshToken],
    ]);
    set({ accessToken, refreshToken, user });
  },

  signOut: async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
    set({ user: null, accessToken: null, refreshToken: null });
  },

  refreshUser: async () => {
    const user = await AuthAPI.me();
    set({ user });
  },
}));
