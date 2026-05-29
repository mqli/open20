import { useI18n } from '@open20/ui';
import { Button } from '@open20/ui';
import { Globe } from 'lucide-react';
import { storageService } from '@/core/storage-service';

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();
  const toggleLanguage = () => {
    const newLocale = locale === 'en' ? 'zh-CN' : 'en';
    setLocale(newLocale);
    // Persist locale preference
    storageService.savePreferences({ language: newLocale });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="text-text-tertiary hover:text-primary-600 h-7 px-1.5"
      title={locale === 'en' ? 'Switch to Chinese' : '切换到英文'}
    >
      <Globe className="w-3.5 h-3.5 md:mr-1" />
      <span className="hidden md:inline text-xs font-medium">
        {locale === 'en' ? '中文' : 'EN'}
      </span>
    </Button>
  );
}
