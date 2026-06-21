import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBrowserStore } from './browserStore';

vi.mock('@open20/content/browser', () => {
  const searchSpellsSpy = vi.fn();
  const searchMonstersSpy = vi.fn();
  (globalThis as any).__browserSearchSpellsSpy = searchSpellsSpy;
  (globalThis as any).__browserSearchMonstersSpy = searchMonstersSpy;

  return {
    ContentBrowser: vi.fn().mockImplementation(function (this: any) {
      this.searchSpells = searchSpellsSpy;
      this.searchMonsters = searchMonstersSpy;
    }),
  };
});

vi.mock('./contentManager', () => ({
  default: {},
}));

const getSearchSpellsSpy = () =>
  (globalThis as any).__browserSearchSpellsSpy as ReturnType<typeof vi.fn>;
const getSearchMonstersSpy = () =>
  (globalThis as any).__browserSearchMonstersSpy as ReturnType<typeof vi.fn>;

describe('browserStore', () => {
  beforeEach(() => {
    getSearchSpellsSpy().mockReset();
    getSearchMonstersSpy().mockReset();
    vi.clearAllMocks();
    useBrowserStore.setState({
      activeTab: 'spells',
      spellFilters: {},
      monsterFilters: {},
      results: [],
      loading: false,
      error: null,
    });
  });

  it('has correct initial state', () => {
    const state = useBrowserStore.getState();
    expect(state.activeTab).toBe('spells');
    expect(state.spellFilters).toEqual({});
    expect(state.monsterFilters).toEqual({});
    expect(state.results).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('setSpellFilter updates filter and triggers search', async () => {
    const spy = getSearchSpellsSpy();
    spy.mockResolvedValue([{ id: 'spell-1', name: 'Fireball' }]);

    await useBrowserStore.getState().setSpellFilter('school', 'Evocation');

    const state = useBrowserStore.getState();
    expect(state.spellFilters).toEqual({ school: 'Evocation' });
    expect(state.results).toEqual([{ id: 'spell-1', name: 'Fireball' }]);
    expect(state.loading).toBe(false);
  });

  it('clearFilters resets all filters and triggers search', async () => {
    const spy = getSearchSpellsSpy();
    useBrowserStore.setState({
      spellFilters: { school: 'Evocation' },
      monsterFilters: { type: 'Dragon' },
    });
    spy.mockResolvedValue([{ id: 'spell-1', name: 'Fireball' }]);

    await useBrowserStore.getState().clearFilters();

    const state = useBrowserStore.getState();
    expect(state.spellFilters).toEqual({});
    expect(state.monsterFilters).toEqual({});
    expect(state.results).toEqual([{ id: 'spell-1', name: 'Fireball' }]);
  });

  it('search handles errors', async () => {
    const spy = getSearchSpellsSpy();
    spy.mockRejectedValue(new Error('Search failed'));

    await useBrowserStore.getState().search();

    const state = useBrowserStore.getState();
    expect(state.error).toContain('Search failed');
    expect(state.loading).toBe(false);
  });

  it('setActiveTab switches tab and triggers search', async () => {
    const monsterSpy = getSearchMonstersSpy();
    monsterSpy.mockResolvedValue([{ id: 'goblin', name: 'Goblin' }]);

    await useBrowserStore.getState().setActiveTab('monsters');

    const state = useBrowserStore.getState();
    expect(state.activeTab).toBe('monsters');
    expect(state.results).toEqual([{ id: 'goblin', name: 'Goblin' }]);
  });

  it('setMonsterFilter updates monster filter and triggers search', async () => {
    useBrowserStore.setState({ activeTab: 'monsters' });
    const spy = getSearchMonstersSpy();
    spy.mockResolvedValue([{ id: 'dragon', name: 'Red Dragon' }]);

    await useBrowserStore.getState().setMonsterFilter('type', 'Dragon');

    const state = useBrowserStore.getState();
    expect(state.monsterFilters).toEqual({ type: 'Dragon' });
    expect(state.results).toEqual([{ id: 'dragon', name: 'Red Dragon' }]);
  });
});
