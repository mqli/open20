import type { ComputationProvider, ValidationResult } from '../ComputationProvider';
import type {
  Character,
  DataLoader,
  CreateCharacterParams,
  ConditionName,
  LevelUpOptions,
  Resource,
} from '@/types/open20-core';

export type { Character, DataLoader, CreateCharacterParams, ConditionName, LevelUpOptions, Resource } from '@/types/open20-core';

export class LocalComputationProvider implements ComputationProvider {
  createDataLoader(): DataLoader {
    return {
      getSpecies: () => undefined,
      getAllSpecies: () => [],
      getBackground: () => undefined,
      getAllBackgrounds: () => [],
      getClass: () => undefined,
      getAllClasses: () => [],
      getSubclass: () => undefined,
      getSubclassesForClass: () => [],
      getFeat: () => undefined,
      getAllFeats: () => [],
      getFeatsByCategory: () => [],
      getWeapon: () => undefined,
      getAllWeapons: () => [],
      getArmor: () => undefined,
      getAllArmor: () => [],
      getSpell: () => undefined,
      getSpellsByLevel: () => [],
      getAllSpells: () => [],
      getProficiencyBonus: () => 2,
      getSpellSlots: () => ({}),
    };
  }

  createCharacter(params: CreateCharacterParams, _loader: DataLoader): Character {
    return {
      schemaVersion: '1.0.0',
      id: crypto.randomUUID(),
      name: params.name || 'New Character',
      species: params.speciesId,
      speciesSubtype: null,
      background: params.backgroundId || '',
      classes: [{
        classId: params.classId,
        level: 1,
        subclassId: null,
        subclassLevel: null,
        hitDice: { die: 'd10', used: 0 },
      }],
      abilityScores: params.abilityScores || {
        Strength: 10,
        Dexterity: 10,
        Constitution: 10,
        Intelligence: 10,
        Wisdom: 10,
        Charisma: 10,
      },
      skills: {},
      feats: [],
      equipment: [],
      spells: { prepared: [], known: [], slots: {} },
      resources: [],
      hitPoints: {
        max: 10,
        current: 10,
        temporary: 0,
        deathSaves: { successes: 0, failures: 0, isStable: true },
      },
      combatStats: {
        AC: 10,
        initiative: 0,
        speed: 30,
        passivePerception: 10,
        proficiencyBonus: 2,
        attacks: [],
      },
      currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
      conditions: [],
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  validateCharacter(character: Character): ValidationResult {
    const errors: string[] = [];

    if (!character.name) errors.push('Name is required');
    if (!character.species) errors.push('Species is required');
    if (!character.classes.length) errors.push('At least one class is required');

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  modifyHP(character: Character, delta: number): Character {
    const newCurrent = Math.max(0, Math.min(character.hitPoints.max, character.hitPoints.current + delta));
    return {
      ...character,
      hitPoints: {
        ...character.hitPoints,
        current: newCurrent,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  setTemporaryHP(character: Character, value: number): Character {
    return {
      ...character,
      hitPoints: {
        ...character.hitPoints,
        temporary: Math.max(0, value),
      },
      updatedAt: new Date().toISOString(),
    };
  }

  consumeResource(character: Character, resourceId: string): Character {
    const resources = character.resources.map((r: Resource) =>
      r.id === resourceId ? { ...r, used: Math.min(r.max, r.used + 1) } : r
    );
    return { ...character, resources, updatedAt: new Date().toISOString() };
  }

  recoverResource(character: Character, resourceId: string): Character {
    const resources = character.resources.map((r: Resource) =>
      r.id === resourceId ? { ...r, used: Math.max(0, r.used - 1) } : r
    );
    return { ...character, resources, updatedAt: new Date().toISOString() };
  }

  consumeSpellSlot(character: Character, level: number): Character {
    const slots = character.spells.slots || {};
    const slot = slots[level];
    if (!slot) return character;

    return {
      ...character,
      spells: {
        ...character.spells,
        slots: {
          ...slots,
          [level]: { ...slot, used: Math.min(slot.total, slot.used + 1) },
        },
      },
      updatedAt: new Date().toISOString(),
    };
  }

  recoverSpellSlot(character: Character, level: number): Character {
    const slots = character.spells.slots || {};
    const slot = slots[level];
    if (!slot) return character;

    return {
      ...character,
      spells: {
        ...character.spells,
        slots: {
          ...slots,
          [level]: { ...slot, used: Math.max(0, slot.used - 1) },
        },
      },
      updatedAt: new Date().toISOString(),
    };
  }

  toggleCondition(character: Character, condition: ConditionName): Character {
    const exists = character.conditions.some((c) => c.name === condition);
    const conditions = exists
      ? character.conditions.filter((c) => c.name !== condition)
      : [...character.conditions, { name: condition, source: '', duration: null }];

    return { ...character, conditions, updatedAt: new Date().toISOString() };
  }

  shortRest(character: Character, hitDiceToSpend: number = 0): Character {
    const resources = character.resources.map((r: Resource) =>
      r.resetOn === 'Short Rest' ? { ...r, used: 0 } : r
    );

    let currentHP = character.hitPoints.current;
    if (hitDiceToSpend > 0) {
      const healAmount = hitDiceToSpend * 5;
      currentHP = Math.min(character.hitPoints.max, currentHP + healAmount);
    }

    return {
      ...character,
      resources,
      hitPoints: { ...character.hitPoints, current: currentHP },
      updatedAt: new Date().toISOString(),
    };
  }

  longRest(character: Character): Character {
    const resources = character.resources.map((r: Resource) => ({ ...r, used: 0 }));

    const slots = { ...character.spells.slots };
    Object.keys(slots).forEach((level) => {
      const lvl = Number(level);
      slots[lvl] = { ...slots[lvl], used: 0 };
    });

    return {
      ...character,
      resources,
      spells: { ...character.spells, slots },
      hitPoints: {
        ...character.hitPoints,
        current: character.hitPoints.max,
        temporary: 0,
        deathSaves: { successes: 0, failures: 0, isStable: true },
      },
      conditions: [],
      updatedAt: new Date().toISOString(),
    };
  }

  levelUp(character: Character, options: LevelUpOptions): Character {
    const newClasses = character.classes.map((c) =>
      c.classId === options.classId ? { ...c, level: c.level + 1 } : c
    );

    return {
      ...character,
      classes: newClasses,
      updatedAt: new Date().toISOString(),
    };
  }

  recompute(character: Character, _loader: DataLoader): Character {
    return character;
  }

  serialize(character: Character): string {
    return JSON.stringify(character);
  }

  deserialize(json: string): Character {
    return JSON.parse(json) as Character;
  }
}

export const localComputationProvider = new LocalComputationProvider();
