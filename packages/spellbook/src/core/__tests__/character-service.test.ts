import { describe, it, expect, vi, beforeEach } from 'vitest';
import { characterService } from '@open20/spellbook/core/character-service';

describe('CharacterService', () => {
  const mockParams = {
    name: 'Test Wizard',
    speciesId: 'Human',
    backgroundId: 'sage',
    classId: 'Wizard',
    classLevel: 1,
    abilityScores: {
      Strength: 10,
      Dexterity: 12,
      Constitution: 14,
      Intelligence: 16,
      Wisdom: 13,
      Charisma: 8
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a character with correct initial stats', () => {
    const character = characterService.createCharacter(mockParams);
    
    expect(character.name).toBe('Test Wizard');
    expect(character.classes[0].classId).toBe('Wizard');
    expect(character.classes[0].level).toBe(1);
    
    // Wizard spellcasting uses Intelligence
    expect(character.spells.classSpellcasting['Wizard'].spellcastingAbility).toBe('Intelligence');
    
    // Spell DC = 8 + PB(2) + Int Mod(3) = 13
    expect(character.spells.classSpellcasting['Wizard'].spellSaveDC).toBe(13);
    
    // Spell Attack = PB(2) + Int Mod(3) = 5
    expect(character.spells.classSpellcasting['Wizard'].spellAttackBonus).toBe(5);
  });

  it('should calculate correct stats for higher level characters', () => {
    const lvl5Params = { ...mockParams, classLevel: 5 };
    const character = characterService.createCharacter(lvl5Params);
    
    expect(character.classes[0].level).toBe(5);
    // PB for level 5 is 3, Int Mod is 3, so Spell Save DC = 8 + 3 + 3 = 14
    expect(character.spells.classSpellcasting['Wizard'].spellSaveDC).toBe(14);
  });

  it('should handle spell preparation', () => {
    const character = characterService.createCharacter(mockParams);
    const spellId = 'fireball';
    
    const preparedChar = characterService.prepareSpell(character, spellId);
    expect(preparedChar.spells.classSpellcasting['Wizard'].preparedSpells).toContain(spellId);
    
    const unpreparedChar = characterService.unprepareSpell(preparedChar, spellId);
    expect(unpreparedChar.spells.classSpellcasting['Wizard'].preparedSpells).not.toContain(spellId);
  });

  it('should manage spell slots', () => {
    const character = characterService.createCharacter(mockParams);
    
    // Consume a level 1 slot
    const consumedChar = characterService.consumeSpellSlot(character, 1);
    expect(consumedChar.spells.spellSlots[1].used).toBe(1);
    
    // Recover it
    const recoveredChar = characterService.recoverSpellSlot(consumedChar, 1);
    expect(recoveredChar.spells.spellSlots[1].used).toBe(0);
  });

  it('should handle long rest', () => {
    const character = characterService.createCharacter(mockParams);
    const consumedChar = characterService.consumeSpellSlot(character, 1);
    
    const restedChar = characterService.longRest(consumedChar);
    expect(restedChar.spells.spellSlots[1].used).toBe(0);
  });

  it('should handle concentration', () => {
    const character = characterService.createCharacter(mockParams);
    const spellId = 'haste';
    
    const concentratingChar = characterService.startConcentration(character, spellId);
    const condition = concentratingChar.conditions.find(c => c.id === 'Concentrating');
    expect(condition).toBeDefined();
    expect(condition?.source).toBe(spellId);
    
    const endedChar = characterService.endConcentration(concentratingChar);
    expect(endedChar.conditions.find(c => c.id === 'Concentrating')).toBeUndefined();
  });

  it('should handle learning and unlearning spells', () => {
    const character = characterService.createCharacter(mockParams);
    const spellId = 'magic-missile';
    
    // Learn
    const learnedChar = characterService.learnSpell(character, spellId);
    expect(learnedChar.spells.classSpellcasting['Wizard'].knownSpells).toContain(spellId);
    
    // Unlearn (should also remove from prepared)
    const preparedChar = characterService.prepareSpell(learnedChar, spellId);
    expect(preparedChar.spells.classSpellcasting['Wizard'].preparedSpells).toContain(spellId);
    
    const unlearnedChar = characterService.unlearnSpell(preparedChar, spellId);
    expect(unlearnedChar.spells.classSpellcasting['Wizard'].knownSpells).not.toContain(spellId);
    expect(unlearnedChar.spells.classSpellcasting['Wizard'].preparedSpells).not.toContain(spellId);
  });
});
