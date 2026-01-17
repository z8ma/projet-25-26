import { create } from 'zustand';
import { authApi } from '../services/api';

interface User {
  id: string;
  email: string;
  role: 'CREATOR' | 'PROFESSIONAL';
  creator?: {
    id: string;
    companyName?: string;
  };
  professional?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    role: 'CREATOR' | 'PROFESSIONAL';
    companyName?: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login({ email, password });

      if (response.success) {
        const { user, token } = response.data;

        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        set({ user, token, isLoading: false });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de la connexion';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(data);

      if (response.success) {
        const { user, token } = response.data;

        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        set({ user, token, isLoading: false });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  loadUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    set({ isLoading: true });
    try {
      const response = await authApi.getMe();
      if (response.success) {
        set({ user: response.data, isLoading: false });
      }
    } catch (error) {
      // Token invalid, clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
