import {
  parseParentheticalCommaList,
  slugify,
  stripBold,
  stripItalic,
  stripMarkdownHeading,
} from './srd_markdown_helpers.ts';

import type {
  Spell,
  SpellDamage,
  SpellHeal,
  CantripUpgradeEntry,
  CastingTime,
  SpellSchool,
} from '../src/types/spell';
import type { DamageEntry, DamageType } from '../src/types/damage';

export function parseComponents(compStr: string): string[] {
  const comps: string[] = [];
  if (/V\b/i.test(compStr)) comps.push('V');
  if (/S\b/i.test(compStr)) comps.push('S');
  if (/M\b/i.test(compStr)) comps.push('M');
  return comps;
}

export function parseCastingTime(text: string): string {
  if (/bonus\s*action/i.test(text)) return 'Bonus Action';
  if (/reaction/i.test(text)) return 'Reaction';
  if (/minute/i.test(text)) return text.includes('minute') ? text.trim() : '1 minute';
  if (/hour/i.test(text)) return text.trim();
  return 'Action';
}

export function parseDuration(text: string): { duration: string; concentration: boolean } {
  if (!text) return { duration: 'Instantaneous', concentration: false };
  return {
    duration: text.replace(/\s*concentration,?\s*/i, '').trim() || text.trim(),
    concentration: /concentration/i.test(text),
  };
}

export function checkRitual(castingTime: string, description: string): boolean {
  return /ritual/i.test(castingTime) || /can be cast as a ritual/i.test(description);
}

export function extractSave(description: string): string | undefined {
  for (const save of [
    'Strength',
    'Dexterity',
    'Constitution',
    'Intelligence',
    'Wisdom',
    'Charisma',
  ]) {
    if (new RegExp(`\\b${save}\\b saving throw`, 'i').test(description)) return save;
  }
  return undefined;
}

export function checkAttack(description: string): boolean {
  return /spell attack/i.test(description) || /make an? .*attack/i.test(description);
}

export function extractDamage(description: string): SpellDamage | undefined {
  const regex =
    /(\d+d\d+(?:\s*\+\s*\d+)?)\s+(acid|cold|fire|force|lightning|necrotic|poison|psychic|radiant|thunder)/gi;
  const matches = Array.from(description.matchAll(regex));
  if (matches.length === 0) return undefined;
  return {
    entries: matches.map((m) => ({
      dice: m[1]!,
      type: (m[2]!.charAt(0).toUpperCase() + m[2]!.slice(1).toLowerCase()) as DamageType,
    })) as unknown as readonly DamageEntry[],
  };
}

export function extractHeal(description: string): SpellHeal | undefined {
  const healingKeywords = /(regain|heal).*(\d+d\d+)/i;
  const match = healingKeywords.exec(description);
  if (!match) return undefined;

  // Check for upcast healing: "The healing increases by XdY for each spell slot level above Z"
  const perSlotMatch = /healing increases by (\d+d\d+)/i.exec(description);

  // Check for "plus your spellcasting ability modifier"
  const includeMod = /plus your spellcasting ability modifier/i.test(description);

  return {
    dice: match[2]!,
    ...(perSlotMatch ? { perSlot: perSlotMatch[1]! } : {}),
    ...(includeMod ? { includeSpellcastingModifier: true } : {}),
  };
}

// ── Cantrip Upgrade Parser ─────────────────────────────────────

export function parseCantripUpgrade(text: string): CantripUpgradeEntry[] {
  const entries: CantripUpgradeEntry[] = [];

  // Pattern: "levels 5 (2d6), 11 (3d6), and 17 (4d6)" → extract dice inside parentheses
  // Pattern: "at level 5, 2d6; at level 11, 3d6; at level 17, 4d6"
  // Pattern: "increases by 1d6 when you reach levels 5 (2d6), 11 (3d6), and 17 (4d6)"

  const damageByLevel: Map<number, string> = new Map();

  // Normalize bare "dN" (e.g. Shillelagh's "(d10)") to "1dN" for consistency.
  const normalizeDice = (d: string): string => (/^d\d+$/i.test(d) ? `1${d.toLowerCase()}` : d);

  // Match "level X (YdZ)" or "X (YdZ)" — Y is optional to allow "(d10)".
  const parenRegex = /(?:level\s*)?(5|11|17)\s*\((\d*d\d+)\)/gi;
  const parenMatches = Array.from(text.matchAll(parenRegex));
  for (const m of parenMatches) {
    damageByLevel.set(parseInt(m[1]!), normalizeDice(m[2]!));
  }

  // If no parenthetical matches, try "at level 5, 2d6" pattern
  if (damageByLevel.size === 0) {
    for (const level of [5, 11, 17]) {
      const regex = new RegExp(`(?:level\\s*${level}[^,\\d]*)((\\d*d\\d+))`, 'i');
      const match = text.match(regex);
      if (match) damageByLevel.set(level, normalizeDice(match[1]!));
    }
  }

  // Determine damage type from text (look for "Acid damage", "Fire damage", etc.)
  const typeMatch = text.match(
    /(acid|cold|fire|force|lightning|necrotic|poison|psychic|radiant|thunder)/i,
  );
  const type: DamageType | 'Unknown' = typeMatch
    ? ((typeMatch[1]!.charAt(0).toUpperCase() + typeMatch[1]!.slice(1).toLowerCase()) as DamageType)
    : 'Unknown';

  for (const level of [5, 11, 17]) {
    if (damageByLevel.has(level)) {
      entries.push({
        atCharacterLevel: level as 5 | 11 | 17,
        damage: [
          {
            dice: damageByLevel.get(level)!,
            type: type === 'Unknown' ? (type as unknown as DamageType) : type,
          },
        ] as unknown as readonly DamageEntry[],
      } as CantripUpgradeEntry);
    }
  }

  return entries;
}

export function parsePerSlotDamage(text: string, defaultType: string): DamageEntry[] | undefined {
  // Pattern: "increases by 1d6 for each spell slot level above N"
  const match = text.match(/increases\s+by\s+(\d+d\d+)/i);
  if (!match) return undefined;

  // Try to find damage type in the text
  const typeMatch = text.match(
    /(acid|cold|fire|force|lightning|necrotic|poison|psychic|radiant|thunder)/i,
  );
  const type = typeMatch
    ? typeMatch[1]!.charAt(0).toUpperCase() + typeMatch[1]!.slice(1).toLowerCase()
    : defaultType;

  return [{ dice: match[1]!, type: type as DamageType }];
}

// ── Markdown Parser ────────────────────────────────────────────

export interface ParsedSpell {
  name: string;
  level: number;
  school: string;
  classes: string[];
  castingTime: string;
  range: string;
  components: string;
  material?: string;
  duration: string;
  ritual: boolean;
  descriptionLines: string[];
  cantripUpgradeText?: string;
  usingAHigherLevelSpellSlotText?: string;
}

export function parseMarkdown(content: string): ParsedSpell[] {
  const spells: ParsedSpell[] = [];

  // Split into lines and process
  const lines = content.split('\n');

  let currentSpell: Partial<ParsedSpell> | null = null;
  let inDescription = false;
  let descriptionLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;

    // Skip section headers like "### H Spells" or "## Spells"
    if (line.startsWith('#') && !line.startsWith('####')) {
      // Save previous spell before starting new section
      if (currentSpell && currentSpell.name) {
        currentSpell.descriptionLines = descriptionLines;
        spells.push(currentSpell as ParsedSpell);
      }
      currentSpell = null;
      inDescription = false;
      descriptionLines = [];
      continue;
    }

    // New spell starts with ####
    if (line.startsWith('####')) {
      // Save previous spell
      if (currentSpell && currentSpell.name) {
        currentSpell.descriptionLines = descriptionLines;
        spells.push(currentSpell as ParsedSpell);
      }

      // Start new spell
      const name = stripBold(stripMarkdownHeading(line));
      currentSpell = { name, descriptionLines: [] };
      inDescription = false;
      descriptionLines = [];
      continue;
    }

    if (!currentSpell) continue;
    // Parse level/school line: *Level 2 Evocation (Wizard)* or *Evocation Cantrip (Sorcerer, Wizard)*
    if (line.startsWith('_') && line.includes('(') && !line.includes('**')) {
      const text = stripItalic(line).trim();

      // Check if cantrip
      const cantripMatch = text.match(/_(\w+)\s+Cantrip/i);
      if (cantripMatch) {
        currentSpell.level = 0;
        currentSpell.school = cantripMatch[1];
      } else {
        // Level X School
        const levelMatch = text.match(/Level\s*(\d+)\s+(\w+)/i);
        if (levelMatch) {
          currentSpell.level = parseInt(levelMatch[1]!);
          currentSpell.school = levelMatch[2];
        }
      }

      // Extract classes
      currentSpell.classes = parseParentheticalCommaList(text);

      continue;
    }

    // Parse bold fields
    if (line.includes('**Casting Time:**')) {
      currentSpell.castingTime = stripBold(line).replace('Casting Time:', '').trim();
      continue;
    }
    if (line.includes('**Range:**')) {
      currentSpell.range = stripBold(line).replace('Range:', '').trim();
      continue;
    }
    if (line.includes('**Components:**')) {
      const compLine = stripBold(line).replace('Components:', '').trim();
      currentSpell.components = compLine;
      // Extract material component
      const matMatch = compLine.match(/M\s*\(([^)]+)\)/i);
      if (matMatch) currentSpell.material = matMatch[1];
      continue;
    }
    if (line.includes('**Duration:**')) {
      currentSpell.duration = stripBold(line).replace('Duration:', '').trim();
      currentSpell.ritual = /ritual/i.test(currentSpell.duration || '');
      continue;
    }

    // Check for Cantrip Upgrade section (handles both **_Cantrip Upgrade._** and **Cantrip Upgrade.** variants)
    if (/\*\*_?Cantrip Upgrade/i.test(line)) {
      currentSpell.cantripUpgradeText = line
        .replace(/\*\*/g, '')
        .replace(/_?Cantrip Upgrade[._]*_?\s*/i, '')
        .trim();
      inDescription = false;
      continue;
    }

    // Check for Using a Higher-Level Spell Slot section
    if (/\*\*_?Using a Higher-Level Spell Slot/i.test(line)) {
      currentSpell.usingAHigherLevelSpellSlotText = line
        .replace(/\*\*/g, '')
        .replace(/_?Using a Higher-Level Spell Slot[._]*_?\s*/i, '')
        .trim();
      inDescription = false;
      continue;
    }

    // Skip empty lines when not in description
    if (!line.trim()) {
      if (inDescription) descriptionLines.push(line.trim());
      continue;
    }

    // Description lines (everything after the fields before Cantrip Upgrade or Using a Higher-Level)
    if (
      currentSpell.castingTime &&
      !inDescription &&
      !line.startsWith('**') &&
      !line.startsWith('*')
    ) {
      inDescription = true;
    }

    if (inDescription && !line.includes('**_Cantrip') && !line.includes('**_Using')) {
      descriptionLines.push(line.trim());
    }
  }

  // Don't forget the last spell
  if (currentSpell && currentSpell.name) {
    currentSpell.descriptionLines = descriptionLines;
    spells.push(currentSpell as ParsedSpell);
  }

  return spells;
}

// ── Transform to Spell ─────────────────────────────────────────

export function transformSpell(parsed: ParsedSpell): Spell {
  const descLines = parsed.descriptionLines || [];
  const cantripUpgradeText = parsed.cantripUpgradeText || '';
  const usingAHigherLevelSpellSlotText = parsed.usingAHigherLevelSpellSlotText || '';
  const castingTime = parsed.castingTime;
  const durationInfo = parseDuration(parsed.duration || '');
  const fullDesc = descLines.join(' ');

  const spell: Spell = {
    id: slugify(parsed.name || ''),
    name: parsed.name || '',
    level: (parsed.level ?? 0) as Spell['level'],
    school: ((parsed.school || 'Unknown').charAt(0).toUpperCase() +
      (parsed.school || 'Unknown').slice(1).toLowerCase()) as SpellSchool,
    castingTime: parseCastingTime(castingTime) as CastingTime,
    range: parsed.range || 'Self',
    components: parseComponents(parsed.components || '') as readonly string[],
    duration: durationInfo.duration,
    concentration: durationInfo.concentration,
    ritual: descLines.some((desc) => checkRitual(castingTime, desc)),
    description: descLines,
    source: 'SRD 5.2' as const,
  };

  if (parsed.classes) spell.classes = parsed.classes;

  // Cantrip upgrade: always preserve the raw text when present (some upgrades scale beams or
  // range rather than damage and can't be structured). Layer the parsed damage table on top
  // when parseCantripUpgrade can extract one.
  if (cantripUpgradeText) {
    spell.cantripUpgradeText = cantripUpgradeText;
    const entries = parseCantripUpgrade(cantripUpgradeText);
    if (entries.length > 0) spell.cantripUpgrade = entries;
  }

  // Parse using a higher level spell slot
  if (usingAHigherLevelSpellSlotText) {
    spell.usingAHigherLevelSpellSlot = [usingAHigherLevelSpellSlotText];
  }

  // Extract damage/heal/save/attack from description
  let damage = extractDamage(fullDesc);
  const heal = extractHeal(fullDesc);
  const save = extractSave(fullDesc);
  const attack = checkAttack(fullDesc);

  if (damage) {
    // If cantripUpgrade has "Unknown" type, try to get it from damage entries
    if (spell.cantripUpgrade) {
      const knownType = damage.entries.find(
        (d): d is typeof d => (d.type as string) !== 'Unknown',
      )?.type;
      if (knownType && knownType !== ('Unknown' as unknown as DamageType)) {
        const upgradedEntries = spell.cantripUpgrade.map((entry: CantripUpgradeEntry) => {
          if (!entry.damage) return entry;
          const fixedDamage = entry.damage.map((d: DamageEntry) => {
            if ((d.type as string) === 'Unknown') {
              return { ...d, type: knownType } as unknown as DamageEntry;
            }
            return d;
          });
          return { ...entry, damage: fixedDamage } as unknown as CantripUpgradeEntry;
        });
        spell.cantripUpgrade = upgradedEntries;
      }
    }

    // Parse usingAHigherLevelSpellSlot to get per-slot damage increase
    if (usingAHigherLevelSpellSlotText) {
      const perSlot = parsePerSlotDamage(
        usingAHigherLevelSpellSlotText,
        (damage.entries[0]?.type as string) || 'Unknown',
      );
      if (perSlot) {
        damage = { ...damage, perSlot: perSlot as unknown as readonly DamageEntry[] };
      }
    }

    spell.damage = damage;
  }
  if (heal) {
    spell.heal = heal;
    // Check usingAHigherLevelSpellSlot for healing upcast (e.g., Cure Wounds)
    if (spell.usingAHigherLevelSpellSlot) {
      const upcastText = spell.usingAHigherLevelSpellSlot.join(' ');
      const perSlotMatch = /healing increases by (\d+d\d+)/i.exec(upcastText);
      if (perSlotMatch) {
        spell.heal = { ...spell.heal, perSlot: perSlotMatch[1] };
      }
    }
  }
  if (save) spell.save = save as Spell['save'];
  if (attack) spell.attack = attack;

  return spell as unknown as Spell;
}
