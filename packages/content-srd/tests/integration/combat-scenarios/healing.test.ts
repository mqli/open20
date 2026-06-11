import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDepsForCreate, createTestDeps } from '../../create-test-loader';
import { createCharacter, recomputeDerivedStats, modifyHP } from 'open20-core/character';
import { initializeMonsterForCombat, modifyMonsterHP } from 'open20-core/monster';
import {
  getCharacterCurrentHP,
  getCharacterMaxHP,
  getMonsterCurrentHP,
  getMonsterMaxHP,
} from 'open20-core/engine';
import monstersArray from '@open20/content-srd/data/monsters.json';

// ── Test Helpers ─────────────────────────────────────

function createTestFighter(name: string = 'Fighter') {
  const deps = createTestDepsForCreate({
    speciesId: 'Human',
    backgroundId: 'soldier',
    classId: 'Fighter',
  });
  const char = createCharacter(
    {
      name,
      speciesId: 'Human',
      backgroundId: 'soldier',
      classId: 'Fighter',
      abilityScores: {
        Strength: 16,
        Dexterity: 14,
        Constitution: 15,
        Intelligence: 10,
        Wisdom: 12,
        Charisma: 10,
      },
    },
    deps,
  );
  const deps2 = createTestDeps(char);
  return recomputeDerivedStats(char, deps2);
}

function getTestMonster(monsterId: string): any {
  const monster = (monstersArray as any).find((m: any) => m.id === monsterId);
  if (!monster) throw new Error(`Monster ${monsterId} not found in SRD data`);
  return monster;
}

// ── Scenario 7: Combat with Healing ─────────────────

describe('Combat Scenarios - Healing in Combat', () => {
  let fighter: ReturnType<typeof createTestFighter>;
  let goblin: any;

  beforeEach(() => {
    fighter = createTestFighter('Healer Fighter');
    goblin = initializeMonsterForCombat(getTestMonster('goblin'));
  });

  it('should allow healing during combat', () => {
    const maxHP = getCharacterMaxHP(fighter);
    const damage = Math.min(20, maxHP - 1);
    const damaged = modifyHP(fighter, -damage);
    expect(getCharacterCurrentHP(damaged)).toBe(maxHP - damage);

    const healed = modifyHP(damaged, 10);
    expect(getCharacterCurrentHP(healed)).toBe(Math.min(maxHP, maxHP - damage + 10));
  });

  it('should not heal beyond max HP', () => {
    const damaged = modifyHP(fighter, -20);
    const overHealed = modifyHP(damaged, 50);
    expect(getCharacterCurrentHP(overHealed)).toBe(getCharacterMaxHP(fighter));
  });

  it('should allow healing monster during combat', () => {
    const damaged = modifyMonsterHP(goblin, -5);
    expect(getMonsterCurrentHP(damaged)).toBe(getMonsterMaxHP(goblin) - 5);

    const healed = modifyMonsterHP(damaged, 3);
    expect(getMonsterCurrentHP(healed)).toBe(getMonsterMaxHP(goblin) - 2);
  });
});
