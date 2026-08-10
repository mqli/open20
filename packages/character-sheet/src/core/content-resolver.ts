// content-resolver.ts (T-005)
// Thin app-level singleton over @open20/content-srd.
// - Builds RecomputeDerivedStatsDeps for core functions.
// - Resolves content IDs to display names.
// SRD-only for now; a homebrew-merge seam can be added later (see spellbook).

import type { ContentPack } from 'open20-core/content';
import type {
  RecomputeDerivedStatsDeps,
  Character,
  Class,
  Subclass,
  Species,
  Background,
  Feat,
  Spell,
  AbilityName,
  Weapon,
  Armor,
  Gear,
} from 'open20-core';
import { srdContentPack } from '@open20/content-srd';
import { resolveCharacterDeps } from '@open20/content-srd/query/resolve';
import {
  findSpecies,
  findBackground,
  findClass,
  findSubclass,
  findFeat,
  getSpecies,
  getBackgrounds,
  getClasses,
  getSubclassesForClass,
  getFeats,
  getSensesForCharacter,
  getLanguagesForCharacter,
  getSizeForCharacter,
  getWeapons,
  getArmors,
  getGearItems,
} from '@open20/content-srd/query/catalog';
import { findSpell } from '@open20/content-srd/query/spells';
import type { SenseInfo } from '@open20/content-srd/query/catalog';

// ── Singleton content pack ────────────────────────────────
// The SRD pack is a bundled constant (statically imported JSON), so init is
// synchronous. The async lifecycle spellbook uses only exists to merge
// homebrew packs — not needed here yet.

let pack: ContentPack | null = null;

export function initContent(): void {
  if (pack) return;
  pack = srdContentPack;
}

export function getContentPack(): ContentPack {
  if (!pack) {
    throw new Error('Content not initialized. Call initContent() first.');
  }
  return pack;
}

// ── Deps resolution ───────────────────────────────────────

/** Resolve a character's deps bag from the content pack. */
export function resolveDeps(character: Character): RecomputeDerivedStatsDeps {
  return resolveCharacterDeps(character, getContentPack());
}

/** Build deps for character creation (from params, before a Character exists). */
export function buildDepsForCreate(params: {
  speciesId: string;
  backgroundId: string;
  classId: string;
  subclassId?: string | null;
  additionalClasses?: Array<{ classId: string; level: number; subclassId?: string }>;
}): RecomputeDerivedStatsDeps {
  const p = getContentPack();
  const deps: RecomputeDerivedStatsDeps = { classes: {} };

  const species = findSpecies(params.speciesId, p);
  if (species) deps.species = species;
  const background = findBackground(params.backgroundId, p);
  if (background) deps.background = background;
  const klass = findClass(params.classId, p);
  if (klass) deps.classes = { [klass.id]: klass };

  for (const additional of params.additionalClasses ?? []) {
    const ak = findClass(additional.classId, p);
    if (ak) deps.classes[ak.id] = ak;
  }

  // Subclasses must be resolved too — core reads deps.subclasses for subclass
  // features and always-prepared spells (e.g. Life Domain domain spells).
  const subclasses: Record<string, Subclass> = {};
  const addSubclass = (id: string | null | undefined): void => {
    if (!id) return;
    const sub = findSubclass(id, p);
    if (sub) subclasses[sub.id] = sub;
  };
  addSubclass(params.subclassId);
  for (const additional of params.additionalClasses ?? []) {
    addSubclass(additional.subclassId);
  }
  if (Object.keys(subclasses).length > 0) deps.subclasses = subclasses;

  return deps;
}

/**
 * Class-proficiency lookup for `rollCharacterSavingThrow`, which needs
 * `(id) => { savingThrowProficiencies } | undefined`.
 */
export function getClass(
  id: string,
): { savingThrowProficiencies: readonly AbilityName[] } | undefined {
  return findClass(id, getContentPack());
}

// ── Entity getters (for pickers / panels) ─────────────────

export const getAllSpecies = (): Species[] => getSpecies(getContentPack());
export const getAllBackgrounds = (): Background[] => getBackgrounds(getContentPack());
export const getAllClasses = (): Class[] => getClasses(getContentPack());
export const getAllSubclassesForClass = (classId: string): Subclass[] =>
  getSubclassesForClass(classId, getContentPack());
export const getAllFeats = (): Feat[] => getFeats(getContentPack());
export const getSpell = (id: string): Spell | undefined => findSpell(id, getContentPack());

// ── Equipment getters ─────────────────────────────────────

export const getAllWeapons = (): Weapon[] => getWeapons(getContentPack());
export const getAllArmors = (): Armor[] => getArmors(getContentPack());
export const getAllGearItems = (): Gear[] => getGearItems(getContentPack());

/** Look up a Species by its id (e.g. "Elf") — used by SpeciesPanel. */
export const getSpeciesById = (id: string): Species | undefined =>
  findSpecies(id, getContentPack());

/** Look up a Background by its id (e.g. "sage") — used by BackgroundPanel. */
export const getBackgroundById = (id: string): Background | undefined =>
  findBackground(id, getContentPack());

/** Look up a Class by its id (e.g. "Wizard") — used by ClassFeaturesPanel. */
export const getClassById = (id: string): Class | undefined => findClass(id, getContentPack());

/** Look up a Feat by its id (e.g. "alert") — used by FeatList. */
export const getFeatById = (id: string): Feat | undefined => findFeat(id, getContentPack());

// ── Display-name resolution ───────────────────────────────

/** Humanize an ID as a last-resort fallback: 'high-elf' → 'High Elf'. */
function humanize(id: string): string {
  return id
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

// Species has no `name` field — its `id` IS the display label (e.g. "High Elf").
export const getSpeciesName = (id: string): string =>
  findSpecies(id, getContentPack()) ? id : humanize(id);
export const getClassName = (id: string): string =>
  findClass(id, getContentPack())?.name ?? humanize(id);
export const getBackgroundName = (id: string): string =>
  findBackground(id, getContentPack())?.name ?? humanize(id);
export const getFeatName = (id: string): string =>
  findFeat(id, getContentPack())?.name ?? humanize(id);
export const getSpellName = (id: string): string =>
  findSpell(id, getContentPack())?.name ?? humanize(id);

// ── Senses / languages / size (T-016) ────────────────────

export function getSpeciesSenses(character: { species: string }): readonly SenseInfo[] {
  return getSensesForCharacter(character, getContentPack());
}

export function getSpeciesLanguages(character: {
  species: string;
  background: string;
}): readonly string[] {
  return getLanguagesForCharacter(character, getContentPack());
}

export function getSpeciesSize(character: { species: string }): string {
  return getSizeForCharacter(character, getContentPack());
}
