import type { Spell } from 'open20-core';
import type { SpellQuery } from '../types/query';
import type { ContentPackManager } from '../manager/content-pack-manager';

export class ContentBrowser {
  private manager: ContentPackManager;

  constructor(manager: ContentPackManager) {
    this.manager = manager;
  }

  /**
   * Get all spells across ALL enabled packs.
   * Disabled packs are excluded.
   */
  async getAllSpells(): Promise<Spell[]> {
    const packs = await this.manager.listPacks();
    const spells: Spell[] = [];

    for (const pack of packs) {
      if (!this.manager.isPackEnabled(pack.id)) {
        continue;
      }

      const loaded = await this.manager.loadPack(pack.id);
      if (loaded === null) {
        continue;
      }

      const packSpells = loaded.spells ?? [];
      spells.push(...packSpells);
    }

    return spells;
  }

  /**
   * Get spells from a specific pack (regardless of enabled/disabled state).
   * Returns [] if pack not found.
   */
  async getSpellsByPack(packId: string): Promise<Spell[]> {
    const pack = await this.manager.loadPack(packId);
    if (pack === null) {
      return [];
    }

    return pack.spells ?? [];
  }

  /**
   * Search spells across all enabled packs.
   *
   * Matching rules:
   * - name: case-insensitive substring match (e.g., "fire" matches "Fireball")
   * - level: exact match (takes precedence over levelRange)
   * - levelRange: level >= min AND level <= max
   * - school: exact enum match
   * - classes: spell.classes intersects with query.classes
   * - source: exact match on spell.source
   *
   * Combine: ALL provided filters must match (AND logic).
   *
   * Sort: by sortBy field (default 'name'), sortOrder (default 'asc').
   */
  async searchSpells(query: SpellQuery): Promise<Spell[]> {
    const spells = await this.getAllSpells();

    // Apply filters (AND logic)
    const filtered = spells.filter((spell) => {
      // name filter
      if (query.name !== undefined && query.name !== '') {
        const nameLower = query.name.toLowerCase();
        const spellNameLower = spell.name.toLowerCase();
        if (!spellNameLower.includes(nameLower)) {
          return false;
        }
      }

      // level filter (takes precedence over levelRange)
      if (query.level !== undefined) {
        if (spell.level !== query.level) {
          return false;
        }
      } else if (query.levelRange !== undefined) {
        const { min, max } = query.levelRange;
        if (spell.level < min || spell.level > max) {
          return false;
        }
      }

      // school filter
      if (query.school !== undefined) {
        if (spell.school !== query.school) {
          return false;
        }
      }

      // classes filter
      if (query.classes !== undefined && query.classes.length > 0) {
        const spellClasses = [...(spell.classes ?? [])];
        const hasMatchingClass = query.classes.some((cls) => spellClasses.indexOf(cls) !== -1);
        if (!hasMatchingClass) {
          return false;
        }
      }

      // source filter
      if (query.source !== undefined && query.source !== '') {
        if (spell.source !== query.source) {
          return false;
        }
      }

      return true;
    });

    // Sort
    const sortBy = query.sortBy ?? 'name';
    const sortOrder = query.sortOrder ?? 'asc';
    const multiplier = sortOrder === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return multiplier * a.name.localeCompare(b.name);
        case 'level':
          return multiplier * (a.level - b.level);
        case 'school':
          return multiplier * a.school.localeCompare(b.school);
        default:
          return 0;
      }
    });

    return filtered;
  }
}
