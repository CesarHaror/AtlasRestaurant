import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { login as loginApi } from '../api/auth.api';
import { User } from '../types/auth.types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      async login(username, password) {
        try {
          set({ loading: true, error: null });
          const res = await loginApi({ username, password });
          localStorage.setItem('atlas_token', res.accessToken);
          set({ user: res.user, token: res.accessToken, loading: false });
          return true;
        } catch (e: any) {
          set({ error: e.response?.data?.message || 'Error de autenticación', loading: false });
          return false;
        }
      },
      logout() {
        localStorage.removeItem('atlas_token');
        set({ user: null, token: null });
      },
    }),
    {
      name: 'atlas-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
