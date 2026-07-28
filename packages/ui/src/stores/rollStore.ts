import { create } from 'zustand';

/**
 * A single line of a roll result. Used both for simple rolls and for each row
 * of a multi-row (e.g. weapon attack) roll.
 */
export interface RollResultRow {
  label: string;
  expression: string;
  total: number;
  /** Modifier breakdown, e.g. `[{ source: 'STR', value: 3 }, { source: 'PB', value: 3 }]`. */
  components?: Array<{ source: string; value: number }>;
}

/**
 * Result of a dice roll surfaced by {@link DiceRollOverlay}.
 *
 * The core fields (`id`, `label`, `expression`, `total`, `timestamp`) are
 * backward compatible with the original spellbook `RollResult`. All extended
 * fields are optional so existing call sites keep working unchanged.
 */
export interface RollResult {
  id: string;
  label: string;
  expression: string;
  total: number;
  timestamp: number;
  /** Modifier breakdown for the top-level roll, e.g. "WIS +3 | PB +2". */
  components?: Array<{ source: string; value: number }>;
  /** Display mode. Defaults to a single-line roll when omitted. */
  mode?: 'single' | 'weapon-attack';
  /** Rows rendered when `mode === 'weapon-attack'` (attack row, then damage row). */
  rows?: RollResultRow[];
  /** Critical hit (natural 20 / crit) — renders a 🎯 glyph + success color. */
  isCritical?: boolean;
  /** Critical miss (natural 1) — renders a 💥 glyph + danger color. */
  isCriticalMiss?: boolean;
  /** Individual d20 values (2 for adv/dis, 1 for normal) */
  rolls?: readonly number[];
}

interface RollState {
  recentRolls: RollResult[];
  latestRoll: RollResult | null;
  addRoll: (roll: Omit<RollResult, 'id' | 'timestamp'>) => void;
  clearRolls: () => void;
}

/** How long the latest roll stays visible in the overlay before auto-clearing. */
const AUTO_CLEAR_MS = 5000;
/** Maximum number of rolls retained in the history buffer. */
const MAX_RECENT_ROLLS = 10;

export const useRollStore = create<RollState>((set) => ({
  recentRolls: [],
  latestRoll: null,

  addRoll: (roll) => {
    const newRoll: RollResult = {
      ...roll,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
    };

    set((state) => ({
      latestRoll: newRoll,
      recentRolls: [newRoll, ...state.recentRolls].slice(0, MAX_RECENT_ROLLS),
    }));

    // Auto-clear the latest roll after a delay (only if it's still the latest).
    setTimeout(() => {
      set((state) => ({
        latestRoll: state.latestRoll?.id === newRoll.id ? null : state.latestRoll,
      }));
    }, AUTO_CLEAR_MS);
  },

  clearRolls: () => set({ recentRolls: [], latestRoll: null }),
}));
