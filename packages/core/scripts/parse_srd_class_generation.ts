import type { Class, Subclass } from '../src/types/class';
import {
  buildSpellNameKeyMap,
  parseClassMarkdownContent,
} from './parse_srd_class_markdown_shared';

export type LookupTables = {
  spellSlots?: Record<string, Record<string, number[]>>;
  [key: string]: unknown;
};

export type ClassDocumentInput = {
  readonly content: string;
};

export function generateClassesFromDocuments(
  docs: readonly ClassDocumentInput[],
  spells: Array<{ id: string; name: string }>,
): { classes: Class[]; spellSlotsUpdates: Record<string, Record<string, number[]>> } {
  const spellByNameKey = buildSpellNameKeyMap(spells);
  const classes: Class[] = [];
  const spellSlotsUpdates: Record<string, Record<string, number[]>> = {};

  for (const doc of docs) {
    const parsed = parseClassMarkdownContent(doc.content, spellByNameKey);
    classes.push(parsed.classData);
    if (parsed.spellSlotsByLevel) {
      spellSlotsUpdates[parsed.classData.id] = parsed.spellSlotsByLevel;
    }
  }

  return { classes, spellSlotsUpdates };
}

export function generateSubclassesFromDocuments(
  docs: readonly ClassDocumentInput[],
  spells: Array<{ id: string; name: string }>,
): Subclass[] {
  const spellByNameKey = buildSpellNameKeyMap(spells);
  const subclasses: Subclass[] = [];

  for (const doc of docs) {
    const parsed = parseClassMarkdownContent(doc.content, spellByNameKey);
    subclasses.push(...parsed.subclasses);
  }

  return subclasses;
}

export function mergeClasses(existing: Class[], generated: Class[]): Class[] {
  const merged = new Map(existing.map(c => [c.id, c]));
  for (const next of generated) merged.set(next.id, next);
  return Array.from(merged.values()).sort((a, b) => a.id.localeCompare(b.id));
}

export function mergeSubclasses(existing: Subclass[], generated: Subclass[]): Subclass[] {
  const byId = new Map(existing.map(s => [`${s.parentClass}::${s.id}`, s]));
  for (const next of generated) {
    byId.set(`${next.parentClass}::${next.id}`, next);
  }
  return Array.from(byId.values()).sort((a, b) => {
    const classCmp = a.parentClass.localeCompare(b.parentClass);
    if (classCmp !== 0) return classCmp;
    return a.id.localeCompare(b.id);
  });
}

export function updateLookupTables(
  existing: LookupTables,
  spellSlotsUpdates: Record<string, Record<string, number[]>>,
): LookupTables {
  const current = (existing.spellSlots ?? {}) as Record<string, Record<string, number[]>>;
  const merged: Record<string, Record<string, number[]>> = { ...current };
  for (const [classId, levels] of Object.entries(spellSlotsUpdates)) {
    merged[classId] = {
      ...(current[classId] ?? {}),
      ...levels,
    };
  }
  return {
    ...existing,
    spellSlots: merged,
  };
}
