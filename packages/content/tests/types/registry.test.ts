import { describe, it, expect } from 'vitest';
import type { ContentTypeId } from '../../src/types';
import { contentTypes } from '../../src/types';

describe('ContentTypeId', () => {
  it('should accept all 11 valid type IDs', () => {
    const ids: ContentTypeId[] = [
      'species',
      'backgrounds',
      'classes',
      'subclasses',
      'feats',
      'spells',
      'weapons',
      'armors',
      'gears',
      'monsters',
      'glossary',
    ];
    expect(ids).toHaveLength(11);
  });
});

describe('contentTypes', () => {
  it('should be an array', () => {
    expect(Array.isArray(contentTypes)).toBe(true);
  });

  it('should have spell registered in Phase 1 (Task D)', () => {
    expect(contentTypes[0].id).toBe('spells');
    expect(contentTypes[0].name).toBe('Spells');
  });

  it('should have species, backgrounds, feats registered in Phase 3 (Task O)', () => {
    const ids = contentTypes.map((c) => c.id);
    expect(ids).toContain('species');
    expect(ids).toContain('backgrounds');
    expect(ids).toContain('feats');
    expect(contentTypes).toHaveLength(8);
  });
});
