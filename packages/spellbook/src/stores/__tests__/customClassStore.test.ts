import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Class, Subclass } from 'open20-core';
import { useCustomClassStore, type CustomClassEntry } from '@/stores/customClassStore';

// ── Mock storage-service ──
vi.mock('@/core/storage-service', () => ({
  StorageService: vi.fn(),
  storageService: {
    loadCustomClasses: vi.fn(() => []),
    saveCustomClasses: vi.fn(),
    deleteCustomClass: vi.fn(),
    loadStandaloneSubclasses: vi.fn(() => []),
    saveStandaloneSubclasses: vi.fn(),
  },
}));

// ── Mock content-resolver ──
vi.mock('@/core/content-resolver', () => ({
  reinitContent: vi.fn(() => Promise.resolve()),
}));

// ── Mock characterStore ──
vi.mock('@/stores/characterStore', () => ({
  useCharacterStore: {
    getState: vi.fn(() => ({ characters: [], activeCharacter: null })),
    setState: vi.fn(),
  },
}));

// ── Mock character-service ──
vi.mock('@/core/character-service', () => ({
  characterService: {
    recompute: vi.fn((c: unknown) => c),
  },
}));

// ── Helpers ──

function makeClass(id: string, name: string): Class {
  return {
    id,
    name,
    source: 'Homebrew',
    hitDie: 'd8',
    savingThrowProficiencies: [],
    armorTraining: [],
    weaponMastery: false,
    featuresByLevel: [],
    spellcasting: {
      ability: 'Intelligence',
      knownSource: 'class_list',
      preparationTiming: 'long_rest',
      changesPerPreparation: 'all',
    },
  };
}

function makeSubclass(id: string, parentClass: string): Subclass {
  return {
    id,
    parentClass,
    grantedAtLevel: 1,
    featuresByLevel: [],
    source: 'Homebrew',
  };
}

function makeEntry(classId: string, className: string, ...subIds: string[]): CustomClassEntry {
  return {
    class: makeClass(classId, className),
    subclasses: subIds.map((sid) => makeSubclass(sid, classId)),
  };
}

describe('customClassStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCustomClassStore.setState({ classes: [], standaloneSubclasses: [] });
    vi.clearAllMocks();
  });

  // ── loadClasses ──

  describe('loadClasses', () => {
    it('should load classes and standalone subclasses from storage', async () => {
      const { storageService } = await import('@/core/storage-service');
      const entry = makeEntry('wizard', 'Wizard', 'evoker');
      const standaloneSub = makeSubclass('bladesinger', 'wizard');

      vi.mocked(storageService.loadCustomClasses).mockReturnValue([entry]);
      vi.mocked(storageService.loadStandaloneSubclasses).mockReturnValue([standaloneSub]);

      useCustomClassStore.getState().loadClasses();

      expect(useCustomClassStore.getState().classes).toEqual([entry]);
      expect(useCustomClassStore.getState().standaloneSubclasses).toEqual([standaloneSub]);
    });

    it('should load empty arrays when nothing stored', async () => {
      const { storageService } = await import('@/core/storage-service');
      vi.mocked(storageService.loadCustomClasses).mockReturnValue([]);
      vi.mocked(storageService.loadStandaloneSubclasses).mockReturnValue([]);

      useCustomClassStore.getState().loadClasses();

      expect(useCustomClassStore.getState().classes).toEqual([]);
      expect(useCustomClassStore.getState().standaloneSubclasses).toEqual([]);
    });
  });

  // ── saveClass ──

  describe('saveClass', () => {
    it('should add a new custom class entry', async () => {
      const { storageService } = await import('@/core/storage-service');
      const entry = makeEntry('wizard', 'Wizard', 'evoker');

      useCustomClassStore.getState().saveClass(entry);

      expect(useCustomClassStore.getState().classes).toEqual([entry]);
      expect(storageService.saveCustomClasses).toHaveBeenCalledWith([entry]);
    });

    it('should update an existing custom class entry (matched by id)', async () => {
      const { storageService } = await import('@/core/storage-service');
      const original = makeEntry('wizard', 'Original', 'evoker');
      const updated = makeEntry('wizard', 'Updated', 'evoker', 'illusionist');

      // Seed with original
      useCustomClassStore.setState({ classes: [original] });
      vi.clearAllMocks();

      useCustomClassStore.getState().saveClass(updated);

      expect(useCustomClassStore.getState().classes).toEqual([updated]);
      expect(storageService.saveCustomClasses).toHaveBeenCalledWith([updated]);
    });

    it('should keep existing entries when adding a new one', () => {
      const existing = makeEntry('cleric', 'Cleric', 'life');
      const newEntry = makeEntry('wizard', 'Wizard', 'evoker');

      useCustomClassStore.setState({ classes: [existing] });

      useCustomClassStore.getState().saveClass(newEntry);

      expect(useCustomClassStore.getState().classes).toEqual([existing, newEntry]);
    });
  });

  // ── deleteClass ──

  describe('deleteClass', () => {
    it('should delete a custom class by id', async () => {
      const { storageService } = await import('@/core/storage-service');
      const entry1 = makeEntry('wizard', 'Wizard', 'evoker');
      const entry2 = makeEntry('cleric', 'Cleric', 'life');

      useCustomClassStore.setState({ classes: [entry1, entry2] });

      useCustomClassStore.getState().deleteClass('wizard');

      expect(useCustomClassStore.getState().classes).toEqual([entry2]);
      expect(storageService.saveCustomClasses).toHaveBeenCalledWith([entry2]);
    });

    it('should not modify state when class id not found', async () => {
      const { storageService } = await import('@/core/storage-service');
      const entry = makeEntry('wizard', 'Wizard', 'evoker');

      useCustomClassStore.setState({ classes: [entry] });

      useCustomClassStore.getState().deleteClass('non-existent');

      expect(useCustomClassStore.getState().classes).toEqual([entry]);
      expect(storageService.saveCustomClasses).toHaveBeenCalledWith([entry]);
    });
  });

  // ── addSubclass ──

  describe('addSubclass', () => {
    it('should add a subclass to an existing custom class', async () => {
      const entry = makeEntry('wizard', 'Wizard', 'evoker');
      useCustomClassStore.setState({ classes: [entry] });

      const newSub = makeSubclass('illusionist', 'wizard');
      useCustomClassStore.getState().addSubclass('wizard', newSub);

      expect(useCustomClassStore.getState().classes[0].subclasses).toHaveLength(2);
      expect(useCustomClassStore.getState().classes[0].subclasses[1]).toEqual(newSub);
    });

    it('should not add duplicate subclass (matched by id)', () => {
      const entry = makeEntry('wizard', 'Wizard', 'evoker');
      useCustomClassStore.setState({ classes: [entry] });

      // Try to add same subclass again
      const duplicate = makeSubclass('evoker', 'wizard');
      useCustomClassStore.getState().addSubclass('wizard', duplicate);

      expect(useCustomClassStore.getState().classes[0].subclasses).toHaveLength(1);
    });

    it('should not modify state when class id not found', async () => {
      const entry = makeEntry('wizard', 'Wizard', 'evoker');
      useCustomClassStore.setState({ classes: [entry] });

      const newSub = makeSubclass('illusionist', 'non-existent');
      useCustomClassStore.getState().addSubclass('non-existent', newSub);

      expect(useCustomClassStore.getState().classes).toEqual([entry]);
    });
  });

  // ── updateSubclass ──

  describe('updateSubclass', () => {
    it('should update an existing subclass by id', async () => {
      const sub = makeSubclass('evoker', 'wizard');
      const entry = makeEntry('wizard', 'Wizard');
      entry.subclasses.push(sub);
      useCustomClassStore.setState({ classes: [entry] });

      const updated = { ...sub, source: 'Updated Source' };
      useCustomClassStore.getState().updateSubclass('wizard', updated);

      expect(useCustomClassStore.getState().classes[0].subclasses[0].source).toBe('Updated Source');
    });

    it('should not modify state when subclass not found', async () => {
      const sub = makeSubclass('evoker', 'wizard');
      const entry = makeEntry('wizard', 'Wizard');
      entry.subclasses.push(sub);
      useCustomClassStore.setState({ classes: [entry] });

      const nonExistent = makeSubclass('non-existent', 'wizard');
      useCustomClassStore.getState().updateSubclass('wizard', nonExistent);

      // Should still have only the original subclass
      expect(useCustomClassStore.getState().classes[0].subclasses).toHaveLength(1);
      expect(useCustomClassStore.getState().classes[0].subclasses[0].id).toBe('evoker');
    });
  });

  // ── deleteSubclass ──

  describe('deleteSubclass', () => {
    it('should delete a subclass by id', async () => {
      const sub1 = makeSubclass('evoker', 'wizard');
      const sub2 = makeSubclass('illusionist', 'wizard');
      const entry: CustomClassEntry = {
        class: makeClass('wizard', 'Wizard'),
        subclasses: [sub1, sub2],
      };
      useCustomClassStore.setState({ classes: [entry] });

      useCustomClassStore.getState().deleteSubclass('wizard', 'evoker');

      expect(useCustomClassStore.getState().classes[0].subclasses).toHaveLength(1);
      expect(useCustomClassStore.getState().classes[0].subclasses[0].id).toBe('illusionist');
    });

    it('should not modify state when class id not found', async () => {
      const sub = makeSubclass('evoker', 'wizard');
      const entry: CustomClassEntry = {
        class: makeClass('wizard', 'Wizard'),
        subclasses: [sub],
      };
      useCustomClassStore.setState({ classes: [entry] });

      useCustomClassStore.getState().deleteSubclass('non-existent', 'evoker');

      expect(useCustomClassStore.getState().classes[0].subclasses).toHaveLength(1);
    });
  });

  // ── addStandaloneSubclass ──

  describe('addStandaloneSubclass', () => {
    it('should add a new standalone subclass', async () => {
      const { storageService } = await import('@/core/storage-service');

      const sub = makeSubclass('bladesinger', 'wizard');
      useCustomClassStore.getState().addStandaloneSubclass('wizard', sub);

      expect(useCustomClassStore.getState().standaloneSubclasses).toHaveLength(1);
      expect(useCustomClassStore.getState().standaloneSubclasses[0].id).toBe('bladesinger');
      expect(useCustomClassStore.getState().standaloneSubclasses[0].parentClass).toBe('wizard');
      expect(storageService.saveStandaloneSubclasses).toHaveBeenCalled();
    });

    it('should override parentClass to ensure correctness', async () => {
      const sub = makeSubclass('bladesinger', 'wrong-parent');
      useCustomClassStore.getState().addStandaloneSubclass('wizard', sub);

      expect(useCustomClassStore.getState().standaloneSubclasses[0].parentClass).toBe('wizard');
    });

    it('should update an existing standalone subclass by id (dedup)', async () => {
      const original = makeSubclass('bladesinger', 'wizard');
      useCustomClassStore.setState({ standaloneSubclasses: [original] });

      const updated = makeSubclass('bladesinger', 'wizard');
      useCustomClassStore.getState().addStandaloneSubclass('wizard', updated);

      expect(useCustomClassStore.getState().standaloneSubclasses).toHaveLength(1);
    });

    it('should add a second standalone subclass for different id', async () => {
      const existing = makeSubclass('bladesinger', 'wizard');
      useCustomClassStore.setState({ standaloneSubclasses: [existing] });

      const newSub = makeSubclass('war-magic', 'wizard');
      useCustomClassStore.getState().addStandaloneSubclass('wizard', newSub);

      expect(useCustomClassStore.getState().standaloneSubclasses).toHaveLength(2);
    });
  });

  // ── deleteStandaloneSubclass ──

  describe('deleteStandaloneSubclass', () => {
    it('should delete a standalone subclass by parent class and id', async () => {
      const sub1 = makeSubclass('bladesinger', 'wizard');
      const sub2 = makeSubclass('war-magic', 'wizard');
      useCustomClassStore.setState({ standaloneSubclasses: [sub1, sub2] });

      useCustomClassStore.getState().deleteStandaloneSubclass('wizard', 'bladesinger');

      expect(useCustomClassStore.getState().standaloneSubclasses).toHaveLength(1);
      expect(useCustomClassStore.getState().standaloneSubclasses[0].id).toBe('war-magic');
    });

    it('should not delete when parentClass does not match', async () => {
      const sub = makeSubclass('bladesinger', 'wizard');
      useCustomClassStore.setState({ standaloneSubclasses: [sub] });

      useCustomClassStore.getState().deleteStandaloneSubclass('sorcerer', 'bladesinger');

      expect(useCustomClassStore.getState().standaloneSubclasses).toHaveLength(1);
    });
  });

  // ── afterStandaloneMutate ──

  describe('afterStandaloneMutate', () => {
    it('should call reinitContent', async () => {
      const { reinitContent } = await import('@/core/content-resolver');

      useCustomClassStore.getState().afterStandaloneMutate();

      expect(reinitContent).toHaveBeenCalled();
    });
  });
});
