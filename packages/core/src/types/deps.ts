// types/deps.ts
// Explicit dependency bags for core compute functions.
// These replace DataLoader — callers resolve by ID and pass resolved objects.
//
// Part of Phase 2 refactor: Remove DataLoader from open20-core.

import type { Species } from './species';
import type { Background } from './background';
import type { Class, Subclass } from './class';
import type { Feat } from './feat';
import type { Weapon, Armor, Gear } from './equipment';
import type { Spell } from './spell';

/**
 * Explicit dependency bag for recomputeDerivedStats.
 *
 * Core does NOT do any lookups — the caller resolves all entities
 * by ID and passes them here. Maps are keyed by ID for O(1) lookup.
 *
 * NOTE: `Character` stores IDs (serializable). This bag is the
 * resolution moment. `Character` itself is never mutated to hold refs.
 */
export interface RecomputeDerivedStatsDeps {
  // ── Singular resolved objects ─────────────────────
  species?: Species;
  background?: Background;

  // ── Maps keyed by ID ──────────────────────────
  // Engine maps char.classes[].classId → classes[classId] (O(1)).
  classes: Record<string, Class>;
  subclasses?: Record<string, Subclass>;
  feats?: Record<string, Feat>;

  // ── Equipment (keyed by EquipmentItem.id) ─────────
  weapons?: Record<string, Weapon>;
  armors?: Record<string, Armor>;
  gears?: Record<string, Gear>;

  // ── Spells (keyed by Spell.id) ───────────────────
  spells?: Record<string, Spell>;
}
