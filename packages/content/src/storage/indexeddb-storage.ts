import type { IStorage } from './istorage';
import type { EditableContentPack } from '../types/content-pack';
import type { ContentPackMeta } from 'open20-core';

/**
 * Browser IndexedDB implementation of IStorage.
 *
 * Database: 'rulebook'
 * Object store: 'content-packs' (keyPath: 'meta.id')
 *
 * IndexedDB capacity: typically 50MB+ (browser-dependent).
 * Content pack size estimate: 10KB–500KB (JSON).
 */
export class IndexedDBStorage implements IStorage {
  private readonly dbName = 'rulebook';
  private readonly storeName = 'content-packs';
  private readonly dbVersion = 1;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    // Database opening is deferred to first operation
  }

  private openDb(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'meta.id' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(
          new Error(
            `Failed to open IndexedDB database '${this.dbName}': ${request.error?.message}`,
          ),
        );
      };
    });

    return this.dbPromise;
  }

  async savePack(pack: EditableContentPack): Promise<void> {
    const db = await this.openDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(pack);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(
          new Error(`Failed to save content pack '${pack.meta.id}': ${request.error?.message}`),
        );
      };

      transaction.onabort = () => {
        const errorMsg = transaction.error?.message || 'unknown reason';
        reject(
          new Error(`Transaction aborted while saving content pack '${pack.meta.id}': ${errorMsg}`),
        );
      };
    });
  }

  async loadPack(packId: string): Promise<EditableContentPack | null> {
    const db = await this.openDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(packId);

      request.onsuccess = () => {
        resolve((request.result as EditableContentPack) || null);
      };

      request.onerror = () => {
        reject(new Error(`Failed to load content pack '${packId}': ${request.error?.message}`));
      };
    });
  }

  async listPacks(): Promise<ContentPackMeta[]> {
    const db = await this.openDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();

      request.onsuccess = () => {
        const packs = request.result as EditableContentPack[];
        resolve(packs.map((pack) => pack.meta));
      };

      request.onerror = () => {
        reject(new Error(`Failed to list content packs: ${request.error?.message}`));
      };
    });
  }

  async deletePack(packId: string): Promise<void> {
    const db = await this.openDb();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(packId);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error(`Failed to delete content pack '${packId}': ${request.error?.message}`));
      };

      transaction.onabort = () => {
        const errorMsg = transaction.error?.message || 'unknown reason';
        reject(
          new Error(`Transaction aborted while deleting content pack '${packId}': ${errorMsg}`),
        );
      };
    });
  }
}
