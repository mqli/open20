import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useBrowserStore } from '../../stores/browserStore';
import type { SpellSchool } from '@open20/content/types';
import type { MonsterType } from 'open20-core';

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

const MONSTER_TYPES: MonsterType[] = [
  'Aberration',
  'Beast',
  'Celestial',
  'Construct',
  'Dragon',
  'Elemental',
  'Fey',
  'Fiend',
  'Giant',
  'Humanoid',
  'Monstrosity',
  'Ooze',
  'Plant',
  'Undead',
];

const LEVELS = [
  { label: 'Cantrip', value: 0 },
  { label: '1st', value: 1 },
  { label: '2nd', value: 2 },
  { label: '3rd', value: 3 },
  { label: '4th+', value: 4 },
];

const CR_RANGES = [
  { label: '0-4', min: 0, max: 4 },
  { label: '5-10', min: 5, max: 10 },
  { label: '11-16', min: 11, max: 16 },
  { label: '17-20', min: 17, max: 20 },
  { label: '21-30', min: 21, max: 30 },
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
  const {
    activeTab,
    spellFilters,
    monsterFilters,
    setSpellFilter,
    setMonsterFilter,
    clearFilters,
  } = useBrowserStore();

  const filters = activeTab === 'spells' ? spellFilters : monsterFilters;

  const hasActiveFilters = Object.keys(filters).some(
    (key) => filters[key as keyof typeof filters] !== undefined,
  );

  const handleSourceChange = (source: string) => {
    const currentSource = filters.source;
    if (activeTab === 'spells') {
      setSpellFilter('source', currentSource === source ? undefined : source);
    } else {
      setMonsterFilter('source', currentSource === source ? undefined : source);
    }
  };

  const handleLevelChange = (level: number) => {
    if (level >= 4) {
      const currentRange = (filters as { levelRange?: { min: number; max: number } }).levelRange;
      if (currentRange && currentRange.min === 4) {
        setSpellFilter('levelRange', undefined);
      } else {
        setSpellFilter('levelRange', { min: 4, max: 9 });
        setSpellFilter('level', undefined);
      }
    } else {
      const currentLevel = (filters as { level?: number }).level;
      setSpellFilter('level', currentLevel === level ? undefined : level);
    }
  };

  const handleSchoolChange = (school: SpellSchool) => {
    const currentSchool = (filters as { school?: SpellSchool }).school;
    setSpellFilter('school', currentSchool === school ? undefined : school);
  };

  const handleTypeChange = (type: string) => {
    const currentType = (monsterFilters as { type?: string }).type;
    setMonsterFilter('type', currentType === type ? undefined : type);
  };

  const handleCRRangeChange = (min: number, max: number) => {
    const currentRange = monsterFilters.crRange;
    if (currentRange && currentRange.min === min) {
      setMonsterFilter('crRange', undefined);
    } else {
      setMonsterFilter('crRange', { min, max });
      setMonsterFilter('cr', undefined);
    }
  };

  const isLevelSelected = (level: number) => {
    if (level >= 4) {
      return spellFilters.levelRange !== undefined && spellFilters.levelRange.min === 4;
    }
    return spellFilters.level === level;
  };

  const isCRRangeSelected = (min: number) => {
    return monsterFilters.crRange !== undefined && monsterFilters.crRange.min === min;
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

      {/* Source Filter (shared) */}
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

      {/* Spell-specific filters */}
      {activeTab === 'spells' && (
        <>
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
                    checked={spellFilters.school === school}
                    onChange={() => handleSchoolChange(school)}
                    className="cursor-pointer"
                  />
                  <span className="truncate">{school}</span>
                </label>
              ))}
            </div>
          </CollapsibleSection>
        </>
      )}

      {/* Monster-specific filters */}
      {activeTab === 'monsters' && (
        <>
          {/* Type Filter */}
          <CollapsibleSection title="Type">
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {MONSTER_TYPES.map((type) => (
                <label
                  key={type}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded"
                >
                  <input
                    type="radio"
                    name="monster-type"
                    checked={monsterFilters.type === type}
                    onChange={() => handleTypeChange(type)}
                    className="cursor-pointer"
                  />
                  <span className="truncate">{type}</span>
                </label>
              ))}
            </div>
          </CollapsibleSection>

          {/* CR Range Filter */}
          <CollapsibleSection title="Challenge Rating">
            <div className="space-y-1">
              {CR_RANGES.map(({ label, min, max }) => (
                <label
                  key={label}
                  className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={isCRRangeSelected(min)}
                    onChange={() => handleCRRangeChange(min, max)}
                    className="cursor-pointer"
                  />
                  <span>CR {label}</span>
                </label>
              ))}
            </div>
          </CollapsibleSection>
        </>
      )}
    </div>
  );
}
