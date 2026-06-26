/**
 * 法术位进度预设模板 — 供自定义职业编辑器选用
 *
 * 每个 preset 提供完整的 spellSlotsByLevel（等级1-20 → [1环,2环,...,9环]）
 * 以及推荐的每级 cantripsKnown / preparedSpells 值。
 *
 * 格式与 `Class.spellSlotsByLevel` 完全兼容：
 *   Record<number, readonly number[]>  (classLevel → 9-element array)
 */

import type { Spellcasting } from 'open20-core';

// ── Slot table helpers ──────────────────────────────────────

/** Build a 9-element array from a Record<slotLevel, count>. */
function buildSlotArray(slots: Record<number, number>): readonly number[] {
  const arr = Array.from({ length: 9 }, (_, i) => slots[i + 1] ?? 0);
  return arr;
}

/** Build a spellSlotsByLevel table for a single progression pattern (1→20 with same slot counts). */
function buildPerLevel(
  getSlots: (level: number) => Record<number, number>,
): Readonly<Record<number, ReadonlyArray<number>>> {
  const result: Record<number, readonly number[]> = {};
  for (let lvl = 1; lvl <= 20; lvl++) {
    result[lvl] = buildSlotArray(getSlots(lvl));
  }
  return result;
}

// ── Raw data: D&D 5e 2024 full-caster progression ────────────

const FULL_CASTER_RAW: Record<number, Record<number, number>> = {
  1: { 1: 2 },
  2: { 1: 3 },
  3: { 1: 4, 2: 2 },
  4: { 1: 4, 2: 3 },
  5: { 1: 4, 2: 3, 3: 2 },
  6: { 1: 4, 2: 3, 3: 3 },
  7: { 1: 4, 2: 3, 3: 3, 4: 1 },
  8: { 1: 4, 2: 3, 3: 3, 4: 2 },
  9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
};

// D&D 5e 2024 half-caster progression (Paladin/Ranger)
const HALF_CASTER_RAW: Record<number, Record<number, number>> = {
  1: {},
  2: {},
  3: { 1: 2 },
  4: { 1: 2 },
  5: { 1: 3 },
  6: { 1: 3 },
  7: { 1: 4, 2: 2 },
  8: { 1: 4, 2: 2 },
  9: { 1: 4, 2: 3 },
  10: { 1: 4, 2: 3 },
  11: { 1: 4, 2: 3, 3: 2 },
  12: { 1: 4, 2: 3, 3: 2 },
  13: { 1: 4, 2: 3, 3: 3 },
  14: { 1: 4, 2: 3, 3: 3 },
  15: { 1: 4, 2: 3, 3: 3, 4: 1 },
  16: { 1: 4, 2: 3, 3: 3, 4: 1 },
  17: { 1: 4, 2: 3, 3: 3, 4: 2 },
  18: { 1: 4, 2: 3, 3: 3, 4: 2 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
};

// Cantrips known (common pattern for full casters)
const CANTRIBS_FULL: Record<number, number> = {
  1: 3,
  2: 3,
  3: 3,
  4: 4,
  5: 4,
  6: 4,
  7: 4,
  8: 4,
  9: 4,
  10: 5,
  11: 5,
  12: 5,
  13: 5,
  14: 5,
  15: 5,
  16: 5,
  17: 5,
  18: 5,
  19: 5,
  20: 5,
};

// Prepared spells = classLevel + spellcastingMod (user sets mod separately)
// We store the "level" part and the mod is added at runtime.
// For the preset we provide the classic Cleric-style per-level values.
const PREPARED_FULL: Record<number, number> = {
  1: 4,
  2: 5,
  3: 6,
  4: 7,
  5: 9,
  6: 10,
  7: 11,
  8: 12,
  9: 14,
  10: 15,
  11: 16,
  12: 16,
  13: 17,
  14: 17,
  15: 18,
  16: 18,
  17: 19,
  18: 20,
  19: 21,
  20: 22,
};

const PREPARED_HALF: Record<number, number> = {
  1: 0,
  2: 0,
  3: 2,
  4: 3,
  5: 3,
  6: 4,
  7: 4,
  8: 5,
  9: 5,
  10: 6,
  11: 6,
  12: 7,
  13: 7,
  14: 8,
  15: 8,
  16: 9,
  17: 9,
  18: 10,
  19: 10,
  20: 11,
};

// ── Preset definitions ──────────────────────────────────────

export interface SlotProgressionPreset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** Full spellSlotsByLevel table (1-20), ready to assign to Class.spellSlotsByLevel. */
  readonly spellSlotsByLevel: Readonly<Record<number, ReadonlyArray<number>>>;
  /** Recommended cantripsKnown by class level. */
  readonly cantripsByLevel: Record<number, number>;
  /** Recommended preparedSpells by class level. */
  readonly preparedByLevel: Record<number, number>;
  /** Default Spellcasting config for this preset. */
  readonly spellcasting: Spellcasting;
}

export const PRESETS: SlotProgressionPreset[] = [
  {
    id: 'full-caster',
    name: 'Full Caster',
    description: '像法师/牧师/德鲁伊一样的全施法者进度',
    spellSlotsByLevel: buildPerLevel((lvl) => FULL_CASTER_RAW[lvl] ?? {}),
    cantripsByLevel: CANTRIBS_FULL,
    preparedByLevel: PREPARED_FULL,
    spellcasting: {
      ability: 'Intelligence',
      knownSource: 'class_list',
      preparationTiming: 'long_rest',
      changesPerPreparation: 'all',
    },
  },
  {
    id: 'half-caster',
    name: 'Half Caster',
    description: '像圣武士/游侠一样的半施法者进度',
    spellSlotsByLevel: buildPerLevel((lvl) => HALF_CASTER_RAW[lvl] ?? {}),
    cantripsByLevel: CANTRIBS_FULL,
    preparedByLevel: PREPARED_HALF,
    spellcasting: {
      ability: 'Wisdom',
      knownSource: 'class_list',
      preparationTiming: 'long_rest',
      changesPerPreparation: 'all',
    },
  },
  {
    id: 'pact-magic',
    name: 'Pact Magic',
    description: '像邪术师一样的契约魔法（短休恢复法术位）',
    spellSlotsByLevel: {},
    cantripsByLevel: CANTRIBS_FULL,
    preparedByLevel: PREPARED_FULL,
    spellcasting: {
      ability: 'Charisma',
      knownSource: 'class_list',
      preparationTiming: 'level_up',
      changesPerPreparation: 'all',
      pactMagic: true,
      pactMagicSlots: {
        1: { slots: 1, slotLevel: 1 },
        2: { slots: 2, slotLevel: 1 },
        3: { slots: 2, slotLevel: 2 },
        4: { slots: 2, slotLevel: 2 },
        5: { slots: 2, slotLevel: 3 },
        6: { slots: 2, slotLevel: 3 },
        7: { slots: 2, slotLevel: 4 },
        8: { slots: 2, slotLevel: 4 },
        9: { slots: 2, slotLevel: 5 },
        10: { slots: 2, slotLevel: 5 },
        11: { slots: 3, slotLevel: 5 },
        12: { slots: 3, slotLevel: 5 },
        13: { slots: 3, slotLevel: 5 },
        14: { slots: 3, slotLevel: 5 },
        15: { slots: 3, slotLevel: 5 },
        16: { slots: 3, slotLevel: 5 },
        17: { slots: 4, slotLevel: 5 },
        18: { slots: 4, slotLevel: 5 },
        19: { slots: 4, slotLevel: 5 },
        20: { slots: 4, slotLevel: 5 },
      },
    },
  },
];

/** Find a preset by its id. */
export function getPreset(id: string): SlotProgressionPreset | undefined {
  return PRESETS.find((p) => p.id === id);
}
