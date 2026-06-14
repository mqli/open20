import type { EditableContentPack } from '../types/content-pack';
import type { ContentPackMeta } from 'open20-core';

export interface IStorage {
  savePack(pack: EditableContentPack): Promise<void>;
  loadPack(packId: string): Promise<EditableContentPack | null>;
  listPacks(): Promise<ContentPackMeta[]>;
  deletePack(packId: string): Promise<void>;
}
