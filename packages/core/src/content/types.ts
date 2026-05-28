// content/types.ts
// ContentPack and ContentPackMeta interfaces for content management (R26)

import type { Species } from '@open20/core/types/species';
import type { Background } from '@open20/core/types/background';
import type { Class, Subclass } from '@open20/core/types/class';
import type { Feat } from '@open20/core/types/feat';
import type { Weapon, Armor, GearItem } from '@open20/core/types/equipment';
import type { Spell } from '@open20/core/types/spell';
import type { Monster } from '@open20/core/monster/types';

/**
 * Content pack metadata.
 * Stored in `meta.json` for directory-based content packs,
 * or `meta` field for unified ContentPack objects.
 */
export interface ContentPackMeta {
  id: string; // Unique content pack ID (e.g., 'srd-5.2', 'phb-2024')
  name: string; // Display name (e.g., 'SRD 5.2')
  version: string; // SemVer (e.g., '1.0.0')
  source: string; // Tag for all content in this pack (e.g., 'SRD 5.2')
  author?: string; // Author name
  url?: string; // Link to source
  priority?: number; // Higher = wins ID conflicts (default: 0)
}

/**
 * Unified content pack format (for import/export).
 * When distributing content packs, this single object can be serialized to JSON.
 * For maintenance, content is kept in separate files (meta.json, species.json, etc.)
 */
export interface ContentPack {
  meta: ContentPackMeta;
  species?: Species[];
  backgrounds?: Background[];
  classes?: Class[];
  subclasses?: Subclass[];
  feats?: Feat[];
  spells?: Spell[];
  weapons?: Weapon[];
  armor?: Armor[];
  gear?: GearItem[];
  monsters?: Monster[];
}
