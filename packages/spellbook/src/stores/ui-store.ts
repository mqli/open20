import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface UIState {
  theme: Theme;
  isSidebarOpen: boolean;
  isMobile: boolean;
  
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  setMobile: (isMobile: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  theme: (localStorage.getItem('theme') as Theme) || 'dark',
  isSidebarOpen: true,
  isMobile: false,

  setTheme: (theme) => {
    set({ theme });
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  },

  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setMobile: (isMobile) => set({ isMobile }),
}));
