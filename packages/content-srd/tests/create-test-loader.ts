import { createDataLoader } from 'open20-core';
import { srdContentPack } from '../src/index';

/**
 * Creates a DataLoader with SRD content registered.
 * Use this in tests that need real SRD data.
 */
export function createTestLoader() {
  const loader = createDataLoader();
  loader.registerContentPack(srdContentPack);
  return loader;
}
