import { useEffect } from 'react';
import {
  I18nProvider,
  TooltipProvider,
  DiceRollOverlay,
  defaultTranslations,
  zhCNTranslations,
} from '@open20/ui';
import { AppShell } from '@/components/layout/AppShell';
import { useCharacterStore } from '@/stores/characterStore';

function LoadingSkeleton() {
  return (
    <div className="flex h-screen flex-col gap-3 p-4" aria-label="Loading character sheet">
      <div className="h-12 animate-pulse rounded-xl border border-border bg-bg-secondary" />
      <div className="h-24 animate-pulse rounded-xl border border-border bg-bg-secondary" />
      <div className="h-32 animate-pulse rounded-xl border border-border bg-bg-secondary" />
      <div className="h-20 animate-pulse rounded-xl border border-border bg-bg-secondary" />
      <div className="h-20 animate-pulse rounded-xl border border-border bg-bg-secondary" />
    </div>
  );
}

export function App() {
  const isLoaded = useCharacterStore((s) => s.isLoaded);
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
      <TooltipProvider>
        {isLoaded ? (
          <>
            <AppShell />
            <DiceRollOverlay />
          </>
        ) : (
          <LoadingSkeleton />
        )}
      </TooltipProvider>
    </I18nProvider>
  );
}
