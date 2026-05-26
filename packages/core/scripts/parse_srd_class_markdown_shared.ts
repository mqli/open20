import type { Class, Subclass } from '../src/types/class';
import {
  collapseParagraphLines,
  normalizeDashValue,
  normalizeNameKey,
  parseMarkdownTable,
  parsePositiveInt,
  slugify,
  splitFeatureList,
  stripMarkdownHeading,
} from './srd_markdown_helpers';

type ClassLevelEntry = {
  level: number;
  features: string[];
  cantripsKnown?: number;
  preparedSpells?: number;
  spellSlots?: number[];
};

export interface ParsedClassDocument {
  classData: Class;
  subclasses: Subclass[];
  spellSlotsByLevel?: Record<string, number[]>;
}

export const CLASS_MARKDOWN_FILE_ORDER = [
  '01_Barbarian.md',
  '02_Bard.md',
  '03_Cleric.md',
  '04_Druid.md',
  '05_Fighter.md',
  '06_Monk.md',
  '07_Paladin.md',
  '08_Ranger.md',
  '09_Rogue.md',
  '10_Sorcerer.md',
  '11_Warlock.md',
  '12_Wizard.md',
] as const;

function getClassSpellcasting(classId: string): Class['spellcasting'] {
  switch (classId) {
    case 'Bard':
    case 'Sorcerer':
      return {
        ability: 'Charisma',
        knownSource: 'class_list',
        preparationTiming: 'level_up',
        changesPerPreparation: 'all',
      };
    case 'Warlock':
      return {
        ability: 'Charisma',
        knownSource: 'class_list',
        preparationTiming: 'level_up',
        changesPerPreparation: 'all',
        pactMagic: true,
      };
    case 'Cleric':
    case 'Druid':
      return {
        ability: 'Wisdom',
        knownSource: 'class_list',
        preparationTiming: 'long_rest',
        changesPerPreparation: 'all',
      };
    case 'Paladin':
      return {
        ability: 'Charisma',
        knownSource: 'class_list',
        preparationTiming: 'long_rest',
        changesPerPreparation: 1,
      };
    case 'Ranger':
      return {
        ability: 'Wisdom',
        knownSource: 'class_list',
        preparationTiming: 'long_rest',
        changesPerPreparation: 1,
      };
    case 'Wizard':
      return {
        ability: 'Intelligence',
        knownSource: 'spellbook',
        preparationTiming: 'long_rest',
        changesPerPreparation: 'all',
      };
    default:
      return null;
  }
}

function parseCoreTraits(lines: string[]): {
  hitDie: Class['hitDie'];
  savingThrowProficiencies: Class['savingThrowProficiencies'];
  armorTraining: string[];
  weaponProficiencies?: string[];
  weaponMastery: boolean;
} {
  const out = {
    hitDie: 'd8' as Class['hitDie'],
    savingThrowProficiencies: [] as unknown as Class['savingThrowProficiencies'],
    armorTraining: [] as string[],
    weaponProficiencies: undefined as string[] | undefined,
    weaponMastery: false,
  };

  for (let i = 0; i < lines.length; i += 1) {
    if (!lines[i].startsWith('Table: Core ')) continue;
    const table = parseMarkdownTable(lines, i + 2);
    if (!table) continue;
    const rows = table.rows.slice(1);
    for (const row of rows) {
      const key = row[0];
      const value = row[1] ?? '';
      if (/Hit Point Die/i.test(key)) {
        const m = value.match(/D(4|6|8|10|12|20)/i);
        if (m) out.hitDie = `d${m[1]}` as Class['hitDie'];
      } else if (/Saving Throw Proficiencies/i.test(key)) {
        const abilities = value
          .replace(/\bor\b/gi, ',')
          .replace(/\band\b/gi, ',')
          .split(',')
          .map(v => v.trim())
          .filter(Boolean);
        out.savingThrowProficiencies = abilities as unknown as Class['savingThrowProficiencies'];
      } else if (/Armor Training/i.test(key)) {
        out.armorTraining = value
          .replace(/armor/gi, '')
          .replace(/\band\b/gi, ',')
          .split(',')
          .map(v => v.trim())
          .filter(Boolean);
      } else if (/Weapon Proficiencies/i.test(key)) {
        out.weaponProficiencies = value
          .replace(/weapons?/gi, '')
          .replace(/\band\b/gi, ',')
          .split(',')
          .map(v => v.trim())
          .filter(Boolean);
      }
    }
    break;
  }

  out.weaponMastery = lines.some(line => /Weapon Mastery/i.test(line));
  return out;
}

function parseClassFeatureTable(lines: string[], classId: string): Map<number, ClassLevelEntry> {
  const levels = new Map<number, ClassLevelEntry>();
  const marker = new RegExp(`Table:\\s*${classId}\\s+(?:Class\\s+)?Features`, 'i');
  for (let i = 0; i < lines.length; i += 1) {
    if (!marker.test(lines[i])) continue;
    const table = parseMarkdownTable(lines, i + 2);
    if (!table) continue;
    const headers = table.rows[0].map(h => normalizeDashValue(h));
    const featureIdx = headers.findIndex(h => /Class Features/i.test(h));
    const levelIdx = headers.findIndex(h => /^Level$/i.test(h));
    const cantripIdx = headers.findIndex(h => /Cantrips/i.test(h));
    const preparedIdx = headers.findIndex(h => /Prepared Spells/i.test(h));
    const slotIdx: number[] = [];
    headers.forEach((h, idx) => {
      if (/^[1-9]$/.test(h)) slotIdx.push(idx);
    });
    for (const row of table.rows.slice(1)) {
      if (levelIdx < 0 || featureIdx < 0) continue;
      const level = parsePositiveInt(row[levelIdx] ?? '');
      if (!level) continue;
      const entry: ClassLevelEntry = {
        level,
        features: splitFeatureList(row[featureIdx] ?? ''),
      };
      if (cantripIdx >= 0) entry.cantripsKnown = parsePositiveInt(row[cantripIdx] ?? '');
      if (preparedIdx >= 0) entry.preparedSpells = parsePositiveInt(row[preparedIdx] ?? '');
      if (slotIdx.length > 0) {
        const slots: number[] = [];
        for (let s = 1; s <= 9; s += 1) slots.push(0);
        for (const idx of slotIdx) {
          const spellLevel = parsePositiveInt(headers[idx]);
          if (!spellLevel || spellLevel > 9) continue;
          slots[spellLevel - 1] = parsePositiveInt(row[idx] ?? '') ?? 0;
        }
        entry.spellSlots = slots;
      }
      levels.set(level, entry);
    }
    break;
  }
  return levels;
}

function extractSection(lines: string[], start: number, endExclusive: number): string[] {
  const out: string[] = [];
  for (let i = start; i < endExclusive; i += 1) {
    out.push(lines[i]);
  }
  return out;
}

function parseLevelFeatures(lines: string[]): Map<number, { name: string; description: string }[]> {
  const byLevel = new Map<number, { name: string; description: string }[]>();
  let i = 0;
  while (i < lines.length) {
    const m = lines[i].match(/^#{3,4}\s*Level\s*(\d+):\s*(.+)$/i);
    if (!m) {
      i += 1;
      continue;
    }
    const level = Number.parseInt(m[1], 10);
    const name = stripMarkdownHeading(lines[i]).replace(/^Level\s*\d+:\s*/i, '').trim();
    let j = i + 1;
    while (j < lines.length && !/^#{3,4}\s*Level\s*\d+:/i.test(lines[j]) && !/^###\s+.+Subclass:/i.test(lines[j])) {
      j += 1;
    }
    const description = collapseParagraphLines(extractSection(lines, i + 1, j));
    const list = byLevel.get(level) ?? [];
    list.push({ name, description });
    byLevel.set(level, list);
    i = j;
  }
  return byLevel;
}

function parseSubclasses(lines: string[], classId: string, spellByNameKey: Map<string, string>): Subclass[] {
  const subclasses: Subclass[] = [];
  const subclassStarts: { index: number; name: string }[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const m = lines[i].match(/^###\s+.+Subclass:\s+(.+)$/i);
    if (m) {
      subclassStarts.push({ index: i, name: m[1].trim() });
    }
  }

  const grantedAtLevel = classId === 'Cleric' || classId === 'Warlock' ? 1 : classId === 'Wizard' ? 2 : 3;

  for (let s = 0; s < subclassStarts.length; s += 1) {
    const start = subclassStarts[s].index;
    const end = subclassStarts[s + 1]?.index ?? lines.length;
    const block = extractSection(lines, start, end);
    const levelFeatures = parseLevelFeatures(block);
    const featuresByLevel = Array.from(levelFeatures.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([level, features]) => ({
        level,
        features: features.map(f => ({ name: f.name, description: f.description })),
      }));

    let alwaysPreparedSpells: Subclass['alwaysPreparedSpells'] | undefined;
    for (let i = 0; i < block.length; i += 1) {
      if (!/^Table:/i.test(block[i]) || !/Spells/i.test(block[i])) continue;
      const table = parseMarkdownTable(block, i + 2);
      if (!table) continue;
      const headers = table.rows[0];
      const levelIdx = headers.findIndex(h => /Level/i.test(h));
      const spellsIdx = headers.findIndex(h => /Spells/i.test(h));
      if (levelIdx < 0 || spellsIdx < 0) continue;
      const mapped = table.rows.slice(1).map(row => {
        const level = parsePositiveInt(row[levelIdx] ?? '');
        const spells = (row[spellsIdx] ?? '')
          .split(',')
          .map(v => v.trim())
          .filter(Boolean)
          .map(name => spellByNameKey.get(normalizeNameKey(name)) ?? slugify(name));
        return level ? { level, spells } : undefined;
      }).filter(Boolean) as { level: number; spells: string[] }[];
      if (mapped.length > 0) {
        alwaysPreparedSpells = mapped;
        break;
      }
    }

    subclasses.push({
      id: subclassStarts[s].name,
      parentClass: classId,
      grantedAtLevel,
      featuresByLevel,
      ...(alwaysPreparedSpells ? { alwaysPreparedSpells } : {}),
      source: 'SRD 5.2',
    });
  }
  return subclasses;
}

export function parseClassMarkdownContent(content: string, spellByNameKey: Map<string, string>): ParsedClassDocument {
  const lines = content.split('\n');
  const titleLine = lines.find(line => line.startsWith('## ')) ?? '## Unknown';
  const classId = stripMarkdownHeading(titleLine);
  const core = parseCoreTraits(lines);
  const byLevelTable = parseClassFeatureTable(lines, classId);
  const levelFeatures = parseLevelFeatures(lines.slice(0, lines.findIndex(line => /^###\s+.+Subclass:/i.test(line)) > -1 ? lines.findIndex(line => /^###\s+.+Subclass:/i.test(line)) : lines.length));

  const levels = new Map<number, Class['featuresByLevel'][number]>();
  for (const [level, tableRow] of byLevelTable.entries()) {
    const fromSections = levelFeatures.get(level) ?? [];
    const features = tableRow.features
      .map(name => {
        const fromSection = fromSections.find(f => f.name.toLowerCase() === name.toLowerCase());
        return {
          name,
          description: fromSection?.description ?? '',
        };
      })
      .filter(f => f.name.toLowerCase() !== 'subclass feature' && f.name !== '—');
    levels.set(level, {
      level,
      features,
      ...(tableRow.cantripsKnown !== undefined ? { cantripsKnown: tableRow.cantripsKnown } : {}),
      ...(tableRow.preparedSpells !== undefined ? { preparedSpells: tableRow.preparedSpells } : {}),
    });
  }

  const spellSlotsByLevel: Record<string, number[]> = {};
  for (const [level, tableRow] of byLevelTable.entries()) {
    if (tableRow.spellSlots) {
      spellSlotsByLevel[String(level)] = tableRow.spellSlots;
    }
  }

  const classData: Class = {
    id: classId,
    name: classId,
    source: 'SRD 5.2',
    hitDie: core.hitDie,
    savingThrowProficiencies: core.savingThrowProficiencies,
    armorTraining: core.armorTraining,
    ...(core.weaponProficiencies ? { weaponProficiencies: core.weaponProficiencies } : {}),
    weaponMastery: core.weaponMastery,
    featuresByLevel: Array.from(levels.values()).sort((a, b) => a.level - b.level),
    spellcasting: getClassSpellcasting(classId),
  };

  const subclasses = parseSubclasses(lines, classId, spellByNameKey);

  return {
    classData,
    subclasses,
    spellSlotsByLevel: Object.keys(spellSlotsByLevel).length > 0 ? spellSlotsByLevel : undefined,
  };
}

export function buildSpellNameKeyMap(spells: Array<{ id: string; name: string }>): Map<string, string> {
  const map = new Map<string, string>();
  for (const spell of spells) {
    map.set(normalizeNameKey(spell.name), spell.id);
  }
  return map;
}
