import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useBrowserStore } from './browserStore';

// The browserStore creates `new ContentBrowser(manager)` at module load time.
// We need a mock that can be accessed both during construction and in tests.
// Use a getter pattern to avoid hoisting issues.

vi.mock('@open20/content/browser', () => {
  // Must use vi.fn() directly here - no external vars due to hoisting
  const searchSpy = vi.fn();
  // Store it globally so tests can access it
  (globalThis as any).__browserSearchSpy = searchSpy;

  return {
    ContentBrowser: vi.fn().mockImplementation(function (this: any) {
      this.searchSpells = searchSpy;
    }),
  };
});

vi.mock('./contentManager', () => ({
  default: {},
}));

const getSearchSpy = () => (globalThis as any).__browserSearchSpy as ReturnType<typeof vi.fn>;

describe('browserStore', () => {
  beforeEach(() => {
    const spy = getSearchSpy();
    spy.mockReset();
    vi.clearAllMocks();
    useBrowserStore.setState({
      filters: {},
      results: [],
      loading: false,
      error: null,
    });
  });

  it('has correct initial state', () => {
    const state = useBrowserStore.getState();
    expect(state.filters).toEqual({});
    expect(state.results).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('setFilter updates filter and triggers search', async () => {
    const spy = getSearchSpy();
    spy.mockResolvedValue([{ id: 'spell-1', name: 'Fireball' }]);

    await useBrowserStore.getState().setFilter('school', 'Evocation');

    const state = useBrowserStore.getState();
    expect(state.filters).toEqual({ school: 'Evocation' });
    expect(state.results).toEqual([{ id: 'spell-1', name: 'Fireball' }]);
    expect(state.loading).toBe(false);
  });

  it('clearFilters resets all filters and triggers search', async () => {
    const spy = getSearchSpy();
    useBrowserStore.setState({
      filters: { school: 'Evocation', level: 3, source: 'SRD' },
    });
    spy.mockResolvedValue([{ id: 'spell-1', name: 'Fireball' }]);

    await useBrowserStore.getState().clearFilters();

    const state = useBrowserStore.getState();
    expect(state.filters).toEqual({});
    expect(state.results).toEqual([{ id: 'spell-1', name: 'Fireball' }]);
  });

  it('searchSpells handles errors', async () => {
    const spy = getSearchSpy();
    spy.mockRejectedValue(new Error('Search failed'));

    await useBrowserStore.getState().searchSpells();

    const state = useBrowserStore.getState();
    expect(state.error).toContain('Search failed');
    expect(state.loading).toBe(false);
  });
});
