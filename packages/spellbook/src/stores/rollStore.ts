import { create } from 'zustand';

export interface RollResult {
  id: string;
  label: string;
  expression: string;
  total: number;
  timestamp: number;
}

interface RollState {
  recentRolls: RollResult[];
  latestRoll: RollResult | null;
  addRoll: (roll: Omit<RollResult, 'id' | 'timestamp'>) => void;
  clearRolls: () => void;
}

export const useRollStore = create<RollState>((set) => ({
  recentRolls: [],
  latestRoll: null,

  addRoll: (roll) => {
    const newRoll = {
      ...roll,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
    };

    set((state) => ({
      latestRoll: newRoll,
      recentRolls: [newRoll, ...state.recentRolls].slice(0, 10),
    }));

    // Auto-clear latest roll after a delay
    setTimeout(() => {
      set((state) => ({
        latestRoll: state.latestRoll?.id === newRoll.id ? null : state.latestRoll,
      }));
    }, 5000);
  },

  clearRolls: () => set({ recentRolls: [], latestRoll: null }),
}));
