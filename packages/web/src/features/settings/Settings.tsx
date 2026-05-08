import { useLocale } from '@/hooks';
import { useSettingsStore } from '@/stores';
import { Button, Card } from '@/components/ui';
import { Moon, Sun, Monitor, Globe, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className="min-h-screen bg-[--color-bg-primary] text-[--color-text-primary]">
      {/* Header */}
      <header className="p-4 border-b border-[--color-border] w-full">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Link to="/game">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">{t('settings.title')}</h1>
        </div>
      </header>

      <main className="p-4 w-full max-w-2xl mx-auto space-y-6">
        {/* Appearance */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[--color-text-secondary] uppercase tracking-wide">
            {t('settings.appearance')}
          </h2>
          <Card>
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
          </Card>
        </section>

        {/* Language */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[--color-text-secondary] uppercase tracking-wide">
            {t('settings.language')}
          </h2>
          <Card>
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
          </Card>
        </section>

        {/* About */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-[--color-text-secondary] uppercase tracking-wide">
            {t('settings.about')}
          </h2>
          <Card>
            <div className="space-y-2">
              <h3 className="font-semibold">DND 2024 Character Sheet</h3>
              <p className="text-sm text-[--color-text-secondary]">
                {t('settings.version')}: 0.1.0 (MVP)
              </p>
            </div>
          </Card>
        </section>
      </main>
    </div>
  );
}
