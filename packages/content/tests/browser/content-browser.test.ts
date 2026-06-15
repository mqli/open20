import { describe, it, expect, beforeEach } from 'vitest';
import { ContentPackManager } from '../../src/manager';
import { ContentBrowser } from '../../src/browser';
import type { ContentPackMeta } from 'open20-core';
import type { Spell } from 'open20-core';

describe('ContentBrowser', () => {
  let manager: ContentPackManager;
  let browser: ContentBrowser;

  beforeEach(async () => {
    // Create a new manager for each test
    manager = new ContentPackManager();

    // Clear all packs from the database to prevent test interference
    const metas = await manager.listPacks();
    for (const meta of metas) {
      await manager.deletePack(meta.id);
    }

    browser = new ContentBrowser(manager);
  });

  const createTestMeta = (id: string): ContentPackMeta => ({
    id,
    name: `Test Pack ${id}`,
    version: '1.0.0',
    source: 'Test',
    author: 'Test Author',
    url: 'https://example.com',
    priority: 0,
  });

  const createTestSpell = (overrides: Partial<Spell> = {}): Spell => ({
    id: 'test-spell',
    name: 'Test Spell',
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: '60 feet',
    components: ['V', 'S'],
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: ['A test spell.'],
    source: 'Test',
    classes: ['wizard'],
    ...overrides,
  });

  describe('getAllSpells()', () => {
    it('should return spells from all enabled packs', async () => {
      // Create two packs with spells
      const pack1 = manager.createPack(createTestMeta('pack-1'));
      pack1.spells = [
        createTestSpell({ id: 'spell-1', name: 'Fireball' }),
        createTestSpell({ id: 'spell-2', name: 'Lightning Bolt' }),
      ];
      await manager.savePack(pack1);

      const pack2 = manager.createPack(createTestMeta('pack-2'));
      pack2.spells = [createTestSpell({ id: 'spell-3', name: 'Magic Missile' })];
      await manager.savePack(pack2);

      const spells = await browser.getAllSpells();

      expect(spells).toHaveLength(3);
      expect(spells.map((s) => s.id)).toContain('spell-1');
      expect(spells.map((s) => s.id)).toContain('spell-2');
      expect(spells.map((s) => s.id)).toContain('spell-3');
    });

    it('should exclude disabled packs', async () => {
      // Create two packs
      const pack1 = manager.createPack(createTestMeta('pack-1'));
      pack1.spells = [createTestSpell({ id: 'spell-1', name: 'Fireball' })];
      await manager.savePack(pack1);

      const pack2 = manager.createPack(createTestMeta('pack-2'));
      pack2.spells = [createTestSpell({ id: 'spell-2', name: 'Magic Missile' })];
      await manager.savePack(pack2);

      // Disable pack-2
      manager.disablePack('pack-2');

      const spells = await browser.getAllSpells();

      expect(spells).toHaveLength(1);
      expect(spells[0].id).toBe('spell-1');
    });

    it('should return empty array when no packs are enabled', async () => {
      const spells = await browser.getAllSpells();
      expect(spells).toEqual([]);
    });
  });

  describe('getSpellsByPack()', () => {
    it('should return spells for specific pack', async () => {
      const pack = manager.createPack(createTestMeta('pack-1'));
      pack.spells = [
        createTestSpell({ id: 'spell-1', name: 'Fireball' }),
        createTestSpell({ id: 'spell-2', name: 'Lightning Bolt' }),
      ];
      await manager.savePack(pack);

      const spells = await browser.getSpellsByPack('pack-1');

      expect(spells).toHaveLength(2);
      expect(spells[0].id).toBe('spell-1');
      expect(spells[1].id).toBe('spell-2');
    });

    it('should return spells for disabled pack (regardless of enabled/disabled state)', async () => {
      const pack = manager.createPack(createTestMeta('pack-1'));
      pack.spells = [createTestSpell({ id: 'spell-1', name: 'Fireball' })];
      await manager.savePack(pack);

      // Disable the pack
      manager.disablePack('pack-1');

      // Should still return spells
      const spells = await browser.getSpellsByPack('pack-1');

      expect(spells).toHaveLength(1);
      expect(spells[0].id).toBe('spell-1');
    });

    it('should return [] for nonexistent pack', async () => {
      const spells = await browser.getSpellsByPack('nonexistent');
      expect(spells).toEqual([]);
    });

    it('should return empty array for pack with no spells', async () => {
      const pack = manager.createPack(createTestMeta('pack-1'));
      // Don't add any spells
      await manager.savePack(pack);

      const spells = await browser.getSpellsByPack('pack-1');

      expect(spells).toEqual([]);
    });
  });

  describe('searchSpells()', () => {
    beforeEach(async () => {
      // Create a pack with test spells
      const pack = manager.createPack(createTestMeta('test-pack'));
      pack.spells = [
        createTestSpell({
          id: 'fireball',
          name: 'Fireball',
          level: 3,
          school: 'Evocation',
          source: 'SRD',
          classes: ['wizard', 'sorcerer'],
        }),
        createTestSpell({
          id: 'magic-missile',
          name: 'Magic Missile',
          level: 1,
          school: 'Evocation',
          source: 'SRD',
          classes: ['wizard', 'sorcerer'],
        }),
        createTestSpell({
          id: 'cure-wounds',
          name: 'Cure Wounds',
          level: 1,
          school: 'Abjuration',
          source: 'SRD',
          classes: ['cleric', 'druid', 'bard'],
        }),
        createTestSpell({
          id: 'fire-bolt',
          name: 'Fire Bolt',
          level: 0,
          school: 'Evocation',
          source: 'SRD',
          classes: ['wizard', 'sorcerer'],
        }),
        createTestSpell({
          id: 'heal',
          name: 'Heal',
          level: 6,
          school: 'Abjuration',
          source: 'SRD',
          classes: ['cleric'],
        }),
        createTestSpell({
          id: 'chromatic-orb',
          name: 'Chromatic Orb',
          level: 4,
          school: 'Evocation',
          source: 'Homebrew',
          classes: ['wizard'],
        }),
      ];
      await manager.savePack(pack);
    });

    it('should return all enabled spells for empty query', async () => {
      const results = await browser.searchSpells({});

      expect(results).toHaveLength(6);
    });

    it('should filter by name (case-insensitive substring match)', async () => {
      const results = await browser.searchSpells({ name: 'fire' });

      expect(results).toHaveLength(2);
      expect(results.map((s) => s.id)).toContain('fireball');
      expect(results.map((s) => s.id)).toContain('fire-bolt');
    });

    it('should filter by name (case-insensitive)', async () => {
      const results = await browser.searchSpells({ name: 'FIRE' });

      expect(results).toHaveLength(2);
      expect(results.map((s) => s.id)).toContain('fireball');
      expect(results.map((s) => s.id)).toContain('fire-bolt');
    });

    it('should filter by exact level match', async () => {
      const results = await browser.searchSpells({ level: 3 });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('fireball');
    });

    it('should filter by level range', async () => {
      const results = await browser.searchSpells({ levelRange: { min: 1, max: 3 } });

      // Should return Magic Missile (1), Cure Wounds (1), Fireball (3)
      expect(results).toHaveLength(3);
      expect(results.map((s) => s.id)).toContain('magic-missile');
      expect(results.map((s) => s.id)).toContain('cure-wounds');
      expect(results.map((s) => s.id)).toContain('fireball');
    });

    it('should filter by school (exact match)', async () => {
      const results = await browser.searchSpells({ school: 'Abjuration' });

      expect(results).toHaveLength(2);
      expect(results.map((s) => s.id)).toContain('cure-wounds');
      expect(results.map((s) => s.id)).toContain('heal');
    });

    it('should filter by classes (intersection)', async () => {
      const results = await browser.searchSpells({ classes: ['wizard'] });

      // Should return Fireball, Magic Missile, Fire Bolt, Chromatic Orb
      expect(results).toHaveLength(4);
      expect(results.map((s) => s.id)).toContain('fireball');
      expect(results.map((s) => s.id)).toContain('magic-missile');
      expect(results.map((s) => s.id)).toContain('fire-bolt');
      expect(results.map((s) => s.id)).toContain('chromatic-orb');
    });

    it('should filter by source (exact match)', async () => {
      const results = await browser.searchSpells({ source: 'Homebrew' });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('chromatic-orb');
    });

    it('should apply AND logic for multiple filters', async () => {
      const results = await browser.searchSpells({
        school: 'Evocation',
        level: 3,
      });

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('fireball');
    });

    it('should sort by name (default)', async () => {
      const results = await browser.searchSpells({});

      expect(results).toHaveLength(6);
      // Check sorted by name ascending
      for (let i = 1; i < results.length; i++) {
        expect(results[i].name.localeCompare(results[i - 1].name)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should sort by level', async () => {
      const results = await browser.searchSpells({
        sortBy: 'level',
        sortOrder: 'asc',
      });

      expect(results).toHaveLength(6);
      // Check sorted by level ascending
      for (let i = 1; i < results.length; i++) {
        expect(results[i].level).toBeGreaterThanOrEqual(results[i - 1].level);
      }
    });

    it('should sort by level descending', async () => {
      const results = await browser.searchSpells({
        sortBy: 'level',
        sortOrder: 'desc',
      });

      expect(results).toHaveLength(6);
      // Check sorted by level descending
      for (let i = 1; i < results.length; i++) {
        expect(results[i].level).toBeLessThanOrEqual(results[i - 1].level);
      }
    });

    it('should sort by school', async () => {
      const results = await browser.searchSpells({
        sortBy: 'school',
        sortOrder: 'asc',
      });

      expect(results).toHaveLength(6);
      // Check sorted by school ascending
      for (let i = 1; i < results.length; i++) {
        expect(results[i].school.localeCompare(results[i - 1].school)).toBeGreaterThanOrEqual(0);
      }
    });

    it('should exclude disabled packs from search results', async () => {
      // Create another pack with more spells
      const pack2 = manager.createPack(createTestMeta('pack-2'));
      pack2.spells = [
        createTestSpell({
          id: 'shield',
          name: 'Shield',
          level: 1,
          school: 'Abjuration',
          source: 'SRD',
          classes: ['wizard'],
        }),
      ];
      await manager.savePack(pack2);

      // Disable pack-2
      manager.disablePack('pack-2');

      const results = await browser.searchSpells({});

      // Should only return spells from test-pack
      expect(results).toHaveLength(6);
      expect(results.map((s) => s.id)).not.toContain('shield');
    });
  });
});
