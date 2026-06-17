import type { ContentPack } from 'open20-core';
import type { EditableContentPack } from '../types/content-pack';
import type { ContentPackMeta } from 'open20-core';
import type { IStorage } from '../storage/istorage';
import { IndexedDBStorage } from '../storage/indexeddb-storage';

/**
 * Headless class for content pack CRUD operations.
 * Wraps IStorage and provides the API for creating, loading, saving,
 * listing, enabling/disabling, and deleting content packs.
 *
 * Supports both user-created packs (stored in IndexedDB) and
 * built-in packs (provided at construction time, read-only).
 */
export class ContentPackManager {
  private storage: IStorage;
  private packs: Map<string, EditableContentPack>; // in-memory cache for user packs
  private disabledPacks: Set<string>; // disabled pack IDs
  private builtInPacks: Map<string, ContentPack>; // built-in packs (read-only)

  constructor(storage?: IStorage, builtInPacks?: ContentPack[]) {
    this.storage = storage ?? new IndexedDBStorage();
    this.packs = new Map();
    this.disabledPacks = new Set();
    this.builtInPacks = new Map();

    // Register built-in packs
    if (builtInPacks) {
      for (const pack of builtInPacks) {
        this.builtInPacks.set(pack.meta.id, pack);
      }
    }
  }

  /**
   * Register a built-in content pack (read-only, not stored in IndexedDB).
   * Built-in packs are always available and cannot be modified or deleted.
   */
  registerBuiltInPack(pack: ContentPack): void {
    this.builtInPacks.set(pack.meta.id, pack);
  }

  /**
   * Check if a pack is a built-in pack.
   */
  isBuiltInPack(id: string): boolean {
    return this.builtInPacks.has(id);
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
   * Load a pack by ID.
   * Checks built-in packs first, then falls back to storage.
   * Returns null if not found.
   * For user packs, also loads into in-memory cache.
   */
  async loadPack(packId: string): Promise<ContentPack | null> {
    // Check built-in packs first
    const builtInPack = this.builtInPacks.get(packId);
    if (builtInPack) {
      return builtInPack;
    }

    // Fall back to storage
    const pack = await this.storage.loadPack(packId);

    if (pack !== null) {
      // Update cache
      this.packs.set(packId, pack);
    }

    return pack;
  }

  /**
   * Persist a pack to storage and update in-memory cache.
   * Throws an error if trying to save a built-in pack.
   */
  async savePack(pack: EditableContentPack): Promise<void> {
    if (this.isBuiltInPack(pack.meta.id)) {
      throw new Error(`Cannot save built-in pack: ${pack.meta.id}. Built-in packs are read-only.`);
    }

    await this.storage.savePack(pack);

    // Update cache
    this.packs.set(pack.meta.id, pack);
  }

  /**
   * List metadata of all known packs.
   * Includes both built-in packs and user-created packs from storage.
   */
  async listPacks(): Promise<ContentPackMeta[]> {
    const storagePacks = await this.storage.listPacks();

    // Add built-in pack metadata
    const builtInMetas = Array.from(this.builtInPacks.values()).map((pack) => pack.meta);

    // Merge, avoiding duplicates (built-in packs take precedence)
    const metaMap = new Map<string, ContentPackMeta>();

    // Add storage packs first
    for (const meta of storagePacks) {
      metaMap.set(meta.id, meta);
    }

    // Override with built-in packs (they might have the same ID if user imported them)
    for (const meta of builtInMetas) {
      metaMap.set(meta.id, meta);
    }

    return Array.from(metaMap.values());
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
   * Throws an error if trying to delete a built-in pack.
   */
  async deletePack(id: string): Promise<void> {
    if (this.isBuiltInPack(id)) {
      throw new Error(`Cannot delete built-in pack: ${id}. Built-in packs are read-only.`);
    }

    await this.storage.deletePack(id);

    // Remove from cache
    this.packs.delete(id);

    // Remove from disabled set
    this.disabledPacks.delete(id);
  }
}
