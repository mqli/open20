import { Palette } from 'lucide-react';
import { IconButton } from '../IconButton';

export interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <IconButton
      size="sm"
      onClick={onToggle}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      className="text-text-secondary hover:text-primary-600"
    >
      <Palette className="w-3.5 h-3.5" />
    </IconButton>
  );
}
