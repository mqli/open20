import { useSpellStore } from '@/stores/spell-store';
import { Button } from '@open20/ui';
import { useSpellbookTranslation } from '@/i18n';

export function LevelTabs() {
  const t = useSpellbookTranslation();
  const { selectedLevel, setSelectedLevel } = useSpellStore();

  const LEVELS = [
    { value: null, label: t('allLevels') },
    { value: 0, label: t('cantrip') },
    { value: 1, label: `${t('levelLabel')} 1` },
    { value: 2, label: `${t('levelLabel')} 2` },
    { value: 3, label: `${t('levelLabel')} 3` },
    { value: 4, label: `${t('levelLabel')} 4` },
    { value: 5, label: `${t('levelLabel')} 5` },
    { value: 6, label: `${t('levelLabel')} 6` },
    { value: 7, label: `${t('levelLabel')} 7` },
    { value: 8, label: `${t('levelLabel')} 8` },
    { value: 9, label: `${t('levelLabel')} 9` },
  ];

  return (
    <div className="flex gap-1 overflow-x-auto py-1.5 no-scrollbar">
      {LEVELS.map(({ value, label }) => {
        const isActive = selectedLevel === value;
        return (
          <Button
            key={label}
            variant={isActive ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedLevel(value)}
            className={`flex-shrink-0 rounded-full whitespace-nowrap ${
              isActive ? 'shadow-sm' : 'border border-border'
            }`}
          >
            {label}
          </Button>
        );
      })}
    </div>
  );
}
