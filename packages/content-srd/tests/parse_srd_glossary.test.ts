import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect } from 'vitest';
import {
  parseAbbreviations,
  parseEntryHeading,
  parseGlossaryMarkdown,
  parseSeeAlso,
  stripSeeAlso,
} from '../scripts/parse_srd_glossary_generation.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const glossaryMarkdownPath = resolve(__dirname, '../src/markdown/srd-5.2-glossary.md');

describe('parseEntryHeading', () => {
  it('parses plain entry headings', () => {
    expect(parseEntryHeading('#### Ability Check')).toEqual({ name: 'Ability Check' });
  });

  it('parses tagged entry headings', () => {
    expect(parseEntryHeading('#### Attack [Action]')).toEqual({
      name: 'Attack',
      tag: 'Action',
    });
  });

  it('ignores bold subheadings used for table captions', () => {
    expect(parseEntryHeading('#### **Areas of Knowledge**')).toBeNull();
  });
});

describe('parseSeeAlso', () => {
  it('parses document references with sections', () => {
    expect(parseSeeAlso('"Playing the Game" ("D20 Tests" and "Proficiency")')).toEqual([
      {
        type: 'document',
        document: 'Playing the Game',
        sections: ['D20 Tests', 'Proficiency'],
      },
    ]);
  });

  it('parses glossary entry references', () => {
    expect(parseSeeAlso('"Friendly," "Hostile," "Indifferent," and "Influence."')).toEqual([
      { type: 'entry', id: 'friendly' },
      { type: 'entry', id: 'hostile' },
      { type: 'entry', id: 'indifferent' },
      { type: 'entry', id: 'influence' },
    ]);
  });

  it('parses mixed document and entry references', () => {
    expect(parseSeeAlso('"Disadvantage" and "Equipment" ("Armor")')).toEqual([
      { type: 'document', document: 'Equipment', sections: ['Armor'] },
      { type: 'entry', id: 'disadvantage' },
    ]);
  });
});

describe('stripSeeAlso', () => {
  it('removes see-also clause from paragraph text', () => {
    const text =
      'An adventure is a series of encounters. A story emerges through playing them. *See also* "Encounter."';
    expect(stripSeeAlso(text)).toBe(
      'An adventure is a series of encounters. A story emerges through playing them.',
    );
  });
});

describe('parseAbbreviations', () => {
  it('parses the abbreviations table', () => {
    const sample = `
**Abbreviations.** The abbreviations listed below appear in this glossary and elsewhere in the rules.

|      |                     |
|------|---------------------|
| AC   | Armor Class         |
| DC   | Difficulty Class    |
`;
    const abbreviations = parseAbbreviations(sample.split('\n'));
    expect(abbreviations).toEqual([
      { abbr: 'AC', expansion: 'Armor Class' },
      { abbr: 'DC', expansion: 'Difficulty Class' },
    ]);
  });
});

describe('parseGlossaryMarkdown', () => {
  it('parses the full SRD glossary markdown', () => {
    const content = readFileSync(glossaryMarkdownPath, 'utf-8');
    const glossary = parseGlossaryMarkdown(content);

    expect(glossary.source).toBe('SRD 5.2');
    expect(glossary.abbreviations.length).toBeGreaterThan(30);
    expect(glossary.entries.length).toBeGreaterThan(140);

    const blinded = glossary.entries.find((entry) => entry.id === 'blinded');
    expect(blinded).toMatchObject({
      name: 'Blinded',
      tag: 'Condition',
      condition: 'Blinded',
    });
    expect(blinded?.subsections?.length).toBeGreaterThan(0);

    const action = glossary.entries.find((entry) => entry.id === 'action');
    expect(action?.relatedEntryIds).toEqual(
      expect.arrayContaining(['attack', 'dash', 'dodge', 'utilize']),
    );

    const study = glossary.entries.find((entry) => entry.id === 'study');
    expect(study?.tables?.some((table) => table.title === 'Areas of Knowledge')).toBe(true);

    const armorClass = glossary.entries.find((entry) => entry.id === 'armor-class');
    expect(armorClass?.aliases).toContain('AC');
  });
});
