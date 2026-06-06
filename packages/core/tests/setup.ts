// tests/setup.ts
// Registers SRD content pack for all tests
import { createDataLoader } from '../src/data/loader';
import { srdContentPack } from '@open20/content-srd';

const loader = createDataLoader();
loader.registerContentPack(srdContentPack);

// Export for tests that need a pre-configured loader
export { loader };
