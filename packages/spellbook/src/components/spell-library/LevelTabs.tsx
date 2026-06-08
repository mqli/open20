import { useSpellStore } from '@/stores/spell-store';
import { Button } from '@open20/ui';
import { useTranslation } from '@/i18n';

export function LevelTabs() {
  const t = useTranslation();
  const { selectedLevel, setSelectedLevel } = useSpellStore();

  const LEVELS = [
    { value: null, label: t('allLevels') },
    { value: 0, label: t('cantrip') },
    { value: 1, label: `${t('levelLabel')}` },
    { value: 2, label: `${t('levelLabel')}` },
    { value: 3, label: `${t('levelLabel')}` },
    { value: 4, label: `${t('levelLabel')}` },
    { value: 5, label: `${t('levelLabel')}` },
    { value: 6, label: `${t('levelLabel')}` },
    { value: 7, label: `${t('levelLabel')}` },
    { value: 8, label: `${t('levelLabel')}` },
    { value: 9, label: `${t('levelLabel')}` },
  ];

  return (
    <div className="flex gap-1 overflow-x-auto py-1.5 no-scrollbar">
      {LEVELS.map(({ value, label }) => {
        const isActive = selectedLevel === value;
        return (
          <Button
            key={value}
            data-testid={value === null ? 'level-tab-all' : `level-tab-${value}`}
            variant={isActive ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedLevel(value)}
            className={`shrink-0 rounded-full whitespace-nowrap ${
              isActive ? 'shadow-sm' : 'border border-border'
            }`}
          >
            {value && value > 0 ? (
              <>
                <span className="hidden sm:inline mr-1">{label}</span>
                {`${value}`}
              </>
            ) : (
              <>{label}</>
            )}
          </Button>
        );
      })}
    </div>
  );
}
