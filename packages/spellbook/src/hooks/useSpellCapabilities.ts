import { useMemo } from 'react';
import type { Spell } from 'open20-core';
import { getCasterType } from '@/core/character-service';
import { spellService } from '@/core/spell-service';
import { useCharacterStore } from '@/stores/character-store';

export interface SpellCapabilities {
  // Basic status
  isKnown: boolean;
  isPrepared: boolean;
  isCantripKnown: boolean;
  isClassSpell: boolean;
  isConcentratingOnThis: boolean;

  // Caster type info
  casterType: ReturnType<typeof getCasterType>;

  // Casting capability (spellbook-caster-aware)
  knows: boolean;
  canCast: boolean;

  // Which buttons to show
  showPrepareButton: boolean;
  showLearnButton: boolean;
  showCantripButton: boolean;

  // Slot info
  hasRegularSlot: boolean;
  hasPactSlot: boolean;
  isWarlock: boolean;

  // Class matching (for multi-class dropdowns)
  matchingClassIds: string[];
  preparedClassIds: string[];
  alwaysPreparedClassIds: string[];
  cantripKnownClassIds: string[];

  // Derived stats (for single-class; multiclass uses per-class in UI components)
  spellAttackBonus: number;
}

// Module-level constant to avoid re-creating on every memo invalidation
const EMPTY_CAPABILITIES: SpellCapabilities = {
  isKnown: false,
  isPrepared: false,
  isCantripKnown: false,
  isClassSpell: false,
  isConcentratingOnThis: false,
  casterType: { canLearn: false, canPrepare: false, isSpellbookCaster: false },
  knows: false,
  canCast: false,
  showPrepareButton: false,
  showLearnButton: false,
  showCantripButton: false,
  hasRegularSlot: false,
  hasPactSlot: false,
  isWarlock: false,
  matchingClassIds: [],
  preparedClassIds: [],
  alwaysPreparedClassIds: [],
  cantripKnownClassIds: [],
  spellAttackBonus: 0,
};

export function useSpellCapabilities(spell: Spell | null | undefined): SpellCapabilities {
  const { activeCharacter } = useCharacterStore();

  return useMemo(() => {
    if (!activeCharacter || !spell) return EMPTY_CAPABILITIES;

    const character = activeCharacter;

    // ── matching class IDs ──
    const matchingClassIds = (character.classes?.map((c) => c.classId) ?? []).filter(
      (id) => spell.classes?.includes(id) ?? false,
    );

    // ── prepared / always prepared / cantripKnown ──
    const alwaysPreparedClassIds = matchingClassIds.filter((classId) => {
      const classData = character.spells.classSpellcasting[classId];
      return classData?.alwaysPreparedSpells?.includes(spell.id) ?? false;
    });

    const preparedClassIds = matchingClassIds.filter((classId) => {
      const classData = character.spells.classSpellcasting[classId];
      const isPrepared = classData?.preparedSpells?.includes(spell.id) ?? false;
      const isAlwaysPrepared = classData?.alwaysPreparedSpells?.includes(spell.id) ?? false;
      return isPrepared || isAlwaysPrepared;
    });

    const cantripKnownClassIds =
      spell.level === 0
        ? matchingClassIds.filter((classId) => {
            const classData = character.spells.classSpellcasting[classId];
            return classData?.knownCantrips?.includes(spell.id) ?? false;
          })
        : [];

    const isKnown = spellService.isSpellKnown(character, spell.id);
    const isPrepared = spellService.isSpellPrepared(character, spell.id);
    const isCantripKnown = cantripKnownClassIds.length > 0;
    const isClassSpell = spellService.isSpellForCharacter(character, spell);
    const isConcentratingOnThis = character.concentration?.spellId === spell.id;

    // ── caster type ──
    const casterType = getCasterType(character);

    const classSpellcasting = character.spells.classSpellcasting;
    const primaryClassId = Object.keys(classSpellcasting)[0] ?? null;

    // ── statsClassId: pick best class for display purposes ──
    // For single-class or single-match: use that class.
    // For multiclass matching multiple classes: pick the one with highest spellAttackBonus
    // (reasonable heuristic; true D&D 5e multiclass would let the player choose).
    const statsClassId = (() => {
      if (matchingClassIds.length === 0) return primaryClassId;
      if (matchingClassIds.length === 1) return matchingClassIds[0];
      // Multiple matches: pick highest spellAttackBonus
      return matchingClassIds.reduce((best, id) => {
        const bestBonus = classSpellcasting[best]?.spellAttackBonus ?? -Infinity;
        const currentBonus = classSpellcasting[id]?.spellAttackBonus ?? -Infinity;
        return currentBonus > bestBonus ? id : best;
      }, matchingClassIds[0]);
    })();

    // ── spell attack bonus ──
    const spellAttackBonus = statsClassId
      ? (classSpellcasting[statsClassId]?.spellAttackBonus ?? 0)
      : 0;

    // ── slots ──
    const isWarlock = character.classes?.some((c) => c.classId === 'Warlock') ?? false;
    const pactMagic = character.spells.pactMagicSlots;
    const spellSlots = character.spells.spellSlots;

    // Cantrips never consume slots — hasRegularSlot is only meaningful for leveled spells.
    // For UI indicators, treat cantrips as always having a "slot".
    const hasRegularSlot =
      spell.level === 0 ||
      (spellSlots[spell.level]?.total ?? 0) > (spellSlots[spell.level]?.used ?? 0);
    const hasPactSlot = !!(
      isWarlock &&
      pactMagic &&
      pactMagic.used < pactMagic.total &&
      spell.level <= pactMagic.level
    );

    // ── knows (spellbook-caster-aware) ──
    // For spellbook casters (Wizard), must have learned the spell.
    // For other casters (Cleric, Druid, etc.), all class spells are "known".
    const knows = casterType.isSpellbookCaster ? isKnown : true;

    // Character must be high enough level to access this spell level (slots exist at all)
    const canAccessSpellLevel =
      spell.level === 0 ||
      (spellSlots[spell.level]?.total ?? 0) > 0 ||
      !!(pactMagic && spell.level <= pactMagic.level);

    // ── canCast ──
    // Cantrips: can cast if isClassSpell (no preparation or slot consumption).
    // Leveled spells: must be prepared (or always prepared) AND have a slot.
    const canCast = (() => {
      if (!isClassSpell) return false;

      if (spell.level === 0) {
        // Cantrips: castable if known (for cantrip-known casters) or automatically for others
        return knows;
      }

      // Leveled spells: must be prepared and have a slot
      return (knows || isPrepared) && (hasRegularSlot || hasPactSlot);
    })();

    // ── button visibility ──
    // Prepare button: show for prepared casters (canPrepare) when the spell is known/accessible.
    // For spellbook casters, must also have learned the spell first.
    const showPrepareButton =
      isClassSpell && casterType.canPrepare && spell.level > 0 && knows && canAccessSpellLevel;
    // Learn toggle: cantrips for all casters, regular spells only for spellbook casters
    // Spellbook casters also need high enough level to learn spells of this level
    const showLearnButton =
      isClassSpell && spell.level > 0 && casterType.canLearn && canAccessSpellLevel;
    const showCantripButton = isClassSpell && spell.level === 0;

    return {
      isKnown,
      isPrepared,
      isCantripKnown,
      isClassSpell,
      isConcentratingOnThis,
      casterType,
      knows,
      canCast,
      showPrepareButton,
      showLearnButton,
      showCantripButton,
      hasRegularSlot,
      hasPactSlot,
      isWarlock,
      matchingClassIds,
      preparedClassIds,
      alwaysPreparedClassIds,
      cantripKnownClassIds,
      spellAttackBonus,
    };
  }, [activeCharacter, spell]);
}
