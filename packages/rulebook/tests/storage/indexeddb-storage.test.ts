import { describe, it, expect, beforeEach } from 'vitest';
import { IndexedDBStorage } from '../../src/storage';
import type { EditableContentPack } from '../../src/types';

describe('IndexedDBStorage', () => {
  let storage: IndexedDBStorage;

  beforeEach(async () => {
    // Create a new storage instance for each test
    storage = new IndexedDBStorage();
    // Clear all packs from the database to prevent test interference
    const metas = await storage.listPacks();
    for (const meta of metas) {
      await storage.deletePack(meta.id);
    }
  });

  const createTestPack = (id: string): EditableContentPack => ({
    meta: {
      id,
      name: `Test Pack ${id}`,
      version: '1.0.0',
      source: 'Test',
      description: 'A test content pack',
    },
    spells: [],
  });

  it('should save and load a pack (round-trip)', async () => {
    const pack = createTestPack('test-1');

    await storage.savePack(pack);
    const loaded = await storage.loadPack('test-1');

    expect(loaded).not.toBeNull();
    expect(loaded?.meta.id).toBe('test-1');
    expect(loaded?.meta.name).toBe('Test Pack test-1');
    expect(loaded?.meta.version).toBe('1.0.0');
    expect(loaded?.meta.source).toBe('Test');
    expect(loaded?.meta.description).toBe('A test content pack');
  });

  it('should return null for missing pack', async () => {
    const result = await storage.loadPack('non-existent');
    expect(result).toBeNull();
  });

  it('should list packs (only meta)', async () => {
    const pack1 = createTestPack('list-1');
    const pack2 = createTestPack('list-2');

    await storage.savePack(pack1);
    await storage.savePack(pack2);

    const metas = await storage.listPacks();

    expect(metas).toHaveLength(2);
    expect(metas[0].id).toBe('list-1');
    expect(metas[1].id).toBe('list-2');
    // Verify only meta fields are returned (no spells array)
    expect('spells' in metas[0]).toBe(false);
  });

  it('should delete a pack', async () => {
    const pack = createTestPack('delete-1');

    await storage.savePack(pack);
    const loadedBefore = await storage.loadPack('delete-1');
    expect(loadedBefore).not.toBeNull();

    await storage.deletePack('delete-1');
    const loadedAfter = await storage.loadPack('delete-1');
    expect(loadedAfter).toBeNull();
  });

  it('should update an existing pack', async () => {
    const pack = createTestPack('update-1');
    await storage.savePack(pack);

    const updatedPack: EditableContentPack = {
      ...pack,
      meta: {
        ...pack.meta,
        name: 'Updated Name',
      },
    };
    await storage.savePack(updatedPack);

    const loaded = await storage.loadPack('update-1');
    expect(loaded?.meta.name).toBe('Updated Name');
  });
});
