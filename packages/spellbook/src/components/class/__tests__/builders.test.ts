import { describe, it, expect } from 'vitest';
import { toSlug, buildClass, buildSubclass, ABILITIES } from '../builders';
import { getPreset } from '@/core/slot-presets';

describe('toSlug', () => {
  it('should convert spaces to hyphens', () => {
    expect(toSlug('My Custom Class')).toBe('my-custom-class');
  });

  it('should convert to lowercase', () => {
    expect(toSlug('WIZARD')).toBe('wizard');
  });

  it('should remove special characters', () => {
    expect(toSlug("Wizard's Class!")).toBe('wizards-class');
  });

  it('should handle empty string', () => {
    expect(toSlug('')).toBe('');
  });

  it('should handle already-slugged input', () => {
    expect(toSlug('my-class')).toBe('my-class');
  });

  it('should collapse multiple consecutive spaces into single hyphen', () => {
    // \s+ collapses multiple spaces into a single hyphen
    expect(toSlug('My   Class')).toBe('my-class');
  });
});

describe('ABILITIES', () => {
  it('should contain all 6 D&D abilities', () => {
    expect(ABILITIES).toHaveLength(6);
    expect(ABILITIES).toContain('Strength');
    expect(ABILITIES).toContain('Dexterity');
    expect(ABILITIES).toContain('Constitution');
    expect(ABILITIES).toContain('Intelligence');
    expect(ABILITIES).toContain('Wisdom');
    expect(ABILITIES).toContain('Charisma');
  });
});

describe('buildClass', () => {
  const fullCaster = getPreset('full-caster')!;
  const halfCaster = getPreset('half-caster')!;
  const pactMagic = getPreset('pact-magic')!;

  it('should build a full-caster class with correct properties', () => {
    const cls = buildClass('My Wizard', fullCaster, 'Intelligence', 'class_list', 'long_rest');

    expect(cls.id).toBe('my-wizard');
    expect(cls.name).toBe('My Wizard');
    expect(cls.source).toBe('Homebrew');
    expect(cls.hitDie).toBe('d8');
    expect(cls.spellcasting).toBeDefined();
    expect(cls.spellcasting!.ability).toBe('Intelligence');
    expect(cls.spellcasting!.knownSource).toBe('class_list');
    expect(cls.spellcasting!.preparationTiming).toBe('long_rest');
    expect(cls.spellcasting!.pactMagic).toBeUndefined();
    expect(cls.spellSlotsByLevel).toBeDefined();
    // Full caster at level 1: 2 level-1 slots
    expect(cls.spellSlotsByLevel![1][0]).toBe(2);
  });

  it('should build a half-caster class', () => {
    const cls = buildClass('Paladin Lite', halfCaster, 'Wisdom', 'class_list', 'long_rest');

    expect(cls.id).toBe('paladin-lite');
    expect(cls.spellcasting!.ability).toBe('Wisdom');
    // Half caster at level 1: no slots
    expect(cls.spellSlotsByLevel![1][0]).toBe(0);
    // Half caster at level 3: 2 level-1 slots
    expect(cls.spellSlotsByLevel![3][0]).toBe(2);
  });

  it('should build a pact-magic class', () => {
    const cls = buildClass('Warlock Alt', pactMagic, 'Charisma', 'spellbook', 'level_up');

    expect(cls.id).toBe('warlock-alt');
    expect(cls.spellcasting!.ability).toBe('Charisma');
    expect(cls.spellcasting!.pactMagic).toBe(true);
    expect(cls.spellcasting!.pactMagicSlots).toBeDefined();
    // Pact magic has empty spellSlotsByLevel
    expect(cls.spellSlotsByLevel).toEqual({});
  });

  it('should fall back to id "custom" when name is empty', () => {
    const cls = buildClass('', halfCaster, 'Intelligence', 'class_list', 'long_rest');
    expect(cls.id).toBe('custom');
  });

  it('should produce id from whitespace-only name (toSlug collapses to hyphen)', () => {
    // toSlug('   ') → '-' (all whitespace matched by \s+ → single hyphen)
    const cls = buildClass('   ', halfCaster, 'Intelligence', 'class_list', 'long_rest');
    expect(cls.id).toBe('-');
  });

  it('should generate featuresByLevel with 20 entries', () => {
    const cls = buildClass('Test', fullCaster, 'Intelligence', 'class_list', 'long_rest');
    expect(cls.featuresByLevel).toHaveLength(20);
    expect(cls.featuresByLevel[0].level).toBe(1);
    expect(cls.featuresByLevel[19].level).toBe(20);
  });

  it('should use spellbook as known source', () => {
    const cls = buildClass('Book Caster', fullCaster, 'Intelligence', 'spellbook', 'long_rest');
    expect(cls.spellcasting!.knownSource).toBe('spellbook');
  });

  it('should use level_up as preparation timing', () => {
    const cls = buildClass('Leveler', fullCaster, 'Intelligence', 'class_list', 'level_up');
    expect(cls.spellcasting!.preparationTiming).toBe('level_up');
  });
});

describe('buildSubclass', () => {
  it('should build a subclass with alwaysPrepared spells', () => {
    const sub = buildSubclass('my-sub', 'my-wizard', [
      { level: 3, spells: ['fireball', 'lightning-bolt'] },
    ]);

    expect(sub.id).toBe('my-sub');
    expect(sub.parentClass).toBe('my-wizard');
    expect(sub.grantedAtLevel).toBe(1);
    expect(sub.source).toBe('Homebrew');
    expect(sub.featuresByLevel).toEqual([]);
    expect(sub.alwaysPreparedSpells).toBeDefined();
    expect(sub.alwaysPreparedSpells).toHaveLength(1);
    expect(sub.alwaysPreparedSpells![0].level).toBe(3);
    expect(sub.alwaysPreparedSpells![0].spells).toEqual(['fireball', 'lightning-bolt']);
  });

  it('should build a subclass without alwaysPrepared spells', () => {
    const sub = buildSubclass('simple-sub', 'my-wizard', []);

    expect(sub.id).toBe('simple-sub');
    expect(sub.alwaysPreparedSpells).toBeUndefined();
  });

  it('should handle multiple alwaysPrepared levels', () => {
    const sub = buildSubclass('multi-sub', 'my-wizard', [
      { level: 1, spells: ['magic-missile'] },
      { level: 3, spells: ['fireball', 'haste'] },
      { level: 5, spells: ['cone-of-cold'] },
    ]);

    expect(sub.alwaysPreparedSpells).toHaveLength(3);
    expect(sub.alwaysPreparedSpells![0].level).toBe(1);
    expect(sub.alwaysPreparedSpells![1].level).toBe(3);
    expect(sub.alwaysPreparedSpells![2].level).toBe(5);
  });
});
