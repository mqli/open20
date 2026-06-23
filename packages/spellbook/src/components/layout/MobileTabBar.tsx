import { BookOpen, User } from 'lucide-react';
import { Button, Surface, Text } from '@open20/ui';
import { useTranslation } from '@/i18n';
import { useCharacterStore } from '@/stores/characterStore';

export type MobileTab = 'spells' | 'character';

interface MobileTabBarProps {
  activeTab: MobileTab;
  onTabChange: (tab: MobileTab) => void;
}

export function MobileTabBar({ activeTab, onTabChange }: MobileTabBarProps) {
  const t = useTranslation();
  const { activeCharacter } = useCharacterStore();

  return (
    <Surface variant="default" className="rounded-none border-t shrink-0">
      <div className="flex">
        <Button
          variant="ghost"
          onClick={() => onTabChange('spells')}
          className={`flex-1 flex-col items-center gap-0.5 py-2 rounded-none ${
            activeTab === 'spells'
              ? 'text-primary-500 border-t-2 border-primary-500 -mt-px'
              : 'text-text-tertiary'
          }`}
          data-testid="tab-spells"
        >
          <BookOpen className="w-5 h-5" />
          <Text variant="label" className="text-[10px]">
            {t('spells')}
          </Text>
        </Button>
        <Button
          variant="ghost"
          onClick={() => onTabChange('character')}
          className={`flex-1 flex-col items-center gap-0.5 py-2 rounded-none ${
            activeTab === 'character'
              ? 'text-primary-500 border-t-2 border-primary-500 -mt-px'
              : 'text-text-tertiary'
          }`}
          data-testid="tab-character"
        >
          <User className="w-5 h-5" />
          <Text variant="label" className="text-[10px]">
            {activeCharacter ? activeCharacter.name : t('character')}
          </Text>
        </Button>
      </div>
    </Surface>
  );
}
