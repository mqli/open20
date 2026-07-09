import { parseMarkdown, transformSpell } from '@open20/content/parser';
import { sortSpells } from 'open20-core/spells';

export { parseMarkdown, transformSpell };
export type { ParsedSpell } from '@open20/content/parser';

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
  return sortSpells(Array.from(merged.values()));
}
