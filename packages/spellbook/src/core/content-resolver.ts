// content-resolver.ts
// Replaces data-loader.ts — resolves character deps from merged content pack
//
// Phase 6 of DataLoader removal: spellbook consumer migration.
// Core functions now take RecomputeDerivedStatsDeps (explicit resolved inputs)
// instead of DataLoader (runtime lookup).

import type { ContentPack } from 'open20-core/content';
import type { RecomputeDerivedStatsDeps, Character } from 'open20-core';
import type {
  Class,
  Species,
  Background,
  Feat,
  Spell,
  Weapon,
  Armor,
  Gear,
  Subclass,
} from 'open20-core';
import { mergeContentPacks } from '@open20/content-srd/merge';
import { srdContentPack } from '@open20/content-srd';
import { resolveCharacterDeps } from '@open20/content-srd/query/resolve';
import { storageService } from './storage-service';

// ── Singleton merged content pack ──────────────────────────

let mergedPack: ContentPack | null = null;
let initPromise: Promise<ContentPack> | null = null;

/**
 * Build a custom ContentPack from user-saved classes and subclasses.
 * Mirrors the structure of an SRD ContentPack so mergeContentPacks
 * can handle it transparently.
 */
function buildCustomContentPack(): ContentPack {
  const entries = storageService.loadCustomClasses();
  const classes = entries.map((e) => e.class);
  const subclasses = entries.flatMap((e) => e.subclasses);

  return {
    meta: {
      id: 'custom-classes',
      name: 'Custom Classes',
      version: '1.0.0',
      source: 'Homebrew',
      priority: 100, // Higher than SRD so custom classes win ID conflicts
    },
    classes: classes.length > 0 ? classes : undefined,
    subclasses: subclasses.length > 0 ? subclasses : undefined,
  };
}

/**
 * Initialize the content resolver.
 * Merges all registered content packs into a single pack for lookups.
 *
 * SRD pack is merged with any user-created custom classes/subclasses.
 * In the future, third-party content packs can also be loaded here.
 */
export async function initContent(): Promise<void> {
  if (mergedPack) return;
  if (initPromise) {
    await initPromise;
    return;
  }

  initPromise = (async () => {
    const customPack = buildCustomContentPack();
    mergedPack = mergeContentPacks([srdContentPack, customPack]);
    return mergedPack;
  })();

  await initPromise;
}

/**
 * Force re-merge the content pack (e.g. after custom classes/subclasses change).
 * Clears the cached merged pack and rebuilds it.
 */
export async function reinitContent(): Promise<void> {
  mergedPack = null;
  initPromise = null;
  return initContent();
}

/**
 * Get the merged content pack.
 * Throws if initContent() hasn't been called.
 */
export function getContentPack(): ContentPack {
  if (!mergedPack) {
    throw new Error('Content not initialized. Call initContent() first.');
  }
  return mergedPack;
}

// ── Entity getters (replaces dataLoader.getClass, dataLoader.getAllClasses, etc.) ──

/** Get all classes from the merged content pack. */
export function getAllClasses(): Class[] {
  return getContentPack().classes ?? [];
}

/** Get a class by ID. */
export function getClass(id: string): Class | undefined {
  return getContentPack().classes?.find((c) => c.id === id);
}

/** Get all species from the merged content pack. */
export function getAllSpecies(): Species[] {
  return getContentPack().species ?? [];
}

/** Get a species by ID. */
export function getSpecies(id: string): Species | undefined {
  return getContentPack().species?.find((s) => s.id === id);
}

/** Get all backgrounds from the merged content pack. */
export function getAllBackgrounds(): Background[] {
  return getContentPack().backgrounds ?? [];
}

/** Get a background by ID. */
export function getBackground(id: string): Background | undefined {
  return getContentPack().backgrounds?.find((b) => b.id === id);
}

/** Get all feats from the merged content pack. */
export function getAllFeats(): Feat[] {
  return getContentPack().feats ?? [];
}

/** Get a feat by ID. */
export function getFeat(id: string): Feat | undefined {
  return getContentPack().feats?.find((f) => f.id === id);
}

/** Get all spells from the merged content pack. */
export function getAllSpells(): Spell[] {
  return getContentPack().spells ?? [];
}

/** Get a spell by ID. */
export function getSpell(id: string): Spell | undefined {
  return getContentPack().spells?.find((s) => s.id === id);
}

/** Get all subclasses from the merged content pack. */
export function getAllSubclasses(): Subclass[] {
  return getContentPack().subclasses ?? [];
}

/** Get a subclass by ID. */
export function getSubclass(id: string): Subclass | undefined {
  return getContentPack().subclasses?.find((s) => s.id === id);
}

/** Get all weapons from the merged content pack. */
export function getAllWeapons(): Weapon[] {
  return getContentPack().weapons ?? [];
}

/** Get all armors from the merged content pack. */
export function getAllArmors(): Armor[] {
  return getContentPack().armors ?? [];
}

/** Get all gears items from the merged content pack. */
export function getAllGear(): Gear[] {
  return getContentPack().gears ?? [];
}

// ── Deps resolution ───────────────────────────────────────

/**
 * Resolve a character's RecomputeDerivedStatsDeps from the merged content pack.
 *
 * Looks up all entities referenced by the character (species, background,
 * classes, subclasses, feats, equipment, spells) and returns a deps bag
 * that core functions can use without further lookups.
 */
export function resolveDeps(character: Character): RecomputeDerivedStatsDeps {
  const pack = getContentPack();
  return resolveCharacterDeps(character, pack);
}

/**
 * Build RecomputeDerivedStatsDeps for character creation.
 *
 * Unlike resolveDeps (which reads IDs from an existing Character),
 * this builds deps from the creation params (speciesId, backgroundId, classId).
 */
export function buildDepsForCreate(params: {
  speciesId: string;
  backgroundId: string;
  classId: string;
  subclassId?: string | null;
}): RecomputeDerivedStatsDeps {
  const pack = getContentPack();

  const species = pack.species?.find((s) => s.id === params.speciesId);
  const background = pack.backgrounds?.find((b) => b.id === params.backgroundId);
  const klass = pack.classes?.find((c) => c.id === params.classId);

  const deps: RecomputeDerivedStatsDeps = {
    classes: {},
  };

  if (species) deps.species = species;
  if (background) deps.background = background;
  if (klass) deps.classes = { [klass.id]: klass };

  if (params.subclassId && klass) {
    const sub = pack.subclasses?.find((s) => s.id === params.subclassId);
    if (sub) deps.subclasses = { [sub.id]: sub };
  }

  return deps;
}
