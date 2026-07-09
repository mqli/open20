// spell-service.ts
// Service for querying and managing spells.
// Uses content-srd query functions (take ContentPack, not DataLoader).

import type { Spell } from 'open20-core';
import type { AppCharacter } from './types';
import { initContent, getContentPack } from './content-resolver';
import { knowsSpell, isSpellPreparedForClass, sortSpells } from 'open20-core/spells';

/**
 * Service for querying and managing spells.
 * Wraps @open20/content-srd query functions.
 */
export class SpellService {
  async ensureInitialized(): Promise<void> {
    await initContent();
  }

  isReady(): boolean {
    try {
      getContentPack();
      return true;
    } catch {
      return false;
    }
  }

  /** All spells from the merged content pack. */
  getAllSpells(): Spell[] {
    if (!this.isReady()) return [];
    const pack = getContentPack();
    return sortSpells(pack.spells ?? []);
  }

  getSpell(id: string): Spell | undefined {
    if (!this.isReady()) return undefined;
    const pack = getContentPack();
    return pack.spells?.find((s) => s.id === id);
  }

  searchSpells(filter: { query?: string; level?: number; classes?: string[] }): Spell[] {
    if (!this.isReady()) return [];
    const pack = getContentPack();
    const spells = pack.spells ?? [];
    const filtered = spells.filter((s) => {
      if (filter.query) {
        if (!s.name.toLowerCase().includes(filter.query.toLowerCase())) return false;
      }
      if (filter.level !== undefined) {
        if (s.level !== filter.level) return false;
      }
      if (filter.classes && filter.classes.length > 0) {
        if (!s.classes?.some((c) => filter.classes!.includes(c))) return false;
      }
      return true;
    });
    return sortSpells(filtered);
  }

  getSpellsByClass(classId: string): Spell[] {
    if (!this.isReady()) return [];
    const pack = getContentPack();
    return sortSpells(pack.spells?.filter((s) => s.classes?.includes(classId)) ?? []);
  }

  /** Check if a spell is known by any of the character's classes. */
  isSpellForCharacter(character: AppCharacter, spell: Spell): boolean {
    const classIds = character.classes?.map((c) => c.classId) ?? [];
    return spell.classes?.some((c) => classIds.includes(c)) ?? false;
  }

  /** Check if a spell is known by the character (in any class's known spells). */
  isSpellKnown(character: AppCharacter, spellId: string): boolean {
    return knowsSpell(character as unknown as import('open20-core').Character, spellId);
  }

  /**
   * Check if a spell is prepared for a specific class.
   * If classId is not provided, checks if the spell is prepared for any class.
   */
  isSpellPrepared(character: AppCharacter, spellId: string, classId?: string): boolean {
    if (classId) {
      return isSpellPreparedForClass(
        character as unknown as import('open20-core').Character,
        classId,
        spellId,
      );
    }
    // Check all classes
    const classIds = character.classes?.map((c) => c.classId) ?? [];
    return classIds.some((cid) =>
      isSpellPreparedForClass(
        character as unknown as import('open20-core').Character,
        cid,
        spellId,
      ),
    );
  }
}

// Create default instance (will be replaced in tests)
export const spellService = new SpellService();
