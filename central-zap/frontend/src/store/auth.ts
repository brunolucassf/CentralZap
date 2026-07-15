import { create } from 'zustand';
import api from '../services/api';

const TOKEN_KEY = 'centralzap-token';
const USER_KEY = 'centralzap-user';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loadFromStorage: () => void;
}

function persist(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  loadFromStorage: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw = localStorage.getItem(USER_KEY);
    if (token && raw) {
      try {
        set({ token, user: JSON.parse(raw) });
      } catch {
        /* ignora */
      }
    }
  },
  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data.token, data.user);
    set({ token: data.token, user: data.user });
  },
  register: async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    persist(data.token, data.user);
    set({ token: data.token, user: data.user });
  },
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ token: null, user: null });
  },
}));
