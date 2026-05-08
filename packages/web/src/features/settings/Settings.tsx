import { useLocale } from '@/hooks';
import { useSettingsStore } from '@/stores';
import { Moon, Sun, Monitor } from 'lucide-react';
import { PageLayout, Section } from '@/components/layout';

export function Settings() {
  const { t, language, changeLanguage } = useLocale();
  const { theme, setTheme } = useSettingsStore();

  const themes = [
    { id: 'dark', label: t('settings.dark'), icon: Moon },
    { id: 'light', label: t('settings.light'), icon: Sun },
    { id: 'auto', label: t('settings.auto'), icon: Monitor },
  ] as const;

  const languages = [
    { id: 'en', label: 'English' },
    { id: 'zh', label: '中文' },
  ] as const;

  return (
    <PageLayout title={t('settings.title')} backTo="/game">
      {/* Appearance */}
      <Section title={t('settings.appearance')}>
        <div className="space-y-2">
          <label className="text-sm text-[--color-text-secondary]">{t('settings.theme')}</label>
          <div className="flex gap-2">
            {themes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setTheme(item.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border transition-colors ${
                    theme === item.id
                      ? 'border-[--color-accent-gold] bg-[--color-accent-gold]/10 text-[--color-accent-gold]'
                      : 'border-[--color-border] hover:bg-[--color-bg-elevated]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      {/* Language */}
      <Section title={t('settings.language')}>
        <div className="space-y-2">
          <div className="flex gap-2">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => changeLanguage(lang.id)}
                className={`flex-1 py-3 rounded-lg border transition-colors ${
                  language === lang.id
                    ? 'border-[--color-accent-gold] bg-[--color-accent-gold]/10 text-[--color-accent-gold]'
                    : 'border-[--color-border] hover:bg-[--color-bg-elevated]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* About */}
      <Section title={t('settings.about')}>
        <div className="space-y-2">
          <h3 className="font-semibold">DND 2024 Character Sheet</h3>
          <p className="text-sm text-[--color-text-secondary]">
            {t('settings.version')}: 0.1.0 (MVP)
          </p>
        </div>
      </Section>
    </PageLayout>
  );
}
