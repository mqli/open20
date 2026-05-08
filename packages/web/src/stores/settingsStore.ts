import { create } from 'zustand';
import type { AppSettings } from '@/lib/providers';
import { getAppContext } from '@/contexts';

interface SettingsState extends AppSettings {
  loadSettings: () => Promise<void>;
  setTheme: (theme: AppSettings['theme']) => void;
  setLanguage: (language: AppSettings['language']) => void;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: 'dark',
  language: 'en',

  loadSettings: async () => {
    const { storage } = getAppContext();
    const settings = await storage.loadSettings();
    if (settings) {
      set(settings);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      set({ theme: prefersDark ? 'dark' : 'light' });
    }
  },

  setTheme: async (theme) => {
    set({ theme });

    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }

    const { storage } = getAppContext();
    const state = get();
    await storage.saveSettings({ theme, language: state.language });
  },

  setLanguage: async (language) => {
    set({ language });

    const { storage } = getAppContext();
    const state = get();
    await storage.saveSettings({ theme: state.theme, language });
  },
}));
