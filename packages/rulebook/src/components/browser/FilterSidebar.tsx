import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useBrowserStore } from '../../stores/browserStore';
import type { SpellSchool } from '@open20/content/types';

const SPELL_SCHOOLS: SpellSchool[] = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
];

const LEVELS = [
  { label: 'Cantrip', value: 0 },
  { label: '1st', value: 1 },
  { label: '2nd', value: 2 },
  { label: '3rd', value: 3 },
  { label: '4th+', value: 4 },
];

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
}

function CollapsibleSection({ title, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full mb-2 text-left"
      >
        <span className="font-medium text-sm">{title}</span>
        {isOpen ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {isOpen && <div className="space-y-2">{children}</div>}
    </div>
  );
}

export function FilterSidebar() {
  const { filters, setFilter, clearFilters } = useBrowserStore();

  const hasActiveFilters = Object.keys(filters).some(
    (key) => filters[key as keyof typeof filters] !== undefined,
  );

  const handleSourceChange = (source: string) => {
    // 切换选择：如果已选择则清除，否则设置
    const currentSource = filters.source;
    setFilter('source', currentSource === source ? undefined : source);
  };

  const handleLevelChange = (level: number) => {
    // 如果选择 4th+，设置 levelRange
    if (level >= 4) {
      const currentRange = filters.levelRange;
      if (currentRange && currentRange.min === 4) {
        setFilter('levelRange', undefined);
      } else {
        setFilter('levelRange', { min: 4, max: 9 });
      }
    } else {
      // 单个等级选择
      const currentLevel = filters.level;
      setFilter('level', currentLevel === level ? undefined : level);
    }
  };

  const handleSchoolChange = (school: SpellSchool) => {
    const currentSchool = filters.school;
    setFilter('school', currentSchool === school ? undefined : school);
  };

  const isLevelSelected = (level: number) => {
    if (level >= 4) {
      return filters.levelRange !== undefined && filters.levelRange.min === 4;
    }
    return filters.level === level;
  };

  return (
    <div className="w-64 border-r border-border p-4 overflow-y-auto bg-surface-secondary">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-sm">Filters</h3>
        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-xs text-primary hover:underline">
            Clear All
          </button>
        )}
      </div>

      {/* Source Filter */}
      <CollapsibleSection title="Source">
        <div className="space-y-1">
          {['SRD', 'Homebrew'].map((source) => (
            <label
              key={source}
              className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded"
            >
              <input
                type="radio"
                name="source"
                checked={filters.source === source}
                onChange={() => handleSourceChange(source)}
                className="cursor-pointer"
              />
              <span>{source}</span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* Level Filter */}
      <CollapsibleSection title="Level">
        <div className="space-y-1">
          {LEVELS.map(({ label, value }) => (
            <label
              key={label}
              className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded"
            >
              <input
                type="checkbox"
                checked={isLevelSelected(value)}
                onChange={() => handleLevelChange(value)}
                className="cursor-pointer"
              />
              <span>{label}</span>
            </label>
          ))}
        </div>
      </CollapsibleSection>

      {/* School Filter */}
      <CollapsibleSection title="School">
        <div className="space-y-1">
          {SPELL_SCHOOLS.map((school) => (
            <label
              key={school}
              className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded"
            >
              <input
                type="radio"
                name="school"
                checked={filters.school === school}
                onChange={() => handleSchoolChange(school)}
                className="cursor-pointer"
              />
              <span className="truncate">{school}</span>
            </label>
          ))}
        </div>
      </CollapsibleSection>
    </div>
  );
}
