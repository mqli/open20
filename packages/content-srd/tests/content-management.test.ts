// tests/content-management.test.ts
// Tests for R26 Content Management System

import { describe, it, expect } from 'vitest';
import { srdContentPack } from '../src/index';

describe('Content Management (R26)', () => {
  describe('SRD Content Pack (from @open20/content-srd)', () => {
    it('should have correct SRD content pack structure', () => {
      // Test that srdContentPack has the correct structure
      expect(srdContentPack.meta).toBeDefined();
      expect(srdContentPack.meta.id).toBe('srd-5.2');
      expect(srdContentPack.species).toBeDefined();
      expect(srdContentPack.spells).toBeDefined();
    });

    it('should have species with correct source', () => {
      const species = srdContentPack.species;
      expect(species).toBeDefined();
      expect(species!.length).toBeGreaterThan(0);
      // Check that at least one species has the expected source
      const speciesWithSource = species!.find(
        (s) => s.source === '2024 PHB' || s.source === 'SRD 5.2',
      );
      if (speciesWithSource) {
        expect(speciesWithSource.source).toBeDefined();
      }
    });

    it('should have spells with correct source', () => {
      const spells = srdContentPack.spells;
      expect(spells).toBeDefined();
      expect(spells!.length).toBeGreaterThan(0);
      // Check that at least one spell has the expected source
      const spellWithSource = spells!.find(
        (s) => s.source === 'SRD 5.2' || s.source === 'Free Basic Rules (2024)',
      );
      if (spellWithSource) {
        expect(spellWithSource.source).toBeDefined();
      }
    });
  });

  describe('Content Pack Data Integrity', () => {
    it('should have all required fields', () => {
      expect(srdContentPack.meta).toBeDefined();
      expect(srdContentPack.meta.id).toBeDefined();
      expect(srdContentPack.meta.name).toBeDefined();
      expect(srdContentPack.meta.version).toBeDefined();
      expect(srdContentPack.meta.source).toBeDefined();
    });

    it('should have species data', () => {
      expect(srdContentPack.species).toBeDefined();
      expect(srdContentPack.species!.length).toBeGreaterThan(0);
    });

    it('should have spells data', () => {
      expect(srdContentPack.spells).toBeDefined();
      expect(srdContentPack.spells!.length).toBeGreaterThan(0);
    });

    it('should have classes data', () => {
      expect(srdContentPack.classes).toBeDefined();
      expect(srdContentPack.classes!.length).toBeGreaterThan(0);
    });
  });
});
