import type { EditableContentPack } from '../types/content-pack';
import type { ContentPackMeta } from 'open20-core';
import type { IStorage } from '../storage/istorage';
import { IndexedDBStorage } from '../storage/indexeddb-storage';

/**
 * Headless class for content pack CRUD operations.
 * Wraps IStorage and provides the API for creating, loading, saving,
 * listing, enabling/disabling, and deleting content packs.
 */
export class ContentPackManager {
  private storage: IStorage;
  private packs: Map<string, EditableContentPack>; // in-memory cache
  private disabledPacks: Set<string>; // disabled pack IDs

  constructor(storage?: IStorage) {
    this.storage = storage ?? new IndexedDBStorage();
    this.packs = new Map();
    this.disabledPacks = new Set();
  }

  /**
   * Create a new content pack in memory.
   * Does NOT persist — call savePack() to store.
   * Initializes all 10 content type arrays as empty [].
   * glossary is left undefined (not an array).
   */
  createPack(meta: ContentPackMeta): EditableContentPack {
    const pack: EditableContentPack = {
      meta: { ...meta },
      species: [],
      backgrounds: [],
      classes: [],
      subclasses: [],
      feats: [],
      spells: [],
      weapons: [],
      armors: [],
      gears: [],
      monsters: [],
      // glossary is NOT initialized as empty array — it's a RulesGlossary object
    };

    // Store in cache
    this.packs.set(pack.meta.id, pack);

    return pack;
  }

  /**
   * Load a pack from storage by ID.
   * Returns null if not found.
   * Also loads into in-memory cache.
   */
  async loadPack(packId: string): Promise<EditableContentPack | null> {
    const pack = await this.storage.loadPack(packId);

    if (pack !== null) {
      // Update cache
      this.packs.set(packId, pack);
    }

    return pack;
  }

  /**
   * Persist a pack to storage and update in-memory cache.
   */
  async savePack(pack: EditableContentPack): Promise<void> {
    await this.storage.savePack(pack);

    // Update cache
    this.packs.set(pack.meta.id, pack);
  }

  /**
   * List metadata of all known packs.
   * Reads from storage (not just cache).
   */
  async listPacks(): Promise<ContentPackMeta[]> {
    return await this.storage.listPacks();
  }

  /**
   * Enable a pack (mark as active for ContentBrowser queries).
   */
  enablePack(id: string): void {
    this.disabledPacks.delete(id);
  }

  /**
   * Disable a pack (exclude from ContentBrowser queries, but keep in storage).
   */
  disablePack(id: string): void {
    this.disabledPacks.add(id);
  }

  /**
   * Check if a pack is currently enabled.
   */
  isPackEnabled(id: string): boolean {
    return !this.disabledPacks.has(id);
  }

  /**
   * Permanently delete a pack from storage and cache.
   */
  async deletePack(id: string): Promise<void> {
    await this.storage.deletePack(id);

    // Remove from cache
    this.packs.delete(id);

    // Remove from disabled set
    this.disabledPacks.delete(id);
  }
}
