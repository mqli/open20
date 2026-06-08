import type { Spell } from 'open20-core';
import type { AppCharacter } from './types';
import { dataLoader, initDataLoader, isDataLoaderReady } from './data-loader';

import {
  getSpell as getSpellData,
  searchSpells,
  getSpellsByClass,
  getSpellsForCharacter,
  getPreparedSpells,
  isSpellPrepared,
  knowsSpell,
  canCastSpell,
} from 'open20-core/spells';

import type { SpellFilter } from 'open20-core/spells';

interface SpellSearchFilter {
  query?: string;
  level?: number;
  classes?: string[];
}

/**
 * Service for querying and managing spells.
 * Wraps open20-core query functions with async initialisation.
 *
 * Data normalisation now happens at the source (`@open20/content-srd`),
 * so `dataLoader.getAllSpells()` is guaranteed to return properly-typed
 * `Spell[]` — no `SchemaService` transform step is needed.
 */
export class SpellService {
  private initialized = false;

  async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    await initDataLoader();
    this.initialized = true;
  }

  isReady(): boolean {
    return isDataLoaderReady();
  }

  /** All spells — already normalised by content-srd */
  getAllSpells(): Spell[] {
    if (!this.initialized) return [];
    return dataLoader.getAllSpells();
  }

  getSpell(id: string): Spell | undefined {
    return getSpellData(id, dataLoader);
  }

  searchSpells(filter: SpellSearchFilter): Spell[] {
    if (!this.initialized) return [];

    const coreFilter: SpellFilter = {};
    if (filter.query) coreFilter.name = filter.query;
    if (filter.level !== undefined) coreFilter.level = [filter.level as Spell['level']];
    if (filter.classes && filter.classes.length > 0) coreFilter.class = filter.classes;

    return searchSpells(coreFilter, dataLoader);
  }

  getSpellsForCharacter(character: AppCharacter): Spell[] {
    return getSpellsForCharacter(character, dataLoader);
  }

  getPreparedSpellsForCharacter(character: AppCharacter): Spell[] {
    return getPreparedSpells(character, dataLoader);
  }

  isSpellPrepared(character: AppCharacter, spellId: string): boolean {
    return isSpellPrepared(character, spellId);
  }

  isSpellKnown(character: AppCharacter, spellId: string): boolean {
    return knowsSpell(character, spellId);
  }

  canCastSpell(character: AppCharacter, spell: Spell): boolean {
    return canCastSpell(character, spell);
  }

  getSpellsByClass(classId: string): Spell[] {
    return getSpellsByClass(classId, dataLoader);
  }

  isSpellForCharacter(character: AppCharacter, spell: Spell): boolean {
    const characterClassIds = character.classes?.map((c) => c.classId.toLowerCase()) ?? [];
    return spell.classes?.some((c) => characterClassIds.includes(c.toLowerCase())) ?? false;
  }
}

export const spellService = new SpellService();
