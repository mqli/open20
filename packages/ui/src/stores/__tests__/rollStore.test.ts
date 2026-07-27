import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useRollStore } from '../rollStore';

describe('useRollStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useRollStore.getState().clearRolls();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds a roll and assigns id + timestamp', () => {
    useRollStore.getState().addRoll({ label: 'Test', expression: 'd20', total: 15 });
    const { latestRoll, recentRolls } = useRollStore.getState();
    expect(latestRoll).not.toBeNull();
    expect(latestRoll?.id).toBeTruthy();
    expect(latestRoll?.timestamp).toBeGreaterThanOrEqual(0);
    expect(recentRolls).toHaveLength(1);
  });

  it('preserves extended fields (components, mode, rows, crit flags)', () => {
    useRollStore.getState().addRoll({
      label: 'Attack',
      expression: 'd20 + 6',
      total: 22,
      mode: 'weapon-attack',
      isCritical: true,
      components: [{ source: 'STR', value: 3 }],
      rows: [{ label: 'Attack', expression: 'd20 + 6', total: 22 }],
    });
    const { latestRoll } = useRollStore.getState();
    expect(latestRoll?.mode).toBe('weapon-attack');
    expect(latestRoll?.isCritical).toBe(true);
    expect(latestRoll?.components).toEqual([{ source: 'STR', value: 3 }]);
    expect(latestRoll?.rows).toHaveLength(1);
  });

  it('caps the history buffer at 10 entries', () => {
    for (let i = 0; i < 15; i++) {
      useRollStore.getState().addRoll({ label: `Roll ${i}`, expression: 'd20', total: i });
    }
    const { recentRolls } = useRollStore.getState();
    expect(recentRolls).toHaveLength(10);
    // Most recent first
    expect(recentRolls[0].label).toBe('Roll 14');
  });

  it('auto-clears the latest roll after 5000ms', () => {
    useRollStore.getState().addRoll({ label: 'Test', expression: 'd20', total: 15 });
    expect(useRollStore.getState().latestRoll).not.toBeNull();
    vi.advanceTimersByTime(5000);
    expect(useRollStore.getState().latestRoll).toBeNull();
    // History is retained
    expect(useRollStore.getState().recentRolls).toHaveLength(1);
  });

  it('does not clear a newer roll when an older auto-clear fires', () => {
    useRollStore.getState().addRoll({ label: 'First', expression: 'd20', total: 1 });
    vi.advanceTimersByTime(2000);
    useRollStore.getState().addRoll({ label: 'Second', expression: 'd20', total: 2 });
    // First roll's timer fires at 5000ms total, but Second is now latest.
    vi.advanceTimersByTime(3000);
    expect(useRollStore.getState().latestRoll?.label).toBe('Second');
  });

  it('clearRolls resets both latest and history', () => {
    useRollStore.getState().addRoll({ label: 'Test', expression: 'd20', total: 15 });
    useRollStore.getState().clearRolls();
    expect(useRollStore.getState().latestRoll).toBeNull();
    expect(useRollStore.getState().recentRolls).toHaveLength(0);
  });
});
