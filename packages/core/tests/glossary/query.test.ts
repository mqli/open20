import { describe, it, expect } from 'vitest';
import {
  getAllGlossaryEntries,
  getGlossaryAbbreviation,
  getGlossaryAbbreviations,
  getGlossaryEntriesByTag,
  getGlossaryEntry,
  getGlossaryEntryByName,
  getRulesGlossary,
  resolveGlossaryTerm,
  searchGlossaryEntries,
} from '../../src/glossary/query';
import { createTestLoader } from '../create-test-loader';
import { createDataLoader } from '../../src/data/default-loader';

describe('glossary query', () => {
  const data = createTestLoader();

  it('gets a glossary entry by id', () => {
    const entry = getGlossaryEntry('advantage', data);
    expect(entry?.name).toBe('Advantage');
  });

  it('gets a glossary entry by display name', () => {
    const entry = getGlossaryEntryByName('Concentration', data);
    expect(entry?.id).toBe('concentration');
  });

  it('resolves terms by name, slug, and alias', () => {
    expect(resolveGlossaryTerm('Blinded', data)?.id).toBe('blinded');
    expect(resolveGlossaryTerm('armor-class', data)?.name).toBe('Armor Class');
    expect(resolveGlossaryTerm('AC', data)?.id).toBe('armor-class');
  });

  it('filters entries by tag', () => {
    const conditions = getGlossaryEntriesByTag('Condition', data);
    expect(conditions).toHaveLength(1);
    expect(conditions[0]?.id).toBe('blinded');
  });

  it('searches entries by name and alias', () => {
    expect(searchGlossaryEntries({ name: 'armor' }, data)).toHaveLength(1);
    expect(searchGlossaryEntries({ name: 'ac' }, data)).toHaveLength(1);
    expect(searchGlossaryEntries({ tag: 'Condition' }, data)).toHaveLength(1);
  });

  it('returns abbreviations and the merged rules glossary document', () => {
    expect(getGlossaryAbbreviation('AC', data)?.expansion).toBe('Armor Class');
    expect(getGlossaryAbbreviations(data)).toHaveLength(2);
    expect(getAllGlossaryEntries(data)).toHaveLength(4);
    expect(getRulesGlossary(data).entries).toHaveLength(4);
  });

  it('registers and unregisters glossary content with content packs', () => {
    const loader = createDataLoader();
    loader.registerContentPack({
      meta: {
        id: 'temp-glossary',
        name: 'Temp Glossary',
        version: '1.0.0',
        source: 'Temp',
      },
      glossary: {
        source: 'Temp',
        abbreviations: [{ abbr: 'XP', expansion: 'Experience Points' }],
        entries: [
          {
            id: 'experience-points',
            source: 'Temp',
            name: 'Experience Points',
            content: ['Experience Points measure character advancement.'],
          },
        ],
      },
    });

    expect(getGlossaryEntry('experience-points', loader)?.source).toBe('Temp');
    expect(getGlossaryAbbreviation('XP', loader)?.expansion).toBe('Experience Points');

    loader.unregisterContentPack('temp-glossary');
    expect(getGlossaryEntry('experience-points', loader)).toBeUndefined();
    expect(getGlossaryAbbreviation('XP', loader)).toBeUndefined();
  });
});
