// tests/setup.ts
// Mock data loader for all tests
import { createDataLoader } from '../src/data/loader';
import { mockContentPack } from './fixtures/mock-content-pack';

const loader = createDataLoader();
loader.registerContentPack(mockContentPack);

// Export for tests that need a pre-configured loader
export { loader };
