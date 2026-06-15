import { describe, it, expect } from 'vitest';
import {
  checkImportConflicts,
  importWithResolutions,
  type ConflictResolution,
} from '../../src/io/conflict';
import type { ContentPack } from 'open20-core';
import type { EditableContentPack } from '../../src/types/content-pack';

function makeSpell(id: string, name: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    name,
    level: 1,
    school: 'Evocation',
    castingTime: '1 action',
    range: '60 feet',
    components: ['V', 'S'],
    duration: 'Instantaneous',
    concentration: false,
    ritual: false,
    description: ['A spell...'],
    source: 'SRD 5.2',
    ...overrides,
  };
}

function makePack(id: string, spells: unknown[]): EditableContentPack {
  return {
    meta: { id, name: id, version: '1.0.0', source: 'Test' },
    spells: spells as EditableContentPack['spells'],
  } as EditableContentPack;
}

describe('checkImportConflicts', () => {
  it('detects same-id conflicts', () => {
    const target = makePack('target', [makeSpell('fireball', 'Fireball')]);
    const source = makePack('source', [makeSpell('fireball', 'Fireball v2')]) as ContentPack;

    const conflicts = checkImportConflicts(source, target);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].type).toBe('same-id');
    expect(conflicts[0].incomingId).toBe('fireball');
    expect(conflicts[0].existingId).toBe('fireball');
  });

  it('detects same-name-different-id conflicts', () => {
    const target = makePack('target', [makeSpell('fireball-v1', 'Fireball')]);
    const source = makePack('source', [makeSpell('fireball-v2', 'Fireball')]) as ContentPack;

    const conflicts = checkImportConflicts(source, target);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].type).toBe('same-name-different-id');
    expect(conflicts[0].incomingId).toBe('fireball-v2');
    expect(conflicts[0].existingId).toBe('fireball-v1');
  });

  it('prioritizes same-id over same-name-different-id', () => {
    const target = makePack('target', [makeSpell('fireball', 'Fireball')]);
    const source = makePack('source', [makeSpell('fireball', 'Fireball')]) as ContentPack;

    const conflicts = checkImportConflicts(source, target);
    expect(conflicts.length).toBe(1);
    expect(conflicts[0].type).toBe('same-id');
  });

  it('returns empty array when no conflicts', () => {
    const target = makePack('target', [makeSpell('fireball', 'Fireball')]);
    const source = makePack('source', [makeSpell('magic-missile', 'Magic Missile')]) as ContentPack;

    const conflicts = checkImportConflicts(source, target);
    expect(conflicts.length).toBe(0);
  });

  it('only checks spells array (Phase 1)', () => {
    const target = makePack('target', [makeSpell('fireball', 'Fireball')]);
    const source = {
      ...makePack('source', []),
      monsters: [{ id: 'fireball', name: 'Fireball Monster' }],
    } as ContentPack;

    const conflicts = checkImportConflicts(source, target);
    // Should not detect conflict in monsters array
    expect(conflicts.length).toBe(0);
  });
});

describe('importWithResolutions', () => {
  it('imports without conflict when no resolution needed', () => {
    const target = makePack('target', [makeSpell('fireball', 'Fireball')]);
    const source = makePack('source', [makeSpell('magic-missile', 'Magic Missile')]) as ContentPack;

    const resolutions = new Map<string, ConflictResolution>();
    const result = importWithResolutions(source, target, resolutions);

    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.replaced).toBe(0);
    expect(target.spells!.length).toBe(2);
  });

  it('keep-both: adds with new ID', () => {
    const target = makePack('target', [makeSpell('fireball', 'Fireball')]);
    const source = makePack('source', [makeSpell('fireball', 'Fireball v2')]) as ContentPack;

    const resolutions = new Map<string, ConflictResolution>();
    resolutions.set('spells:fireball', { strategy: 'keep-both', newId: 'fireball-copy' });

    const result = importWithResolutions(source, target, resolutions);
    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(0);
    expect(target.spells!.length).toBe(2);
    expect(target.spells![1].id).toBe('fireball-copy');
  });

  it('replace: replaces existing entry', () => {
    const target = makePack('target', [makeSpell('fireball', 'Fireball')]);
    const source = makePack('source', [makeSpell('fireball', 'Fireball v2')]) as ContentPack;

    const resolutions = new Map<string, ConflictResolution>();
    resolutions.set('spells:fireball', { strategy: 'replace', targetId: 'fireball' });

    const result = importWithResolutions(source, target, resolutions);
    expect(result.replaced).toBe(1);
    expect(target.spells!.length).toBe(1);
    expect(target.spells![0].name).toBe('Fireball v2');
  });

  it('skip: does not add entry', () => {
    const target = makePack('target', [makeSpell('fireball', 'Fireball')]);
    const source = makePack('source', [makeSpell('fireball', 'Fireball v2')]) as ContentPack;

    const resolutions = new Map<string, ConflictResolution>();
    resolutions.set('spells:fireball', { strategy: 'skip' });

    const result = importWithResolutions(source, target, resolutions);
    expect(result.skipped).toBe(1);
    expect(target.spells!.length).toBe(1); // unchanged
  });

  it('ImportResult has correct counts', () => {
    const target = makePack('target', [
      makeSpell('fireball', 'Fireball'),
      makeSpell('ice-knife', 'Ice Knife'),
    ]);
    const source = makePack('source', [
      makeSpell('fireball', 'Fireball v2'),
      makeSpell('magic-missile', 'Magic Missile'),
    ]) as ContentPack;

    const resolutions = new Map<string, ConflictResolution>();
    resolutions.set('spells:fireball', { strategy: 'replace', targetId: 'fireball' });
    // ice-knife: no resolution → auto-import (no conflict for same-name only? wait, same-id exists for fireball only)

    const result = importWithResolutions(source, target, resolutions);
    expect(result.imported).toBe(1); // magic-missile
    expect(result.replaced).toBe(1); // fireball
    expect(result.skipped).toBe(0);
  });
});
