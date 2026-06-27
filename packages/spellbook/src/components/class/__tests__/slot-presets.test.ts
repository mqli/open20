import { describe, it, expect } from 'vitest';
import { PRESETS, getPreset } from '@/core/slot-presets';

describe('SlotPresets', () => {
  describe('PRESETS', () => {
    it('should have exactly 3 presets', () => {
      expect(PRESETS).toHaveLength(3);
    });

    it('should have unique ids', () => {
      const ids = PRESETS.map((p) => p.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('should have required fields on every preset', () => {
      for (const preset of PRESETS) {
        expect(preset.id).toBeTruthy();
        expect(preset.name).toBeTruthy();
        expect(preset.description).toBeTruthy();
        expect(preset.spellSlotsByLevel).toBeDefined();
        expect(preset.cantripsByLevel).toBeDefined();
        expect(preset.preparedByLevel).toBeDefined();
        expect(preset.spellcasting).toBeDefined();
      }
    });

    it('should have correct preset ids', () => {
      expect(PRESETS[0].id).toBe('full-caster');
      expect(PRESETS[1].id).toBe('half-caster');
      expect(PRESETS[2].id).toBe('pact-magic');
    });
  });

  describe('full-caster', () => {
    const fullCaster = PRESETS.find((p) => p.id === 'full-caster')!;

    it('should exist', () => {
      expect(fullCaster).toBeDefined();
    });

    it('should have 2 level-1 slots at class level 1', () => {
      const slots = fullCaster.spellSlotsByLevel[1];
      expect(slots).toBeDefined();
      expect(slots).toHaveLength(9);
      expect(slots[0]).toBe(2); // 1st-level slots
      expect(slots[1]).toBe(0); // 2nd-level slots
    });

    it('should have 4 level-1 and 2 level-2 slots at class level 3', () => {
      const slots = fullCaster.spellSlotsByLevel[3];
      expect(slots).toBeDefined();
      expect(slots[0]).toBe(4);
      expect(slots[1]).toBe(2);
    });

    it('should have all 9 levels at class level 20', () => {
      const slots = fullCaster.spellSlotsByLevel[20];
      expect(slots).toBeDefined();
      // A level 20 full caster should have some 9th-level slot
      expect(slots[8]).toBeGreaterThanOrEqual(1);
    });

    it('should have all slot arrays of length 9', () => {
      for (let lvl = 1; lvl <= 20; lvl++) {
        expect(fullCaster.spellSlotsByLevel[lvl]).toHaveLength(9);
      }
    });
  });

  describe('half-caster', () => {
    const halfCaster = PRESETS.find((p) => p.id === 'half-caster')!;

    it('should have no slots at class level 1', () => {
      const slots = halfCaster.spellSlotsByLevel[1];
      expect(slots).toBeDefined();
      expect(slots.every((s) => s === 0)).toBe(true);
    });

    it('should have no slots at class level 2', () => {
      const slots = halfCaster.spellSlotsByLevel[2];
      expect(slots).toBeDefined();
      expect(slots.every((s) => s === 0)).toBe(true);
    });

    it('should have 2 level-1 slots at class level 3', () => {
      const slots = halfCaster.spellSlotsByLevel[3];
      expect(slots).toBeDefined();
      expect(slots[0]).toBe(2);
    });

    it('should have all slot arrays of length 9', () => {
      for (let lvl = 1; lvl <= 20; lvl++) {
        expect(halfCaster.spellSlotsByLevel[lvl]).toHaveLength(9);
      }
    });
  });

  describe('pact-magic', () => {
    const pactMagic = PRESETS.find((p) => p.id === 'pact-magic')!;

    it('should have empty spellSlotsByLevel', () => {
      expect(pactMagic.spellSlotsByLevel).toEqual({});
    });

    it('should have pactMagic set to true in spellcasting', () => {
      expect(pactMagic.spellcasting.pactMagic).toBe(true);
    });

    it('should have pactMagicSlots defined', () => {
      expect(pactMagic.spellcasting.pactMagicSlots).toBeDefined();
      // Pact magic slots at level 1
      expect(pactMagic.spellcasting.pactMagicSlots![1].slots).toBe(1);
      expect(pactMagic.spellcasting.pactMagicSlots![1].slotLevel).toBe(1);
    });
  });

  describe('getPreset', () => {
    it('should find full-caster by id', () => {
      const preset = getPreset('full-caster');
      expect(preset).toBeDefined();
      expect(preset?.id).toBe('full-caster');
    });

    it('should find half-caster by id', () => {
      const preset = getPreset('half-caster');
      expect(preset).toBeDefined();
      expect(preset?.id).toBe('half-caster');
    });

    it('should find pact-magic by id', () => {
      const preset = getPreset('pact-magic');
      expect(preset).toBeDefined();
      expect(preset?.id).toBe('pact-magic');
    });

    it('should return undefined for unknown id', () => {
      const preset = getPreset('non-existent');
      expect(preset).toBeUndefined();
    });
  });
});
