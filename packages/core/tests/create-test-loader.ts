import type { DataLoader } from '../src/data/loader';
import { createDataLoader } from '../src/data/default-loader';
import { mockContentPack } from './fixtures/mock-content-pack';

/**
 * Creates a DataLoader with mock content pack registered.
 * Use this in tests instead of createDataLoader() to get a loader with test data.
 */
export function createTestLoader(): DataLoader {
  const loader = createDataLoader();
  loader.registerContentPack(mockContentPack);
  return loader;
}
