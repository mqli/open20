import type { Spell, Monster, Species, Background, Feat } from 'open20-core';
import type {
  SpellQuery,
  MonsterQuery,
  SpeciesQuery,
  BackgroundQuery,
  FeatQuery,
} from '../types/query';
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

  // ── Monster methods ─────────────────────────────────────

  /**
   * Get all monsters across ALL enabled packs.
   * Disabled packs are excluded.
   */
  async getAllMonsters(): Promise<Monster[]> {
    const packs = await this.manager.listPacks();
    const monsters: Monster[] = [];

    for (const pack of packs) {
      if (!this.manager.isPackEnabled(pack.id)) {
        continue;
      }

      const loaded = await this.manager.loadPack(pack.id);
      if (loaded === null) {
        continue;
      }

      const packMonsters = loaded.monsters ?? [];
      monsters.push(...packMonsters);
    }

    return monsters;
  }

  /**
   * Get monsters from a specific pack (regardless of enabled/disabled state).
   * Returns [] if pack not found.
   */
  async getMonstersByPack(packId: string): Promise<Monster[]> {
    const pack = await this.manager.loadPack(packId);
    if (pack === null) {
      return [];
    }

    return pack.monsters ?? [];
  }

  /**
   * Search monsters across all enabled packs.
   *
   * Matching rules:
   * - name: case-insensitive substring match (fuzzy)
   * - type: exact match on creature type (e.g. 'Dragon', 'Humanoid')
   * - cr: exact challenge rating match (takes precedence over crRange)
   * - crRange: cr >= min AND cr <= max
   * - source: exact match on monster.source
   *
   * Combine: ALL provided filters must match (AND logic).
   *
   * Sort: by sortBy field (default 'name'), sortOrder (default 'asc').
   */
  async searchMonsters(query: MonsterQuery): Promise<Monster[]> {
    const monsters = await this.getAllMonsters();

    const filtered = monsters.filter((monster) => {
      // name filter (fuzzy match)
      if (query.name !== undefined && query.name !== '') {
        const nameLower = query.name.toLowerCase();
        const monsterNameLower = monster.name.toLowerCase();
        if (!monsterNameLower.includes(nameLower)) {
          return false;
        }
      }

      // type filter (exact match)
      if (query.type !== undefined && query.type !== '') {
        if (monster.type !== query.type) {
          return false;
        }
      }

      // cr filter (takes precedence over crRange)
      if (query.cr !== undefined) {
        const monsterCR =
          typeof monster.challengeRating?.rating === 'number' ? monster.challengeRating.rating : -1;
        if (monsterCR !== query.cr) {
          return false;
        }
      } else if (query.crRange !== undefined) {
        const monsterCR =
          typeof monster.challengeRating?.rating === 'number' ? monster.challengeRating.rating : -1;
        const { min, max } = query.crRange;
        if (monsterCR < min || monsterCR > max) {
          return false;
        }
      }

      // source filter
      if (query.source !== undefined && query.source !== '') {
        if (monster.source !== query.source) {
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
        case 'cr': {
          const aCR = typeof a.challengeRating?.rating === 'number' ? a.challengeRating.rating : -1;
          const bCR = typeof b.challengeRating?.rating === 'number' ? b.challengeRating.rating : -1;
          return multiplier * (aCR - bCR);
        }
        case 'type':
          return multiplier * a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    return filtered;
  }

  // ── Species methods ─────────────────────────────────────

  /**
   * Get all species across ALL enabled packs.
   * Disabled packs are excluded.
   */
  async getAllSpecies(): Promise<Species[]> {
    const packs = await this.manager.listPacks();
    const species: Species[] = [];

    for (const pack of packs) {
      if (!this.manager.isPackEnabled(pack.id)) {
        continue;
      }

      const loaded = await this.manager.loadPack(pack.id);
      if (loaded === null) {
        continue;
      }

      const packSpecies = loaded.species ?? [];
      species.push(...packSpecies);
    }

    return species;
  }

  /**
   * Get species from a specific pack (regardless of enabled/disabled state).
   */
  async getSpeciesByPack(packId: string): Promise<Species[]> {
    const pack = await this.manager.loadPack(packId);
    if (pack === null) {
      return [];
    }
    return pack.species ?? [];
  }

  /**
   * Search species across all enabled packs.
   */
  async searchSpecies(query: SpeciesQuery): Promise<Species[]> {
    const species = await this.getAllSpecies();

    const filtered = species.filter((s) => {
      if (query.name !== undefined && query.name !== '') {
        if (!s.id.toLowerCase().includes(query.name.toLowerCase())) {
          return false;
        }
      }
      if (query.size !== undefined) {
        if (s.size !== query.size) {
          return false;
        }
      }
      if (query.source !== undefined && query.source !== '') {
        if (s.source !== query.source) {
          return false;
        }
      }
      return true;
    });

    const sortBy = query.sortBy ?? 'name';
    const sortOrder = query.sortOrder ?? 'asc';
    const multiplier = sortOrder === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return multiplier * a.id.localeCompare(b.id);
        case 'size':
          return multiplier * a.size.localeCompare(b.size);
        default:
          return 0;
      }
    });

    return filtered;
  }

  // ── Background methods ──────────────────────────────────

  async getAllBackgrounds(): Promise<Background[]> {
    const packs = await this.manager.listPacks();
    const backgrounds: Background[] = [];

    for (const pack of packs) {
      if (!this.manager.isPackEnabled(pack.id)) {
        continue;
      }
      const loaded = await this.manager.loadPack(pack.id);
      if (loaded === null) {
        continue;
      }
      const packBackgrounds = loaded.backgrounds ?? [];
      backgrounds.push(...packBackgrounds);
    }
    return backgrounds;
  }

  async getBackgroundsByPack(packId: string): Promise<Background[]> {
    const pack = await this.manager.loadPack(packId);
    if (pack === null) return [];
    return pack.backgrounds ?? [];
  }

  async searchBackgrounds(query: BackgroundQuery): Promise<Background[]> {
    const backgrounds = await this.getAllBackgrounds();

    const filtered = backgrounds.filter((b) => {
      if (query.name !== undefined && query.name !== '') {
        const searchName = (b.name || b.id).toLowerCase();
        if (!searchName.includes(query.name.toLowerCase())) {
          return false;
        }
      }
      if (query.source !== undefined && query.source !== '') {
        if (b.source !== query.source) {
          return false;
        }
      }
      return true;
    });

    const sortBy = query.sortBy ?? 'name';
    const sortOrder = query.sortOrder ?? 'asc';
    const multiplier = sortOrder === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return multiplier * (a.name || a.id).localeCompare(b.name || b.id);
        default:
          return 0;
      }
    });

    return filtered;
  }

  // ── Feat methods ────────────────────────────────────────

  async getAllFeats(): Promise<Feat[]> {
    const packs = await this.manager.listPacks();
    const feats: Feat[] = [];

    for (const pack of packs) {
      if (!this.manager.isPackEnabled(pack.id)) {
        continue;
      }
      const loaded = await this.manager.loadPack(pack.id);
      if (loaded === null) {
        continue;
      }
      const packFeats = loaded.feats ?? [];
      feats.push(...packFeats);
    }
    return feats;
  }

  async getFeatsByPack(packId: string): Promise<Feat[]> {
    const pack = await this.manager.loadPack(packId);
    if (pack === null) return [];
    return pack.feats ?? [];
  }

  async searchFeats(query: FeatQuery): Promise<Feat[]> {
    const feats = await this.getAllFeats();

    const filtered = feats.filter((f) => {
      if (query.name !== undefined && query.name !== '') {
        const searchName = (f.name || f.id).toLowerCase();
        if (!searchName.includes(query.name.toLowerCase())) {
          return false;
        }
      }
      if (query.source !== undefined && query.source !== '') {
        if (f.source !== query.source) {
          return false;
        }
      }
      if (query.hasPrerequisite !== undefined) {
        const hasPrereq = !!f.prerequisites;
        if (hasPrereq !== query.hasPrerequisite) {
          return false;
        }
      }
      if (query.category !== undefined && query.category !== '') {
        if (f.category !== query.category) {
          return false;
        }
      }
      return true;
    });

    const sortBy = query.sortBy ?? 'name';
    const sortOrder = query.sortOrder ?? 'asc';
    const multiplier = sortOrder === 'asc' ? 1 : -1;

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return multiplier * (a.name || a.id).localeCompare(b.name || b.id);
        case 'category':
          return multiplier * a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    return filtered;
  }
}
