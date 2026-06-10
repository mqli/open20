import { useSpellStore } from '@/stores/spell-store';
import { Button } from '@open20/ui';
import { useTranslation } from '@/i18n';
import { SPELL_LEVELS } from 'open20-core';

export function LevelTabs() {
  const t = useTranslation();
  const { selectedLevel, setSelectedLevel } = useSpellStore();

  const LEVELS = [
    { value: null as number | null, label: t('allLevels') },
    ...SPELL_LEVELS.map((level) => ({
      value: level,
      label: level === 0 ? t('cantrip') : `${t('levelLabel')}`,
    })),
  ];

  return (
    <div className="flex gap-1 overflow-x-auto py-1.5 no-scrollbar">
      {LEVELS.map(({ value, label }) => {
        const isActive = selectedLevel === value;
        return (
          <Button
            key={value}
            variant={isActive ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedLevel(value)}
            className={`level-tab-${value === null ? 'all' : value} shrink-0 rounded-full whitespace-nowrap ${
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
