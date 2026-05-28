import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { I18nProvider } from '@open20/ui';
import { SpellbookI18nProvider } from './i18n';
import '@open20/ui/styles.css';
import { App } from './App.tsx';

// Get initial locale from localStorage or default to 'en'
const getInitialLocale = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('open20-locale');
    if (saved && (saved === 'en' || saved === 'zh-CN')) {
      return saved;
    }
  }
  return 'en';
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <SpellbookI18nProvider initialLocale={getInitialLocale()}>
        <App />
      </SpellbookI18nProvider>
    </I18nProvider>
  </StrictMode>,
);
