import { ContentPackManager } from '@open20/content/manager';
import { srdContentPack } from '@open20/content-srd';

/**
 * Shared ContentPackManager instance for the rulebook app.
 * This ensures all stores use the same manager with built-in packs registered.
 */
const manager = new ContentPackManager();

// Register built-in content packs (read-only)
manager.registerBuiltInPack(srdContentPack);

export default manager;
