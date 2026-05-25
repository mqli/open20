import type { Spell } from 'open20-core';
import type { AppCharacter } from './types';
import { dataLoader } from './data-loader';

import { SchemaService } from './schema-service';
import { isSpellPrepared, knowsSpell } from 'open20-core';

interface SpellSearchFilter {
  query?: string;
  level?: number;
  classes?: string[];
}

/**
 * Service for querying and managing spells.
 * Ensures all spells are sanitized and normalized for use in the UI.
 */
export class SpellService {
  private cachedSpells: Spell[] | null = null;

  getAllSpells(): Spell[] {
    if (!this.cachedSpells) {
      const rawSpells = dataLoader.getAllSpells() as unknown as import('./schema-service').RawSpell[];
      this.cachedSpells = SchemaService.transformSpells(rawSpells);
    }
    return this.cachedSpells;
  }

  getSpell(id: string): Spell | undefined {
    return this.getAllSpells().find(s => s.id === id);
  }

  searchSpells(filter: SpellSearchFilter): Spell[] {
    let results = this.getAllSpells();
    
    if (filter?.query) {
      const q = filter.query.toLowerCase();
      results = results.filter(s => s.name.toLowerCase().includes(q));
    }

    if (filter?.level !== undefined) {
      results = results.filter(s => s.level === filter.level);
    }

    if (filter?.classes && filter.classes.length > 0) {
      results = results.filter(s => 
        s.classes?.some(c => filter.classes?.includes(c))
      );
    }
    
    return results;
  }

  getSpellsForCharacter(character: AppCharacter): Spell[] {
    void character;
    return this.getAllSpells();
  }

  isSpellPrepared(character: AppCharacter, spellId: string): boolean {
    const isManual = isSpellPrepared(character, spellId) ?? false;
    const isAlways = Object.values(character.spells.classSpellcasting).some(s => s.alwaysPreparedSpells?.includes(spellId)) ?? false;
    return isManual || isAlways;
  }

  isSpellKnown(character: AppCharacter, spellId: string): boolean {
    const spell = this.getSpell(spellId);
    if (!spell) return false;
    if (!this.isSpellForCharacter(character, spell)) return false;

    const isKnown = knowsSpell(character, spellId) ?? false;
    const isAlwaysPrepared = Object.values(character.spells.classSpellcasting).some(s => s.alwaysPreparedSpells?.includes(spellId)) ?? false;
    return isKnown || isAlwaysPrepared;
  }

  isSpellForCharacter(character: AppCharacter, spell: Spell): boolean {
    const characterClassIds = character.classes?.map(c => c.classId.toLowerCase()) ?? [];
    return spell.classes?.some(c => characterClassIds.includes(c.toLowerCase())) ?? false;
  }
}

// Export a default instance for easy use
export const spellService = new SpellService();
