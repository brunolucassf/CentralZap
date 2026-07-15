import { create } from 'zustand';

const STORAGE_KEY = 'centralzap-theme';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  set: (t: Theme) => void;
}

function getInitial(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (saved === 'light' || saved === 'dark') return saved;
  // padrão: dark (combina com a identidade do app)
  return 'dark';
}

function applyTheme(t: Theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', t === 'dark');
  localStorage.setItem(STORAGE_KEY, t);
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: getInitial(),
  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    set({ theme: next });
  },
  set: (t) => {
    applyTheme(t);
    set({ theme: t });
  },
}));

// Aplica o tema salvo assim que o módulo carrega
applyTheme(getInitial());
