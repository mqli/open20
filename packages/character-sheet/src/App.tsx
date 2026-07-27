import { useEffect } from 'react';
import { I18nProvider, DiceRollOverlay, defaultTranslations, zhCNTranslations } from '@open20/ui';
import { AppShell } from '@/components/layout/AppShell';
import { useCharacterStore } from '@/stores/characterStore';

export function App() {
  const load = useCharacterStore((s) => s.load);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    load();
  }, [load]);

  return (
    <I18nProvider
      initialLocale="en"
      translationsSet={{ en: defaultTranslations, 'zh-CN': zhCNTranslations }}
    >
      <AppShell />
      <DiceRollOverlay />
    </I18nProvider>
  );
}
