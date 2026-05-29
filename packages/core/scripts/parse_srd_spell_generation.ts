import { parseMarkdown, transformSpell } from './parse_srd_markdown.ts';

type Spell = ReturnType<typeof transformSpell>;

export function generateSpellsFromMarkdown(content: string): Spell[] {
  const parsed = parseMarkdown(content);
  return parsed.map((p) => transformSpell(p));
}

export function mergeSpells(existing: Spell[], generated: Spell[]): Spell[] {
  const merged = new Map<string, Spell>();
  for (const s of generated) merged.set(s.id, s);
  for (const s of existing) {
    if (!merged.has(s.id)) merged.set(s.id, s);
  }
  return Array.from(merged.values()).sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.name.localeCompare(b.name);
  });
}
