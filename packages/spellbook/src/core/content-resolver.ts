// content-resolver.ts
// Replaces data-loader.ts — resolves character deps from merged content pack
//
// Phase 6 of DataLoader removal: spellbook consumer migration.
// Core functions now take RecomputeDerivedStatsDeps (explicit resolved inputs)
// instead of DataLoader (runtime lookup).

import type { ContentPack } from 'open20-core/content';
import type { RecomputeDerivedStatsDeps, Character, Feat } from 'open20-core';
import type { Class, Species, Background, Spell, Subclass } from 'open20-core';
import { mergeContentPacks } from '@open20/content-srd/merge';
import { srdContentPack } from '@open20/content-srd';
import { resolveCharacterDeps } from '@open20/content-srd/query/resolve';
import { storageService } from './storage-service';

/** Inline Magic Initiate feat definition — no SRD feat data needed. */
const MAGIC_INITIATE_FEAT: Feat = {
  id: 'magic-initiate',
  source: '2024 PHB',
  name: 'Magic Initiate',
  description: 'You learn two cantrips and one 1st-level spell from the chosen class list.',
  category: 'Origin',
  grants: [
    {
      type: 'spellChoices',
      choices: [
        {
          id: 'cantrips',
          classOptions: ['Cleric', 'Druid', 'Wizard'],
          spellLevel: 0,
          count: 2,
          alwaysPrepared: true,
        },
        {
          id: 'level1Spell',
          classOptions: ['Cleric', 'Druid', 'Wizard'],
          spellLevel: 1,
          count: 1,
          alwaysPrepared: true,
          oncePerLongRest: true,
        },
      ],
    },
  ],
} as const;

// ── Singleton merged content pack ──────────────────────────

let mergedPack: ContentPack | null = null;
let initPromise: Promise<ContentPack> | null = null;

/**
 * Build a custom ContentPack from user-saved classes, subclasses, and spells.
 * Mirrors the structure of an SRD ContentPack so mergeContentPacks
 * can handle it transparently.
 */
function buildCustomContentPack(): ContentPack {
  const entries = storageService.loadCustomClasses();
  const classes = entries.map((e) => e.class);
  const customSubclasses = entries.flatMap((e) => e.subclasses);
  const standaloneSubclasses = storageService.loadStandaloneSubclasses();
  const subclasses = [...customSubclasses, ...standaloneSubclasses];
  const spells = storageService.loadCustomSpells();

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
    spells: spells.length > 0 ? spells : undefined,
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

// ── Entity getters ────────────────────────────────────────

export function getAllClasses(): Class[] {
  return getContentPack().classes ?? [];
}

export function getAllSpecies(): Species[] {
  return getContentPack().species ?? [];
}

export function getAllBackgrounds(): Background[] {
  return getContentPack().backgrounds ?? [];
}

export function getAllSpells(): Spell[] {
  return getContentPack().spells ?? [];
}

export function getAllSubclasses(): Subclass[] {
  return getContentPack().subclasses ?? [];
}

// ── Deps resolution ───────────────────────────────────────

/** Ensure the inline Magic Initiate feat is in deps so computeFeatSpells works. */
function injectInlineFeats(deps: RecomputeDerivedStatsDeps): RecomputeDerivedStatsDeps {
  deps.feats = { ...(deps.feats ?? {}), 'magic-initiate': MAGIC_INITIATE_FEAT };
  return deps;
}

/**
 * Resolve a character's RecomputeDerivedStatsDeps from the merged content pack.
 *
 * Looks up all entities referenced by the character (species, background,
 * classes, subclasses, feats, equipment, spells) and returns a deps bag
 * that core functions can use without further lookups.
 */
export function resolveDeps(character: Character): RecomputeDerivedStatsDeps {
  const pack = getContentPack();
  const deps = resolveCharacterDeps(character, pack);
  return injectInlineFeats(deps);
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
  additionalClasses?: Array<{ classId: string; level: number; subclassId?: string }>;
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

  // Resolve additional multiclass classes into deps.classes
  for (const additional of params.additionalClasses ?? []) {
    const additionalKlass = pack.classes?.find((c) => c.id === additional.classId);
    if (additionalKlass) {
      deps.classes[additionalKlass.id] = additionalKlass;
    }
    // Also resolve subclass for each additional class if provided
    if (additional.subclassId && additionalKlass) {
      const sub = pack.subclasses?.find((s) => s.id === additional.subclassId);
      if (sub) {
        deps.subclasses = { ...(deps.subclasses ?? {}), [sub.id]: sub };
      }
    }
  }

  if (params.subclassId && klass) {
    const sub = pack.subclasses?.find((s) => s.id === params.subclassId);
    if (sub) deps.subclasses = { ...(deps.subclasses ?? {}), [sub.id]: sub };
  }

  return injectInlineFeats(deps);
}
