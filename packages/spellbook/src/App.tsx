import { useEffect } from 'react';
import { useUIStore } from './stores/uiStore';
import { SpellLibraryLayout } from './components/layout/SpellLibraryLayout';
import { DiceRollOverlay } from './components/dice/DiceRollOverlay';
import { PwaReloadPrompt } from './components/PwaReloadPrompt';
import { I18nProvider } from '@open20/ui';
import { enTranslations, zhCNTranslations } from '@/i18n';
import { storageService } from '@/core/storage-service';

export function App() {
  const { theme } = useUIStore();
  const { language } = storageService.loadPreferences();

  // Get initial locale from localStorage or default to 'en'
  const getInitialLocale = () => {
    if (typeof window !== 'undefined') {
      const saved = language;
      if (saved && (saved === 'en' || saved === 'zh-CN')) {
        return saved;
      }
    }
    return 'en';
  };
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [theme]);

  return (
    <I18nProvider
      initialLocale={getInitialLocale()}
      translationsSet={{
        en: enTranslations,
        'zh-CN': zhCNTranslations,
      }}
    >
      <SpellLibraryLayout />
      <DiceRollOverlay />
      <PwaReloadPrompt />
    </I18nProvider>
  );
}
