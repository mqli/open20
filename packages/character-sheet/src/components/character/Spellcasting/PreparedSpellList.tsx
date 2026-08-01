// PreparedSpellList.tsx (T-116)
// Lists prepared/known spells grouped by class, with Prepared/Known toggle.

import { useState, useMemo } from 'react';
import { Surface, Text, Toggle, Divider, EmptyState } from '@open20/ui';
import type { AppCharacter } from '@/types';
import type { SpellLevel } from 'open20-core';
import { getSpell, getClassName } from '@/core/content-resolver';
import { PreparedSpellCard } from './PreparedSpellCard';

export interface PreparedSpellListProps {
  character: AppCharacter;
  onCastSpell: (spellId: string, slotLevel: SpellLevel) => void;
}

/** Find the highest available slot level >= the spell's base level. */
function findHighestAvailableSlot(
  spellSlots: Record<number, { total: number; used: number }>,
  baseLevel: number,
): number | null {
  for (let lvl = baseLevel; lvl <= 9; lvl++) {
    const slot = spellSlots[lvl];
    if (slot && slot.used < slot.total) return lvl as SpellLevel;
  }
  return null;
}

export function PreparedSpellList({ character, onCastSpell }: PreparedSpellListProps) {
  const [showPrepared, setShowPrepared] = useState(true);

  const classSpellcasting = useMemo(() => {
    return Object.entries(character.spells.classSpellcasting).map(([classId, data]) => {
      const className = getClassName(classId);
      const spellIds = showPrepared ? data.preparedSpells : data.knownSpells;
      const alwaysPreparedIds = data.alwaysPreparedSpells
        ? Object.values(data.alwaysPreparedSpells).flat()
        : [];

      // Deduplicate: always-prepared spells are already in preparedSpells
      const leveledIds = showPrepared
        ? [...new Set([...alwaysPreparedIds, ...spellIds])]
        : [...spellIds];

      // Cantrips are always available (not part of prepared/known toggle)
      const cantripIds = data.knownCantrips ?? [];

      // Split into cantrips (level 0) and leveled spells
      const resolvedCantrips = cantripIds
        .map((id) => ({ spellId: id, spell: getSpell(id) }))
        .filter(
          (s): s is { spellId: string; spell: NonNullable<ReturnType<typeof getSpell>> } =>
            !!s.spell,
        );

      const resolvedLeveled = leveledIds
        .map((id) => ({ spellId: id, spell: getSpell(id) }))
        .filter(
          (s): s is { spellId: string; spell: NonNullable<ReturnType<typeof getSpell>> } =>
            !!s.spell,
        );

      return { classId, className, cantrips: resolvedCantrips, leveled: resolvedLeveled };
    });
  }, [character.spells.classSpellcasting, showPrepared]);

  // Feature spells (T-217 will expand this)
  const featSpells = useMemo(() => {
    if (!character.spells.featSpells) return [];
    const result: Array<{ spellId: string; spell: NonNullable<ReturnType<typeof getSpell>> }> = [];
    for (const entry of Object.values(character.spells.featSpells)) {
      for (const id of [...entry.cantrips, ...entry.preparedSpells]) {
        const spell = getSpell(id);
        if (spell) result.push({ spellId: id, spell });
      }
    }
    return result;
  }, [character.spells.featSpells]);

  const totalPrepared = classSpellcasting.reduce(
    (sum, c) => sum + c.leveled.length + c.cantrips.length,
    0,
  );
  const totalKnown = classSpellcasting.reduce((sum, c) => {
    const knownCount = c.leveled.length + c.cantrips.length;
    return sum + knownCount;
  }, 0);

  const hasAnySpells =
    classSpellcasting.some((c) => c.cantrips.length > 0 || c.leveled.length > 0) ||
    featSpells.length > 0;

  return (
    <Surface variant="default" padding="sm">
      <div className="flex flex-col gap-2">
        {/* Prepared / Known Toggle */}
        <div className="flex items-center justify-between">
          <Toggle
            pressed={showPrepared}
            onPressedChange={setShowPrepared}
            size="sm"
            aria-label={showPrepared ? 'Showing prepared spells' : 'Showing known spells'}
          >
            {showPrepared ? `Prepared (${totalPrepared})` : `Known (${totalKnown})`}
          </Toggle>
          {!showPrepared && (
            <Text variant="caption" color="secondary">
              {totalKnown} spells known
            </Text>
          )}
        </div>

        {!hasAnySpells ? (
          <EmptyState
            title="No Spells"
            description={
              showPrepared
                ? 'No spells prepared. Prepare spells to cast them.'
                : 'No spells known for this character.'
            }
          />
        ) : (
          <div className="divide-y divide-border">
            {/* Class spellcasting groups */}
            {classSpellcasting.map((group) => {
              const hasCantrips = group.cantrips.length > 0;
              const hasLeveled = group.leveled.length > 0;

              if (!hasCantrips && !hasLeveled) return null;

              return (
                <div key={group.classId}>
                  <Text variant="bodySm" color="secondary" className="px-2 py-1 font-medium">
                    {group.className}
                  </Text>

                  {/* Cantrips subsection */}
                  {hasCantrips && (
                    <>
                      <Text variant="caption" color="secondary" className="px-2 pb-0.5">
                        Cantrips
                      </Text>
                      {group.cantrips.map(({ spellId, spell }) => (
                        <PreparedSpellCard
                          key={spellId}
                          spellId={spellId}
                          spellName={spell.name}
                          spellLevel={spell.level}
                          spellSchool={spell.school}
                          concentration={spell.concentration}
                          ritual={spell.ritual}
                          highestAvailableSlot={0 as SpellLevel}
                          onCast={(slotLevel) => onCastSpell(spellId, slotLevel)}
                        />
                      ))}
                    </>
                  )}

                  {/* Leveled spells */}
                  {hasLeveled && (
                    <>
                      {hasCantrips && <Divider className="my-1" />}
                      {group.leveled.map(({ spellId, spell }) => (
                        <PreparedSpellCard
                          key={spellId}
                          spellId={spellId}
                          spellName={spell.name}
                          spellLevel={spell.level}
                          spellSchool={spell.school}
                          concentration={spell.concentration}
                          ritual={spell.ritual}
                          highestAvailableSlot={
                            findHighestAvailableSlot(
                              character.spells.spellSlots,
                              spell.level,
                            ) as SpellLevel | null
                          }
                          onCast={(slotLevel) => onCastSpell(spellId, slotLevel)}
                        />
                      ))}
                    </>
                  )}
                </div>
              );
            })}

            {/* Feat spells (Magic Initiate, etc.) */}
            {featSpells.length > 0 && (
              <div>
                <Text variant="bodySm" color="secondary" className="px-2 py-1 font-medium">
                  Feat Spells
                </Text>
                {featSpells.map(({ spellId, spell }) => (
                  <PreparedSpellCard
                    key={spellId}
                    spellId={spellId}
                    spellName={spell.name}
                    spellLevel={spell.level}
                    spellSchool={spell.school}
                    concentration={spell.concentration}
                    ritual={spell.ritual}
                    highestAvailableSlot={
                      spell.level === 0
                        ? (0 as SpellLevel)
                        : (findHighestAvailableSlot(
                            character.spells.spellSlots,
                            spell.level,
                          ) as SpellLevel | null)
                    }
                    onCast={(slotLevel) => onCastSpell(spellId, slotLevel)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Surface>
  );
}
