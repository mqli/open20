import { describe, it, expect } from 'vitest';
import { makeCharacter } from './fixtures';

describe('makeCharacter fixture', () => {
  it('builds a valid recomputed character', () => {
    const char = makeCharacter();
    expect(char.id).toBeTruthy();
    expect(char.name).toBe('Tharion');
    expect(char.classes).toHaveLength(1);
    expect(char.classes[0]!.classId).toBe('Wizard');
    expect(char.classes[0]!.level).toBe(5);
    // recompute populated derived stats
    expect(char.hitPoints.max).toBeGreaterThan(0);
    expect(char.hitPoints.current).toBe(char.hitPoints.max);
    expect(char.combatStats.proficiencyBonus).toBe(3); // level 5 → PB +3
  });

  it('applies overrides', () => {
    const char = makeCharacter({ name: 'Gale', classLevel: 1, abilityScores: { Intelligence: 8 } });
    expect(char.name).toBe('Gale');
    expect(char.classes[0]!.level).toBe(1);
    expect(char.abilityScores.base.Intelligence).toBe(8);
  });
});
