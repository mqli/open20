import type { AppCharacter } from './types';
import { getModifier, getProficiencyBonus, getTotalScore, type AbilityName } from 'open20-core';

export interface ProjectedStats {
  abilityModifiers: Record<string, number>;
  spellSaveDC: number;
  spellAttackBonus: number;
  maxPreparedSpells: number;
  proficiencyBonus: number;
}

export class RulesService {
  static getProjectedStats(character: AppCharacter): ProjectedStats {
    const totalLevel = character.classes.reduce((sum, c) => sum + c.level, 0);
    const pb = getProficiencyBonus(totalLevel);

    const abilityModifiers: Record<string, number> = {};
    Object.entries(character.abilityScores.base).forEach(([ability]) => {
      abilityModifiers[ability] = getModifier(
        getTotalScore(character.abilityScores, ability as AbilityName),
      );
    });

    const classSpellcasting = character.spells.classSpellcasting;
    const primaryClassId = Object.keys(classSpellcasting)[0];
    const primaryClassSpells = primaryClassId ? classSpellcasting[primaryClassId] : undefined;

    const spellcastingAbility = primaryClassSpells?.spellcastingAbility ?? 'Intelligence';
    const spellMod = abilityModifiers[spellcastingAbility] ?? 0;

    // Sum maxPrepared across all spellcasting classes
    const maxPreparedSpells = Object.values(classSpellcasting).reduce(
      (sum, c) => sum + c.maxPrepared,
      0,
    );

    return {
      abilityModifiers,
      spellSaveDC: primaryClassSpells?.spellSaveDC ?? 8 + pb + spellMod,
      spellAttackBonus: primaryClassSpells?.spellAttackBonus ?? pb + spellMod,
      maxPreparedSpells,
      proficiencyBonus: pb,
    };
  }
}
