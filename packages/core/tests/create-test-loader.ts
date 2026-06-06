import type { DataLoader } from '../src/data/loader';
import { createDataLoader } from '../src/data/default-loader';
import { srdContentPack } from '@open20/content-srd';

/**
 * Creates a DataLoader with SRD content pack registered.
 * Use this in tests instead of createDataLoader() to get a loader with SRD data.
 */
export function createTestLoader(): DataLoader {
  const loader = createDataLoader();
  loader.registerContentPack(srdContentPack);
  return loader;
}
