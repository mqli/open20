import { X } from 'lucide-react';
import { useBrowserStore } from '../../stores/browserStore';

export function ActiveFilterChips() {
  const {
    activeTab,
    spellFilters,
    monsterFilters,
    setSpellFilter,
    setMonsterFilter,
    clearFilters,
  } = useBrowserStore();

  const filters = activeTab === 'spells' ? spellFilters : monsterFilters;
  const setFilter = activeTab === 'spells' ? setSpellFilter : setMonsterFilter;

  const chips: { key: string; label: string }[] = [];

  // Build filter chip list
  if (filters.name) {
    chips.push({ key: 'name', label: `Name: ${filters.name}` });
  }

  if (activeTab === 'spells') {
    if (spellFilters.level !== undefined) {
      const levelLabel =
        spellFilters.level === 0
          ? 'Cantrip'
          : `${spellFilters.level}${getOrdinalSuffix(spellFilters.level)}`;
      chips.push({ key: 'level', label: `Level: ${levelLabel}` });
    }
    if (spellFilters.levelRange) {
      chips.push({
        key: 'levelRange',
        label: `Level: ${spellFilters.levelRange.min}+`,
      });
    }
    if (spellFilters.school) {
      chips.push({ key: 'school', label: `School: ${spellFilters.school}` });
    }
  }

  if (activeTab === 'monsters') {
    if (monsterFilters.type) {
      chips.push({ key: 'type', label: `Type: ${monsterFilters.type}` });
    }
    if (monsterFilters.cr) {
      chips.push({ key: 'cr', label: `CR: ${monsterFilters.cr}` });
    }
    if (monsterFilters.crRange) {
      chips.push({
        key: 'crRange',
        label: `CR: ${monsterFilters.crRange.min}-${monsterFilters.crRange.max}`,
      });
    }
  }

  if (filters.source) {
    chips.push({ key: 'source', label: `Source: ${filters.source}` });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-muted-foreground">Active filters:</span>
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
        >
          {chip.label}
          <button
            onClick={() => {
              setFilter(chip.key as any, undefined);
            }}
            className="hover:bg-secondary/80 rounded p-0.5"
            aria-label={`Remove filter: ${chip.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button onClick={clearFilters} className="text-xs text-primary hover:underline">
        Clear All
      </button>
    </div>
  );
}

function getOrdinalSuffix(num: number): string {
  if (num === 1) return 'st';
  if (num === 2) return 'nd';
  if (num === 3) return 'rd';
  return 'th';
}
