import { describe, it, expect } from 'vitest';
import {
  getSpellTemplate,
  getMonsterTemplate,
  getSpeciesTemplate,
  getBackgroundTemplate,
  getFeatTemplate,
} from '../../src/templates';

describe('getSpeciesTemplate', () => {
  it('returns an object with required fields', () => {
    const template = getSpeciesTemplate();
    expect(template.id).toBe('');
    expect(template.source).toBe('');
    expect(template.size).toBe('Medium');
    expect(template.speed).toBe(30);
    expect(template.languages).toEqual([]);
    expect(template.abilityBonuses).toEqual({});
    expect(template.baseTraits).toEqual([]);
  });
});

describe('getBackgroundTemplate', () => {
  it('returns an object with required fields', () => {
    const template = getBackgroundTemplate();
    expect(template.id).toBe('');
    expect(template.source).toBe('');
    expect(template.skillProficiencies).toEqual([]);
    expect(template.toolProficiencies).toEqual([]);
    expect(template.languages).toEqual([]);
    expect(template.originFeatId).toBe('');
    expect(template.startingGold).toBe(0);
  });
});

describe('getFeatTemplate', () => {
  it('returns an object with required fields', () => {
    const template = getFeatTemplate();
    expect(template.id).toBe('');
    expect(template.source).toBe('');
    expect(template.description).toBe('');
    expect(template.category).toBe('General');
  });
});

describe('getSpellTemplate', () => {
  it('returns a valid spell-like object', () => {
    const template = getSpellTemplate();
    expect(template.id).toBe('');
    expect(template.level).toBe(0);
    expect(template.school).toBe('Evocation');
  });
});

describe('getMonsterTemplate', () => {
  it('returns a valid monster-like object', () => {
    const template = getMonsterTemplate();
    expect(template.id).toBe('');
    expect(template.size).toBe('Medium');
    expect(template.type).toBe('Humanoid');
  });
});
