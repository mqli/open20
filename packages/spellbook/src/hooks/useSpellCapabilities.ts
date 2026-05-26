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

  // Derived stats
  spellAttackBonus: number;
  preparedCount: number;
  maxPrepared: number;
}

interface ConcentrationCondition {
  id: string;
  source?: string;
}

export function useSpellCapabilities(spell: Spell | null | undefined): SpellCapabilities {
  const { activeCharacter } = useCharacterStore();

  return useMemo(() => {
    const character = activeCharacter;
    const empty: SpellCapabilities = {
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
      preparedCount: 0,
      maxPrepared: 0,
    };

    if (!character || !spell) return empty;

    // ── matching class IDs ──
    const matchingClassIds = (character.classes?.map(c => c.classId) ?? [])
      .filter(id => spell.classes?.includes(id) ?? false);

    // ── prepared / always prepared / cantripKnown ──
    const alwaysPreparedClassIds = matchingClassIds.filter(classId => {
      const classData = character.spells.classSpellcasting[classId];
      return classData?.alwaysPreparedSpells?.includes(spell.id) ?? false;
    });

    const preparedClassIds = matchingClassIds.filter(classId => {
      const classData = character.spells.classSpellcasting[classId];
      const isPrepared = classData?.preparedSpells?.includes(spell.id) ?? false;
      const isAlwaysPrepared = classData?.alwaysPreparedSpells?.includes(spell.id) ?? false;
      return isPrepared || isAlwaysPrepared;
    });

    const cantripKnownClassIds = spell.level === 0
      ? matchingClassIds.filter(classId => {
          const classData = character.spells.classSpellcasting[classId];
          return classData?.knownCantrips?.includes(spell.id) ?? false;
        })
      : [];

    const isKnown = spellService.isSpellKnown(character, spell.id);
    const isPrepared = spellService.isSpellPrepared(character, spell.id);
    const isCantripKnown = cantripKnownClassIds.length > 0;
    const isClassSpell = spellService.isSpellForCharacter(character, spell);
    const isConcentratingOnThis = character.conditions.some(
      c => c.id === 'Concentrating' && (c as ConcentrationCondition).source === spell.id
    );

    // ── caster type ──
    const casterType = getCasterType(character);

    const classSpellcasting = character.spells.classSpellcasting;
    const primaryClassId = Object.keys(classSpellcasting)[0] ?? null;
    const statsClassId = matchingClassIds[0] ?? primaryClassId;

    // ── prepare count ──
    let preparedCount = 0;
    let maxPrepared = 0;
    if (statsClassId && classSpellcasting[statsClassId]) {
      const classData = classSpellcasting[statsClassId];
      if (isClassSpell) {
        preparedCount = (classData.preparedSpells?.length ?? 0) + (classData.alwaysPreparedSpells?.length ?? 0);
        maxPrepared = classData.maxPrepared ?? 0;
      }
    }

    // ── spell attack bonus ──
    const spellAttackBonus = statsClassId
      ? classSpellcasting[statsClassId]?.spellAttackBonus ?? 0
      : 0;

    // ── slots ──
    const isWarlock = character.classes?.some(c => c.classId === 'Warlock') ?? false;
    const pactMagic = character.spells.pactMagicSlots;
    const spellSlots = character.spells.spellSlots;

    const hasRegularSlot =
      spell.level === 0 || (spellSlots[spell.level]?.total ?? 0) > (spellSlots[spell.level]?.used ?? 0);
    const hasPactSlot = !!(
      isWarlock && pactMagic && pactMagic.used < pactMagic.total && spell.level <= pactMagic.level
    );

    // ── knows (spellbook-caster-aware) ──
    const knows = casterType.isSpellbookCaster ? isKnown : true;

    // Character must be high enough level to access this spell level (slots exist at all)
    const canAccessSpellLevel = spell.level === 0
      || (spellSlots[spell.level]?.total ?? 0) > 0
      || !!(pactMagic && spell.level <= pactMagic.level);

    // ── canCast ──
    const canCast = isClassSpell && (knows || spell.level === 0) && (spell.level === 0 || isPrepared) && (
      hasRegularSlot || hasPactSlot
    );

    // ── button visibility ──
    const showPrepareButton = isClassSpell && casterType.canPrepare && spell.level > 0 && knows && canAccessSpellLevel;
    // Learn toggle: cantrips for all casters, regular spells only for spellbook casters
    // Spellbook casters also need high enough level to learn spells of this level
    const showLearnButton = isClassSpell && spell.level > 0 && casterType.canLearn && canAccessSpellLevel;
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
      preparedCount,
      maxPrepared,
    };
  }, [activeCharacter, spell]);
}
