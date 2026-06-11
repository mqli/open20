// query/catalog.ts
// Catalog lookup helpers for all content types.
// All functions take a ContentPack (the merged pack), NOT DataLoader.

import type { ContentPack } from 'open20-core/content';
import type { Species, SpeciesSubtype } from 'open20-core';
import type { Background } from 'open20-core';
import type { Class, Subclass } from 'open20-core';
import type { Feat, FeatCategory } from 'open20-core';
import type { Weapon, Armor, GearItem } from 'open20-core';

// ── Species ───────────────────────────────────────

/** Find a species by ID. */
export function findSpecies(id: string, pack: ContentPack): Species | undefined {
  return pack.species?.find((s) => s.id === id);
}

/** Find a species subtype by species ID + subtype ID. */
export function findSpeciesSubtype(
  speciesId: string,
  subtypeId: string,
  pack: ContentPack,
): SpeciesSubtype | undefined {
  const species = findSpecies(speciesId, pack);
  return species?.subtypes?.find((st) => st.id === subtypeId);
}

/** Get all species from a pack. */
export function getSpecies(pack: ContentPack): Species[] {
  return pack.species ?? [];
}

/** Get all species matching a source tag. */
export function getSpeciesBySource(source: string, pack: ContentPack): Species[] {
  return pack.species?.filter((s) => s.source === source) ?? [];
}

// ── Background ──────────────────────────────────────────

/** Find a background by ID. */
export function findBackground(id: string, pack: ContentPack): Background | undefined {
  return pack.backgrounds?.find((b) => b.id === id);
}

/** Get all backgrounds from a pack. */
export function getBackgrounds(pack: ContentPack): Background[] {
  return pack.backgrounds ?? [];
}

/** Get all backgrounds matching a source tag. */
export function getBackgroundsBySource(source: string, pack: ContentPack): Background[] {
  return pack.backgrounds?.filter((b) => b.source === source) ?? [];
}

// ── Class / Subclass ──────────────────────────────────────

/** Find a class by ID. */
export function findClass(id: string, pack: ContentPack): Class | undefined {
  return pack.classes?.find((c) => c.id === id);
}

/** Get all classes from a pack. */
export function getClasses(pack: ContentPack): Class[] {
  return pack.classes ?? [];
}

/** Get all classes matching a source tag. */
export function getClassesBySource(source: string, pack: ContentPack): Class[] {
  return pack.classes?.filter((c) => c.source === source) ?? [];
}

/** Find a subclass by ID. */
export function findSubclass(id: string, pack: ContentPack): Subclass | undefined {
  return pack.subclasses?.find((s) => s.id === id);
}

/** Get all subclasses for a given class (by parentClass field). */
export function getSubclassesForClass(classId: string, pack: ContentPack): Subclass[] {
  return pack.subclasses?.filter((s) => s.parentClass === classId) ?? [];
}

/** Get all subclasses from a pack. */
export function getSubclasses(pack: ContentPack): Subclass[] {
  return pack.subclasses ?? [];
}

// ── Feat ──────────────────────────────────────────────────

/** Find a feat by ID. */
export function findFeat(id: string, pack: ContentPack): Feat | undefined {
  return pack.feats?.find((f) => f.id === id);
}

/** Get all feats from a pack. */
export function getFeats(pack: ContentPack): Feat[] {
  return pack.feats ?? [];
}

/** Get all feats matching a category. */
export function getFeatsByCategory(category: FeatCategory, pack: ContentPack): Feat[] {
  return pack.feats?.filter((f) => f.category === category) ?? [];
}

/** Get all feats matching a source tag. */
export function getFeatsBySource(source: string, pack: ContentPack): Feat[] {
  return pack.feats?.filter((f) => f.source === source) ?? [];
}

// ── Equipment: Weapons ───────────────────────────────────

/** Find a weapon by ID. */
export function findWeapon(id: string, pack: ContentPack): Weapon | undefined {
  return pack.weapons?.find((w) => w.id === id);
}

/** Get all weapons from a pack. */
export function getWeapons(pack: ContentPack): Weapon[] {
  return pack.weapons ?? [];
}

/** Get all weapons matching a source tag. */
export function getWeaponsBySource(source: string, pack: ContentPack): Weapon[] {
  return pack.weapons?.filter((w) => w.source === source) ?? [];
}

// ── Equipment: Armor ──────────────────────────────────────

/** Find an armor by ID. */
export function findArmor(id: string, pack: ContentPack): Armor | undefined {
  return pack.armors?.find((a) => a.id === id);
}

/** Get all armors from a pack. */
export function getArmors(pack: ContentPack): Armor[] {
  return pack.armors ?? [];
}

/** Get all armors matching a source tag. */
export function getArmorsBySource(source: string, pack: ContentPack): Armor[] {
  return pack.armors?.filter((a) => a.source === source) ?? [];
}

// ── Equipment: Gear ───────────────────────────────────────

/** Find a gear item by ID. */
export function findGearItem(id: string, pack: ContentPack): GearItem | undefined {
  return pack.gear?.find((g) => g.id === id);
}

/** Get all gear items from a pack. */
export function getGearItems(pack: ContentPack): GearItem[] {
  return pack.gear ?? [];
}

/** Get all gear items matching a source tag. */
export function getGearBySource(source: string, pack: ContentPack): GearItem[] {
  return pack.gear?.filter((g) => g.source === source) ?? [];
}
