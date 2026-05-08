import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores';

export function useLocale() {
  const { t, i18n } = useTranslation();
  const { language, setLanguage } = useSettingsStore();

  const changeLanguage = async (lang: 'en' | 'zh') => {
    await i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  return {
    t,
    language,
    changeLanguage,
    isEnglish: language === 'en',
    isChinese: language === 'zh',
  };
}
