import { Palette } from 'lucide-react';
import { IconButton } from '../IconButton';
import { useTranslation } from '../../i18n';

export interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const t = useTranslation();

  return (
    <IconButton
      size="sm"
      onClick={onToggle}
      title={theme === 'light' ? t('themeToggle.switchToDark') : t('themeToggle.switchToLight')}
      className="text-text-secondary hover:text-primary-600"
    >
      <Palette className="w-3.5 h-3.5" />
    </IconButton>
  );
}
