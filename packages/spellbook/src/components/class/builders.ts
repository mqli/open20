import type { Class, Subclass, Spellcasting, AbilityName } from 'open20-core';
import type { SlotProgressionPreset } from '@/core/slot-presets';

export const ABILITIES: AbilityName[] = [
  'Strength',
  'Dexterity',
  'Constitution',
  'Intelligence',
  'Wisdom',
  'Charisma',
];

/** Generate an id-friendly slug from a display name. */
export function toSlug(name: string): string {
  return name
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase();
}

/** Build a minimal Class object from form state. */
export function buildClass(
  name: string,
  preset: SlotProgressionPreset,
  ability: AbilityName,
  knownSource: 'class_list' | 'spellbook',
  preparationTiming: 'long_rest' | 'level_up',
): Class {
  const classId = toSlug(name) || 'custom';
  const spellcasting: Spellcasting = preset.spellcasting.pactMagic
    ? {
        ability,
        knownSource,
        preparationTiming,
        changesPerPreparation: 'all',
        pactMagic: true,
        pactMagicSlots: preset.spellcasting.pactMagicSlots,
      }
    : {
        ability,
        knownSource,
        preparationTiming,
        changesPerPreparation: 'all',
      };

  const featuresByLevel = Array.from({ length: 20 }, (_, i) => {
    const lvl = i + 1;
    return {
      level: lvl,
      cantripsKnown: preset.cantripsByLevel[lvl] ?? 0,
      preparedSpells: preset.preparedByLevel[lvl] ?? 0,
      features: [],
    };
  });

  return {
    id: classId,
    name,
    source: 'Homebrew',
    hitDie: 'd8',
    savingThrowProficiencies: [],
    armorTraining: [],
    weaponProficiencies: [],
    weaponMastery: false,
    featuresByLevel,
    spellcasting,
    spellSlotsByLevel: preset.spellSlotsByLevel as Readonly<Record<number, ReadonlyArray<number>>>,
  };
}

/** Build a Subclass from form data. Uses the existing id from form state. */
export function buildSubclass(
  id: string,
  parentClassId: string,
  alwaysPrepared: { level: number; spells: string[] }[],
): Subclass {
  return {
    id,
    parentClass: parentClassId,
    grantedAtLevel: 1,
    featuresByLevel: [],
    alwaysPreparedSpells:
      alwaysPrepared.length > 0
        ? alwaysPrepared.map((e) => ({ level: e.level, spells: e.spells as readonly string[] }))
        : undefined,
    source: 'Homebrew',
  };
}
