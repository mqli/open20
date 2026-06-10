import {
  createCharacter as open20CreateCharacter,
  prepareSpellForClass as open20PrepareSpellForClass,
  unprepareSpellForClass as open20UnprepareSpellForClass,
  consumeSpellSlot as open20ConsumeSpellSlot,
  recoverSpellSlot as open20RecoverSpellSlot,
  longRest as open20LongRest,
  shortRest as open20ShortRest,
  recomputeDerivedStats as open20Recompute,
  rollSpellAttack,
  rollSpellDamage,
  rollSpellHeal,
  defaultRandom,
  addKnownSpell,
  removeKnownSpell,
  knowsSpell,
  startConcentration as open20StartConcentration,
  endConcentration as open20EndConcentration,
  castSpell as open20CastSpell,
  getModifier,
  getTotalScore,
  type AttackRollResult,
  type DamageRollResult,
  type SpellHealRollResult,
  type DataLoader,
} from 'open20-core';
import {
  getCasterType as coreGetCasterType,
  getCasterTypeForClass as coreGetCasterTypeForClass,
} from 'open20-core/spells';
import type { AppCharacter } from './types';
import { SpellService, spellService } from './spell-service';

import { dataLoader } from './data-loader';
import type { SpellLevel } from 'open20-core/data';

// Wrappers around core functions (core functions require DataLoader parameter)
export function getCasterType(character: AppCharacter) {
  return coreGetCasterType(character as unknown as import('open20-core').Character, dataLoader);
}

export function getCasterTypeForClass(classId: string) {
  return coreGetCasterTypeForClass(classId, dataLoader);
}

export class CharacterService {
  private spellService: SpellService;

  constructor(spellService: SpellService) {
    this.spellService = spellService;
  }

  createCharacter(params: Parameters<typeof open20CreateCharacter>[0]): AppCharacter {
    const raw = open20CreateCharacter(params, dataLoader as unknown as DataLoader);
    const char = open20Recompute(raw, dataLoader as unknown as DataLoader);
    return { ...char, id: crypto.randomUUID() } as AppCharacter;
  }

  recompute(character: AppCharacter): AppCharacter {
    if (!character.classes || !character.abilityScores?.base || !character.hitPoints) {
      return character;
    }
    const recomputed = open20Recompute(character, dataLoader as unknown as DataLoader);
    return { ...recomputed, id: character.id } as AppCharacter;
  }

  prepareSpell(character: AppCharacter, spellId: string): AppCharacter {
    const spell = this.spellService.getSpell(spellId);
    if (!spell) return character;

    const classIds = character.classes?.map((c) => c.classId) ?? [];
    const spellClasses = spell.classes ?? [];
    const matchingClass = classIds.find((id) => spellClasses.includes(id));

    if (!matchingClass) return character;

    return {
      ...open20PrepareSpellForClass(character, matchingClass, spellId),
      id: character.id,
    } as AppCharacter;
  }

  unprepareSpell(character: AppCharacter, spellId: string): AppCharacter {
    const classId = Object.keys(character.spells.classSpellcasting).find((cls) =>
      character.spells.classSpellcasting[cls].preparedSpells.includes(spellId),
    );

    if (!classId) return character;

    return {
      ...open20UnprepareSpellForClass(character, classId, spellId),
      id: character.id,
    } as AppCharacter;
  }

  prepareSpellForClass(character: AppCharacter, classId: string, spellId: string): AppCharacter {
    return {
      ...open20PrepareSpellForClass(character, classId, spellId),
      id: character.id,
    } as AppCharacter;
  }

  unprepareSpellForClass(character: AppCharacter, classId: string, spellId: string): AppCharacter {
    return {
      ...open20UnprepareSpellForClass(character, classId, spellId),
      id: character.id,
    } as AppCharacter;
  }

  consumeSpellSlot(character: AppCharacter, level: number): AppCharacter {
    return {
      ...open20ConsumeSpellSlot(character, level),
      id: character.id,
    } as AppCharacter;
  }

  recoverSpellSlot(character: AppCharacter, level: number): AppCharacter {
    return {
      ...open20RecoverSpellSlot(character, level),
      id: character.id,
    } as AppCharacter;
  }

  consumePactMagicSlot(character: AppCharacter): AppCharacter {
    return {
      ...open20ConsumeSpellSlot(character, 'pact'),
      id: character.id,
    } as AppCharacter;
  }

  recoverPactMagicSlot(character: AppCharacter): AppCharacter {
    return {
      ...open20RecoverSpellSlot(character, 'pact'),
      id: character.id,
    } as AppCharacter;
  }

  longRest(character: AppCharacter): AppCharacter {
    return {
      ...open20LongRest(character, dataLoader as unknown as DataLoader),
      id: character.id,
    } as AppCharacter;
  }

  shortRest(character: AppCharacter): AppCharacter {
    return {
      ...open20ShortRest(character, 0, dataLoader as unknown as DataLoader),
      id: character.id,
    } as AppCharacter;
  }

  startConcentration(character: AppCharacter, spellId: string): AppCharacter {
    return {
      ...open20StartConcentration(character, spellId),
      id: character.id,
    } as AppCharacter;
  }

  endConcentration(character: AppCharacter): AppCharacter {
    return {
      ...open20EndConcentration(character),
      id: character.id,
    } as AppCharacter;
  }

  learnSpell(character: AppCharacter, spellId: string): AppCharacter {
    if (knowsSpell(character, spellId)) return character;

    const spell = this.spellService.getSpell(spellId);
    if (!spell) return character;

    const classIds = character.classes?.map((c) => c.classId) ?? [];
    const spellClasses = spell.classes ?? [];
    const matchingClass = classIds.find((id) => spellClasses.includes(id));

    if (!matchingClass) return character;

    return {
      ...addKnownSpell(character, matchingClass, spellId),
      updatedAt: new Date().toISOString(),
    } as AppCharacter;
  }

  unlearnSpell(character: AppCharacter, spellId: string): AppCharacter {
    if (!knowsSpell(character, spellId)) return character;

    const classId = Object.keys(character.spells.classSpellcasting).find((cls) =>
      character.spells.classSpellcasting[cls].knownSpells.includes(spellId),
    );

    if (!classId) return character;

    return {
      ...removeKnownSpell(character, classId, spellId),
      updatedAt: new Date().toISOString(),
    } as AppCharacter;
  }

  learnCantrip(character: AppCharacter, classId: string, spellId: string): AppCharacter {
    const classSpellData = character.spells.classSpellcasting[classId];
    if (!classSpellData) return character;
    if (classSpellData.knownCantrips.includes(spellId)) return character;
    if (classSpellData.knownCantrips.length >= classSpellData.maxCantripsKnown) return character;

    const updatedSpells = {
      ...character.spells,
      classSpellcasting: {
        ...character.spells.classSpellcasting,
        [classId]: {
          ...classSpellData,
          knownCantrips: [...classSpellData.knownCantrips, spellId],
        },
      },
    };

    return {
      ...character,
      spells: updatedSpells,
      updatedAt: new Date().toISOString(),
    } as AppCharacter;
  }

  replaceCantrip(
    character: AppCharacter,
    classId: string,
    oldSpellId: string,
    newSpellId: string,
  ): AppCharacter {
    const classSpellData = character.spells.classSpellcasting[classId];
    if (!classSpellData) return character;
    if (!classSpellData.knownCantrips.includes(oldSpellId)) return character;
    if (classSpellData.knownCantrips.includes(newSpellId)) return character;

    const updatedSpells = {
      ...character.spells,
      classSpellcasting: {
        ...character.spells.classSpellcasting,
        [classId]: {
          ...classSpellData,
          knownCantrips: classSpellData.knownCantrips.map((id) =>
            id === oldSpellId ? newSpellId : id,
          ),
        },
      },
    };

    return {
      ...character,
      spells: updatedSpells,
      updatedAt: new Date().toISOString(),
    } as AppCharacter;
  }

  unlearnCantrip(character: AppCharacter, classId: string, spellId: string): AppCharacter {
    const classSpellData = character.spells.classSpellcasting[classId];
    if (!classSpellData) return character;
    if (!classSpellData.knownCantrips.includes(spellId)) return character;

    const updatedSpells = {
      ...character.spells,
      classSpellcasting: {
        ...character.spells.classSpellcasting,
        [classId]: {
          ...classSpellData,
          knownCantrips: classSpellData.knownCantrips.filter((id) => id !== spellId),
        },
      },
    };

    return {
      ...character,
      spells: updatedSpells,
      updatedAt: new Date().toISOString(),
    } as AppCharacter;
  }

  castSpell(character: AppCharacter, spellId: string, level: SpellLevel): AppCharacter {
    const result = open20CastSpell(character, spellId, level, dataLoader as unknown as DataLoader);
    if (!result.success) return character;

    const updated = { ...result.char, id: character.id } as AppCharacter;

    return this.recompute(updated);
  }

  rollSpellAttack(character: AppCharacter, spellName: string): AttackRollResult {
    void spellName;
    const classSpellcasting = character.spells.classSpellcasting;
    const primaryClassId = Object.keys(classSpellcasting)[0];
    const spellcastingAbility = primaryClassId
      ? classSpellcasting[primaryClassId].spellcastingAbility
      : 'Intelligence';
    return rollSpellAttack({
      character,
      spellcastingAbility,
      rng: defaultRandom,
    });
  }

  rollSpellDamage(
    character: AppCharacter,
    spellId: string,
    slotLevel?: SpellLevel,
  ): DamageRollResult {
    const spell = this.spellService.getSpell(spellId);
    if (!spell) throw new Error(`Spell not found: ${spellId}`);

    // Get spellcasting ability modifier
    const classSpellcasting = character.spells.classSpellcasting;
    const primaryClassId = Object.keys(classSpellcasting)[0];
    const spellcastingAbility = primaryClassId
      ? classSpellcasting[primaryClassId].spellcastingAbility
      : ('Intelligence' as const);
    const spellcastingModifier = getModifier(
      getTotalScore(character.abilityScores, spellcastingAbility),
    );

    return rollSpellDamage({
      spell,
      slotLevel: slotLevel ?? spell.level,
      rng: defaultRandom,
      spellcastingModifier: spell.damage?.includeSpellcastingModifier
        ? spellcastingModifier
        : undefined,
    });
  }

  rollSpellHeal(
    character: AppCharacter,
    spellId: string,
    slotLevel?: SpellLevel,
  ): SpellHealRollResult {
    const spell = this.spellService.getSpell(spellId);
    if (!spell) throw new Error(`Spell not found: ${spellId}`);

    const classSpellcasting = character.spells.classSpellcasting;
    const primaryClassId = Object.keys(classSpellcasting)[0];
    const spellcastingAbility = primaryClassId
      ? classSpellcasting[primaryClassId].spellcastingAbility
      : ('Intelligence' as const);
    const spellcastingModifier = getModifier(
      getTotalScore(character.abilityScores, spellcastingAbility),
    );

    return rollSpellHeal({
      spell,
      slotLevel: slotLevel ?? spell.level,
      rng: defaultRandom,
      spellcastingModifier: spell.heal?.includeSpellcastingModifier
        ? spellcastingModifier
        : undefined,
    });
  }
}

// Create default instance (will be replaced in tests)
export const characterService = new CharacterService(spellService);
