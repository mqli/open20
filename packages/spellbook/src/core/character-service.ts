/* eslint-disable @typescript-eslint/no-explicit-any */
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
  defaultRandom,
  addKnownSpell,
  removeKnownSpell,
  knowsSpell,
  type AttackRollResult,
  type DamageRollResult
} from 'open20-core';
import type { AppCharacter } from './types';
import { SpellService } from './spell-service';

import { dataLoader } from './data-loader';

export function getCasterType(character: AppCharacter): {
  canLearn: boolean;
  canPrepare: boolean;
  isSpellbookCaster: boolean;
} {
  const classIds = character.classes?.map(c => c.classId) ?? [];
  const classes = classIds
    .map(id => dataLoader.getClass(id))
    .filter((c): c is NonNullable<typeof c> => c != null);

  const canPrepare = classes.some(c => c.spellcasting?.preparationTiming === 'long_rest');
  const canLearn = classes.some(c =>
    c.spellcasting?.preparationTiming === 'level_up' || c.spellcasting?.knownSource === 'spellbook'
  );
  const isSpellbookCaster = classes.some(c => c.spellcasting?.knownSource === 'spellbook');

  return { canLearn, canPrepare, isSpellbookCaster };
}

export function getCasterTypeForClass(classId: string): {
  canLearn: boolean;
  canPrepare: boolean;
  isSpellbookCaster: boolean;
} {
  const classDef = dataLoader.getClass(classId);
  if (!classDef?.spellcasting) {
    return { canLearn: false, canPrepare: false, isSpellbookCaster: false };
  }

  const { preparationTiming, knownSource } = classDef.spellcasting;
  return {
    canLearn: preparationTiming === 'level_up' || knownSource === 'spellbook',
    canPrepare: preparationTiming === 'long_rest',
    isSpellbookCaster: knownSource === 'spellbook',
  };
}

const SPELL_SIDE_EFFECTS: Record<string, any> = {
  'goodberry': {
    resource: {
      id: 'goodberry-pool',
      name: 'Goodberries',
      max: 10,
      current: 10,
      reset: 'Long Rest'
    }
  }
};

export class CharacterService {
  private spellService: SpellService;

  constructor(spellService: SpellService) {
    this.spellService = spellService;
  }

  createCharacter(params: any): AppCharacter {
    const raw = open20CreateCharacter(params, dataLoader as any);
    const char = open20Recompute(raw, dataLoader as any);
    return { ...char, id: crypto.randomUUID() } as AppCharacter;
  }

  recompute(character: AppCharacter): AppCharacter {
    if (!character.classes || !character.abilityScores || !character.abilityScores.base || !character.hitPoints) {
      return character;
    }
    const recomputed = open20Recompute(character, dataLoader as any) as any;
    return { ...recomputed, id: character.id } as AppCharacter;
  }

  prepareSpell(character: AppCharacter, spellId: string): AppCharacter {
    // Find the correct class for this spell
    const spell = this.spellService.getSpell(spellId);
    if (!spell) return character;
    
    const classIds = character.classes?.map(c => c.classId) ?? [];
    const spellClasses = spell.classes ?? [];
    const matchingClass = classIds.find(id => spellClasses.includes(id));
    
    if (!matchingClass) return character;
    
    return { ...open20PrepareSpellForClass(character, matchingClass, spellId) as any, id: character.id };
  }

  unprepareSpell(character: AppCharacter, spellId: string): AppCharacter {
    // Find which class has this spell prepared
    const classId = Object.keys(character.spells.classSpellcasting).find(
      cls => character.spells.classSpellcasting[cls].preparedSpells.includes(spellId)
    );
    
    if (!classId) return character;
    
    return { ...open20UnprepareSpellForClass(character, classId, spellId) as any, id: character.id };
  }

  prepareSpellForClass(character: AppCharacter, classId: string, spellId: string): AppCharacter {
    return { ...open20PrepareSpellForClass(character, classId, spellId) as any, id: character.id };
  }

  unprepareSpellForClass(character: AppCharacter, classId: string, spellId: string): AppCharacter {
    return { ...open20UnprepareSpellForClass(character, classId, spellId) as any, id: character.id };
  }

  consumeSpellSlot(character: AppCharacter, level: number): AppCharacter {
    return { ...open20ConsumeSpellSlot(character, level) as any, id: character.id };
  }

  recoverSpellSlot(character: AppCharacter, level: number): AppCharacter {
    return { ...open20RecoverSpellSlot(character, level) as any, id: character.id };
  }

  longRest(character: AppCharacter): AppCharacter {
    return { ...open20LongRest(character, dataLoader as any) as any, id: character.id };
  }

  shortRest(character: AppCharacter): AppCharacter {
    return { ...open20ShortRest(character, 0, dataLoader as any) as any, id: character.id };
  }

  startConcentration(character: AppCharacter, spellId: string): AppCharacter {
    const withoutConcentrating = character.conditions.filter(c => c.id !== 'Concentrating');
    const newCondition = {
      id: 'Concentrating' as any,
      source: spellId,
      appliedAt: new Date().toISOString(),
    };
    return { 
      ...character, 
      conditions: [...withoutConcentrating, newCondition],
      updatedAt: new Date().toISOString()
    };
  }

  endConcentration(character: AppCharacter): AppCharacter {
    return { 
      ...character, 
      conditions: character.conditions.filter(c => c.id !== 'Concentrating'),
      updatedAt: new Date().toISOString()
    };
  }

  learnSpell(character: AppCharacter, spellId: string): AppCharacter {
    if (knowsSpell(character, spellId)) return character;
    
    // Find the correct class for this spell
    const spell = this.spellService.getSpell(spellId);
    if (!spell) return character;
    
    const classIds = character.classes?.map(c => c.classId) ?? [];
    const spellClasses = spell.classes ?? [];
    const matchingClass = classIds.find(id => spellClasses.includes(id));
    
    if (!matchingClass) return character;
    
    return {
      ...addKnownSpell(character, matchingClass, spellId) as any,
      updatedAt: new Date().toISOString()
    };
  }

  unlearnSpell(character: AppCharacter, spellId: string): AppCharacter {
    if (!knowsSpell(character, spellId)) return character;
    
    // Find which class knows this spell
    const classId = Object.keys(character.spells.classSpellcasting).find(
      cls => character.spells.classSpellcasting[cls].knownSpells.includes(spellId)
    );
    
    if (!classId) return character;
    
    return {
      ...removeKnownSpell(character, classId, spellId) as any,
      updatedAt: new Date().toISOString()
    };
  }

  learnCantrip(character: AppCharacter, classId: string, spellId: string): AppCharacter {
    const classSpellData = character.spells.classSpellcasting[classId];
    if (!classSpellData) return character;
    
    // Check if already knows this cantrip
    if (classSpellData.knownCantrips.includes(spellId)) return character;
    
    // Check if at max
    if (classSpellData.knownCantrips.length >= classSpellData.maxCantripsKnown) return character;
    
    const updatedSpells = {
      ...character.spells,
      classSpellcasting: {
        ...character.spells.classSpellcasting,
        [classId]: {
          ...classSpellData,
          knownCantrips: [...classSpellData.knownCantrips, spellId] as any
        }
      }
    };
    
    return {
      ...character,
      spells: updatedSpells,
      updatedAt: new Date().toISOString()
    };
  }

  replaceCantrip(character: AppCharacter, classId: string, oldSpellId: string, newSpellId: string): AppCharacter {
    const classSpellData = character.spells.classSpellcasting[classId];
    if (!classSpellData) return character;
    
    // Check if knows the old cantrip
    if (!classSpellData.knownCantrips.includes(oldSpellId)) return character;
    
    // Check if already knows the new cantrip
    if (classSpellData.knownCantrips.includes(newSpellId)) return character;
    
    const updatedSpells = {
      ...character.spells,
      classSpellcasting: {
        ...character.spells.classSpellcasting,
        [classId]: {
          ...classSpellData,
          knownCantrips: classSpellData.knownCantrips.map(id => id === oldSpellId ? newSpellId : id) as any
        }
      }
    };
    
    return {
      ...character,
      spells: updatedSpells,
      updatedAt: new Date().toISOString()
    };
  }

  unlearnCantrip(character: AppCharacter, classId: string, spellId: string): AppCharacter {
    const classSpellData = character.spells.classSpellcasting[classId];
    if (!classSpellData) return character;
    
    // Check if knows the cantrip
    if (!classSpellData.knownCantrips.includes(spellId)) return character;
    
    const updatedSpells = {
      ...character.spells,
      classSpellcasting: {
        ...character.spells.classSpellcasting,
        [classId]: {
          ...classSpellData,
          knownCantrips: classSpellData.knownCantrips.filter(id => id !== spellId) as any
        }
      }
    };
    
    return {
      ...character,
      spells: updatedSpells,
      updatedAt: new Date().toISOString()
    };
  }

  castSpell(character: AppCharacter, spellId: string, level: number): AppCharacter {
    // 1. Consume slot
    const char = { ...open20ConsumeSpellSlot(character, level) as any, id: character.id };
    
    // 2. Apply side effects
    const effect = SPELL_SIDE_EFFECTS[spellId.toLowerCase()];
    if (effect?.resource) {
      const existing = char.resources.find((r: any) => r.id === effect.resource.id);
      if (existing) {
        char.resources = char.resources.map((r: any) => 
          r.id === effect.resource.id ? { ...r, current: effect.resource.max } : r
        );
      } else {
        char.resources = [...char.resources, effect.resource];
      }
    }

    return this.recompute(char);
  }

  rollSpellAttack(character: AppCharacter, spellName: string): AttackRollResult {
    void spellName;
    const classSpellcasting = character.spells.classSpellcasting;
    const primaryClassId = Object.keys(classSpellcasting)[0];
    const spellcastingAbility = primaryClassId
      ? classSpellcasting[primaryClassId].spellcastingAbility as any
      : 'Intelligence';
    return rollSpellAttack({ 
      character, 
      spellcastingAbility,
      rng: defaultRandom
    });
  }

  rollSpellDamage(character: AppCharacter, spellId: string, damageIndex: number): DamageRollResult {
    void damageIndex;
    const spell = this.spellService.getSpell(spellId);
    if (!spell) throw new Error(`Spell not found: ${spellId}`);

    return rollSpellDamage({ 
      character, 
      spell, 
      slotLevel: spell.level,
      rng: defaultRandom
    });
  }
}

// Create default instance (will be replaced in tests)
const spellService = new SpellService();
export const characterService = new CharacterService(spellService);
