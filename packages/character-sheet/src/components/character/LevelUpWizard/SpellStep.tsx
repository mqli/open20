// SpellStep.tsx (T-213)
// Spell selection step for level-up wizard. Shown when the class has spellcasting
// and the new level grants new known spells (known casters and spellbook casters).
// Uses searchSpells to filter by class + level, click-to-toggle selection.

import { useMemo } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { Text, cn } from '@open20/ui';
import { searchSpells, getClassById } from '@/core/content-resolver';
import type { Spell, SpellFilter, SpellLevel } from 'open20-core';

// ── Props ──

export interface SpellStepProps {
  /** Class to filter spells for. */
  classId: string;
  /** The new level after level-up. */
  newLevel: number;
  /** Number of leveled spells to pick (0 = skip section). */
  spellsToPick: number;
  /** Currently selected leveled spell IDs. */
  newSpells: string[];
  /** Called when new spells selection changes. */
  onSpellsChange: (ids: string[]) => void;
  className?: string;
}

// ── Spell list sub-component ──

interface SpellListProps {
  spells: Spell[];
  selectedIds: string[];
  maxSelect: number;
  onToggle: (id: string) => void;
}

function SpellList({ spells, selectedIds, maxSelect, onToggle }: SpellListProps) {
  const isFull = selectedIds.length >= maxSelect;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Text variant="labelSm" color="secondary">
          Choose spells
        </Text>
        <Text variant="labelSm" color="secondary">
          {selectedIds.length} / {maxSelect}
        </Text>
      </div>

      <div className="flex max-h-64 flex-col gap-1 overflow-y-auto rounded-md border border-border p-1">
        {spells.length === 0 && (
          <Text variant="bodySm" color="secondary" className="p-2 text-center">
            No spells available
          </Text>
        )}
        {spells.map((spell) => {
          const selected = selectedIds.includes(spell.id);
          const disabled = !selected && isFull;
          return (
            <button
              key={spell.id}
              type="button"
              role="checkbox"
              aria-checked={selected}
              aria-label={`${spell.name}, level ${spell.level} ${spell.school}`}
              disabled={disabled}
              onClick={() => onToggle(spell.id)}
              className={cn(
                'flex items-center gap-2 rounded px-2 py-1.5 text-left transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
                'disabled:cursor-not-allowed disabled:opacity-40',
                selected ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-bg-tertiary',
              )}
            >
              {/* Check icon (NFR-01) */}
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center rounded border',
                  selected ? 'border-primary-600 bg-primary-600' : 'border-border',
                )}
              >
                {selected && <Check className="h-3 w-3 text-white" aria-hidden="true" />}
              </span>
              <div className="min-w-0 flex-1">
                <Text as="span" variant="bodySm" weight="bold" className="block truncate">
                  {spell.name}
                </Text>
              </div>
              <Text as="span" variant="labelSm" color="secondary" className="shrink-0">
                Lv{spell.level}
              </Text>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ──

export function SpellStep({
  classId,
  newLevel,
  spellsToPick,
  newSpells,
  onSpellsChange,
  className,
}: SpellStepProps) {
  // Derive max spell level from the class's spellSlotsByLevel at newLevel.
  const maxSpellLevel = useMemo((): number => {
    const klass = getClassById(classId);
    if (!klass?.spellSlotsByLevel) return 0;
    const slots = klass.spellSlotsByLevel[newLevel];
    if (!slots) return 0;
    // Find the highest spell level with at least one slot
    let max = 0;
    for (let i = slots.length - 1; i >= 0; i--) {
      if (slots[i]! > 0) {
        max = i + 1;
        break;
      }
    }
    return max;
  }, [classId, newLevel]);

  // Spells on the class list at level 1 through maxSpellLevel.
  const spellLevels: SpellLevel[] = useMemo(
    () => Array.from({ length: maxSpellLevel }, (_, i) => (i + 1) as SpellLevel),
    [maxSpellLevel],
  );
  const spellFilter: SpellFilter = useMemo(
    () => ({ class: [classId], level: spellLevels }),
    [classId, spellLevels],
  );
  const leveledSpells = useMemo(
    () => (spellsToPick > 0 ? searchSpells(spellFilter) : []),
    [spellFilter, spellsToPick],
  );

  function handleSpellToggle(id: string) {
    if (newSpells.includes(id)) {
      onSpellsChange(newSpells.filter((s) => s !== id));
    } else if (newSpells.length < spellsToPick) {
      onSpellsChange([...newSpells, id]);
    }
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="flex items-center gap-1.5">
        <Sparkles className="h-4 w-4 text-primary-400" aria-hidden="true" />
        <Text variant="labelSm" color="secondary">
          Spell Selection
        </Text>
      </div>

      {spellsToPick > 0 && (
        <SpellList
          spells={leveledSpells}
          selectedIds={newSpells}
          maxSelect={spellsToPick}
          onToggle={handleSpellToggle}
        />
      )}
    </div>
  );
}
