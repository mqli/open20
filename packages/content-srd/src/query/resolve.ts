// query/resolve.ts
// Convenience helpers for consumers (spellbook, tests) to build
// RecomputeDerivedStatsDeps from a Character + merged ContentPack.
//
// These helpers live in content-srd (not core) because they import from
// content-srd query functions. Core must NOT import content-srd.

import type {
  ContentPack,
  RecomputeDerivedStatsDeps,
  Character,
  Class,
  Subclass,
  Feat,
  Weapon,
  Armor,
  Gear,
  Spell,
} from 'open20-core';
import {
  findSpecies,
  findBackground,
  findClass,
  findSubclass,
  findFeat,
  findArmor,
  findWeapon,
  findGearItem,
} from './catalog';
import { findSpell } from './spells';

/**
 * Build a RecomputeDerivedStatsDeps bag by resolving all entities
 * referenced by a Character from a merged ContentPack.
 *
 * Use this in consumers (spellbook, tests) to bridge the gap between
 * a Character (which stores IDs) and the explicit deps that core functions require.
 */
export function resolveCharacterDeps(
  char: Character,
  pack: ContentPack,
): RecomputeDerivedStatsDeps {
  const deps: RecomputeDerivedStatsDeps = { classes: {} };

  // ── Singular resolved objects ────────────────────────
  if (char.species) {
    const species = findSpecies(char.species, pack);
    if (species) deps.species = species;
  }
  if (char.background) {
    const background = findBackground(char.background, pack);
    if (background) deps.background = background;
  }

  // ── Classes + Subclasses (build maps) ──────────────
  const classMap: Record<string, Class> = {};
  const subclassMap: Record<string, Subclass> = {};

  if (char.classes?.length) {
    for (const cc of char.classes) {
      const klass = findClass(cc.classId, pack);
      if (klass) classMap[cc.classId] = klass;

      if (cc.subclassId) {
        const sub = findSubclass(cc.subclassId, pack);
        if (sub) subclassMap[cc.subclassId] = sub;
      }
    }
  }
  if (Object.keys(classMap).length > 0) deps.classes = classMap;
  if (Object.keys(subclassMap).length > 0) deps.subclasses = subclassMap;

  // ── Feats ──────────────────────────────────────────
  if (char.feats?.length) {
    const featMap: Record<string, Feat> = {};
    for (const cf of char.feats) {
      const feat = findFeat(cf.featId, pack);
      if (feat) featMap[cf.featId] = feat;
    }
    if (Object.keys(featMap).length > 0) deps.feats = featMap;
  }

  // ── Equipment → weapons / armors / gears ─────────────
  if (char.equipment?.length) {
    const weaponMap: Record<string, Weapon> = {};
    const armorMap: Record<string, Armor> = {};
    const gearMap: Record<string, Gear> = {};

    for (const eq of char.equipment) {
      const w = findWeapon(eq.id, pack);
      if (w) {
        weaponMap[eq.id] = w;
        continue;
      }
      const a = findArmor(eq.id, pack);
      if (a) {
        armorMap[eq.id] = a;
        continue;
      }
      const g = findGearItem(eq.id, pack);
      if (g) gearMap[eq.id] = g;
    }

    if (Object.keys(weaponMap).length > 0) deps.weapons = weaponMap;
    if (Object.keys(armorMap).length > 0) deps.armors = armorMap;
    if (Object.keys(gearMap).length > 0) deps.gears = gearMap;
  }

  // ── Spells ───────────────────────────────────────────
  // Collect all spell IDs referenced by the character
  const spellIds = new Set<string>();

  if (char.spells?.classSpellcasting) {
    for (const [, csd] of Object.entries(char.spells.classSpellcasting)) {
      if (csd.knownCantrips) {
        for (const id of csd.knownCantrips) spellIds.add(id);
      }
      if (csd.knownSpells) {
        for (const id of csd.knownSpells) spellIds.add(id);
      }
      if (csd.preparedSpells) {
        for (const id of csd.preparedSpells) spellIds.add(id);
      }
      if (csd.alwaysPreparedSpells) {
        for (const id of csd.alwaysPreparedSpells) spellIds.add(id);
      }
    }
  }

  if (spellIds.size > 0) {
    const spellMap: Record<string, Spell> = {};
    for (const id of spellIds) {
      const spell = findSpell(id, pack);
      if (spell) spellMap[id] = spell;
    }
    if (Object.keys(spellMap).length > 0) deps.spells = spellMap;
  }

  return deps;
}
