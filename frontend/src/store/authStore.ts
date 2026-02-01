import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, LoginResponse } from '@/types';
import { api } from '@/lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasHydrated: boolean;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  checkAuth: () => void;
  setHydrated: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      hasHydrated: false,

      setHydrated: () => set({ hasHydrated: true }),

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await api.post<LoginResponse>('/auth/login', {
            email,
            password,
          });

          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
            });
            localStorage.setItem('token', response.data.token);
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        set({ isLoading: true });
        try {
          const response = await api.post<LoginResponse>('/auth/register', data);

          if (response.success && response.data) {
            set({
              user: response.data.user,
              token: response.data.token,
              isAuthenticated: true,
              isLoading: false,
            });
            localStorage.setItem('token', response.data.token);
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        // Notify backend for audit log (best-effort; don't block clearing state)
        api.post('/auth/logout').catch(() => {});
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },

      updateProfile: async (updates: Partial<User>) => {
        try {
          const response = await api.put<User>('/auth/profile', updates);

          if (response.success && response.data) {
            set({ user: response.data });
          }
        } catch (error) {
          throw error;
        }
      },

      changePassword: async (oldPassword: string, newPassword: string) => {
        try {
          await api.put('/auth/change-password', {
            oldPassword,
            newPassword,
          });
        } catch (error) {
          throw error;
        }
      },

      checkAuth: () => {
        const token = localStorage.getItem('token');
        if (token && !get().isAuthenticated) {
          // Token exists but store not initialized - fetch user profile
          api.get<User>('/auth/profile')
            .then((response) => {
              if (response.success && response.data) {
                set({
                  user: response.data,
                  token,
                  isAuthenticated: true,
                });
              }
            })
            .catch(() => {
              // Token invalid - logout
              get().logout();
            });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
