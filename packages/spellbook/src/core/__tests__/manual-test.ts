import { characterService } from '../character-service';

interface ConcentrationCondition {
  source?: string;
}

async function runTests() {
  console.log('Running manual integration tests...');

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

  try {
    const character = characterService.createCharacter(mockParams);
    console.log('✅ Character creation success');
    
    if (character.spells.classSpellcasting['Wizard'].spellSaveDC === 13) {
      console.log('✅ Spell DC calculation (13) success');
    } else {
      console.log('❌ Spell DC calculation failed. Expected 13, got:', character.spells.classSpellcasting['Wizard'].spellSaveDC);
    }

    if (character.spells.classSpellcasting['Wizard'].spellAttackBonus === 5) {
      console.log('✅ Spell Attack calculation (5) success');
    } else {
      console.log('❌ Spell Attack calculation failed. Expected 5, got:', character.spells.classSpellcasting['Wizard'].spellAttackBonus);
    }

    const spellId = 'fireball';
    const preparedChar = characterService.prepareSpell(character, spellId);
    if (preparedChar.spells.classSpellcasting['Wizard'].preparedSpells.includes(spellId)) {
      console.log('✅ Spell preparation success');
    }

    const consumedChar = characterService.consumeSpellSlot(character, 1);
    if (consumedChar.spells.spellSlots[1].used === 1) {
      console.log('✅ Slot consumption success');
    }

    const restedChar = characterService.longRest(consumedChar);
    if (restedChar.spells.spellSlots[1].used === 0) {
      console.log('✅ Long rest success');
    }

    const spellId2 = 'haste';
    const concentratingChar = characterService.startConcentration(character, spellId2);
    const concentrationCondition = concentratingChar.conditions.find(c => c.id === 'Concentrating');
    if (concentrationCondition && (concentrationCondition as ConcentrationCondition).source === spellId2) {
      console.log('✅ Concentration start success');
    } else {
      console.log('❌ Concentration failed. Conditions:', JSON.stringify(concentratingChar.conditions));
    }

  } catch (err) {
    console.error('❌ Tests failed with error:', err);
  }
}

runTests();
