import { useMemo } from 'react';
import { calculateSpellSlots, type Spell, type SpellLevel } from 'open20-core';
import {
  getCasterType,
  getMatchingClassIds,
  getSpellClassStates,
  getAvailableSlots,
  canCastSpellWithSlots,
  getBestSpellAttackBonus,
  pickBestClassId,
  knowsSpell,
  isSpellPrepared,
} from 'open20-core/spells';
import { useCharacterStore } from '@/stores/characterStore';
import { resolveDeps } from '@/core/content-resolver';

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
  /** Subset of matchingClassIds whose individual class level can access this spell level */
  accessibleClassIds: string[];
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
  accessibleClassIds: [],
  preparedClassIds: [],
  alwaysPreparedClassIds: [],
  cantripKnownClassIds: [],
  spellAttackBonus: 0,
};

export function useSpellCapabilities(spell: Spell | null | undefined): SpellCapabilities {
  const { activeCharacter } = useCharacterStore();

  return useMemo(() => {
    if (!activeCharacter || !spell) return EMPTY_CAPABILITIES;

    const char = activeCharacter;
    const deps = resolveDeps(char);

    // ── caster type ──
    const casterType = getCasterType(char, deps);

    // ── matching class IDs ──
    const matchingClassIds = getMatchingClassIds(char, spell);

    // ── spell class states (replaces 3 separate filters) ──
    const classStates = getSpellClassStates(char, spell.id);
    const preparedClassIds = classStates
      .filter((s) => s.isPrepared || s.isAlwaysPrepared)
      .map((s) => s.classId);
    const alwaysPreparedClassIds = classStates
      .filter((s) => s.isAlwaysPrepared)
      .map((s) => s.classId);
    const cantripKnownClassIds = classStates.filter((s) => s.isCantripKnown).map((s) => s.classId);

    // ── basic status ──
    const isKnown = knowsSpell(char, spell.id);
    const isPrepared = isSpellPrepared(char, spell.id);
    const isCantripKnown = cantripKnownClassIds.length > 0;
    const isClassSpell = matchingClassIds.length > 0;
    const isConcentratingOnThis = char.concentration?.spellId === spell.id;

    // ── knows (spellbook-caster-aware) ──
    // For spellbook casters (Wizard), must have learned the spell.
    // For other casters (Cleric, Druid, etc.), all class spells are "known".
    const knows = casterType.isSpellbookCaster ? isKnown : true;

    // ── slots ──
    const slotInfo = getAvailableSlots(char, spell.level as SpellLevel);
    const hasRegularSlot = slotInfo.hasRegularSlot;
    const hasPactSlot = slotInfo.hasPactSlot;
    const isWarlock = (char.classes ?? []).some((c) => c.classId === 'Warlock');

    // ── canCast (enhanced: checks slots) ──
    const canCast = canCastSpellWithSlots(char, spell);

    // ── spell attack bonus ──
    const statsClassId = pickBestClassId(char, matchingClassIds);
    const spellAttackBonus = statsClassId
      ? (char.spells.classSpellcasting[statsClassId]?.spellAttackBonus ?? 0)
      : getBestSpellAttackBonus(char);

    // ── button visibility ──
    // Character must be high enough level to access this spell level.
    // For multiclass: each class can only prepare/learn spells up to the level
    // that the individual class level supports, regardless of combined spell slots.
    const canAccessSpellLevel =
      spell.level === 0 ||
      matchingClassIds.some((classId) => {
        const charClass = char.classes.find((c) => c.classId === classId);
        if (!charClass) return false;
        const classSlots = calculateSpellSlots(classId, charClass.level, deps.classes ?? {});
        return (classSlots[spell.level]?.total ?? 0) > 0;
      });

    // Filter matchingClassIds to only those whose individual class level can access this spell level.
    // E.g., Cleric 5 / Wizard 1: a 3rd-level spell on both lists would have accessibleClassIds = ['Cleric']
    const accessibleClassIds =
      spell.level === 0
        ? matchingClassIds
        : matchingClassIds.filter((classId) => {
            const charClass = char.classes.find((c) => c.classId === classId);
            if (!charClass) return false;
            const classSlots = calculateSpellSlots(classId, charClass.level, deps.classes ?? {});
            return (classSlots[spell.level]?.total ?? 0) > 0;
          });

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
      accessibleClassIds,
      preparedClassIds,
      alwaysPreparedClassIds,
      cantripKnownClassIds,
      spellAttackBonus,
    };
  }, [activeCharacter, spell]);
}
