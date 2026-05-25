import { useSpellStore } from '@/stores/spell-store';
import { Button } from '@/components/ui/Button';

const LEVELS = [
  { value: null, label: 'All' },
  { value: 0, label: 'Cantrip' },
  { value: 1, label: 'L1' },
  { value: 2, label: 'L2' },
  { value: 3, label: 'L3' },
  { value: 4, label: 'L4' },
  { value: 5, label: 'L5' },
  { value: 6, label: 'L6' },
  { value: 7, label: 'L7' },
  { value: 8, label: 'L8' },
  { value: 9, label: 'L9' },
];

export function LevelTabs() {
  const { selectedLevel, setSelectedLevel } = useSpellStore();

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
