import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('akira_theme') as Theme | null;
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  }
  return 'light';
};

export const applyThemeToDocument = (theme: Theme) => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
    localStorage.setItem('akira_theme', theme);
  }
};

export const useThemeStore = create<ThemeStore>((set) => {
  const initialTheme = getInitialTheme();
  applyThemeToDocument(initialTheme);

  return {
    theme: initialTheme,
    setTheme: (theme: Theme) => {
      applyThemeToDocument(theme);
      set({ theme });
    },
    toggleTheme: () => {
      set((state) => {
        const nextTheme: Theme = state.theme === 'light' ? 'dark' : 'light';
        applyThemeToDocument(nextTheme);
        return { theme: nextTheme };
      });
    },
  };
});
