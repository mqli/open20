import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePackDetailStore } from './packDetailStore';

// Mock content-manager - must use inline factory
vi.mock('./content-manager', () => ({
  default: {
    loadPack: vi.fn(),
    isBuiltInPack: vi.fn(),
  },
}));

const getManager = async () => {
  const mod = await import('./content-manager');
  return mod.default;
};

describe('packDetailStore', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const mgr = await getManager();
    vi.mocked(mgr.loadPack).mockReset();
    vi.mocked(mgr.isBuiltInPack).mockReset();
    usePackDetailStore.setState({
      pack: null,
      loading: false,
      error: null,
      activeTab: 'all',
      selectedIds: [],
      inlineEditSpell: null,
      isBuiltIn: false,
    });
  });

  it('has correct initial state', () => {
    const state = usePackDetailStore.getState();
    expect(state.pack).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.activeTab).toBe('all');
    expect(state.selectedIds).toEqual([]);
    expect(state.inlineEditSpell).toBeNull();
    expect(state.isBuiltIn).toBe(false);
  });

  it('loadPack loads pack data', async () => {
    const mgr = await getManager();
    const mockPack = {
      meta: { id: 'pack-1', name: 'Pack 1', version: '1.0.0', source: 'Test' },
      spells: [],
    };
    vi.mocked(mgr.loadPack).mockResolvedValue(mockPack);
    vi.mocked(mgr.isBuiltInPack).mockReturnValue(false);

    await usePackDetailStore.getState().loadPack('pack-1');

    const state = usePackDetailStore.getState();
    expect(state.pack).toEqual(mockPack);
    expect(state.loading).toBe(false);
    expect(state.isBuiltIn).toBe(false);
  });

  it('loadPack handles not found', async () => {
    const mgr = await getManager();
    vi.mocked(mgr.loadPack).mockResolvedValue(null);

    await usePackDetailStore.getState().loadPack('nonexistent');

    const state = usePackDetailStore.getState();
    expect(state.error).toContain('Pack not found');
    expect(state.loading).toBe(false);
  });

  it('setActiveTab changes tab', () => {
    usePackDetailStore.getState().setActiveTab('spells');
    expect(usePackDetailStore.getState().activeTab).toBe('spells');
  });

  it('toggleSelectedId adds id when not selected', () => {
    usePackDetailStore.getState().toggleSelectedId('spell-1');
    expect(usePackDetailStore.getState().selectedIds).toEqual(['spell-1']);
  });

  it('toggleSelectedId removes id when already selected', () => {
    usePackDetailStore.setState({ selectedIds: ['spell-1', 'spell-2'] });
    usePackDetailStore.getState().toggleSelectedId('spell-1');
    expect(usePackDetailStore.getState().selectedIds).toEqual(['spell-2']);
  });

  it('selectAll sets all ids', () => {
    usePackDetailStore.getState().selectAll(['spell-1', 'spell-2', 'spell-3']);
    expect(usePackDetailStore.getState().selectedIds).toEqual(['spell-1', 'spell-2', 'spell-3']);
  });

  it('clearSelection empties selectedIds', () => {
    usePackDetailStore.setState({ selectedIds: ['spell-1', 'spell-2'] });
    usePackDetailStore.getState().clearSelection();
    expect(usePackDetailStore.getState().selectedIds).toEqual([]);
  });

  it('setInlineEditSpell sets spell for editing', () => {
    const spell = { id: 'spell-1', name: 'Fireball', level: 3 } as any;
    usePackDetailStore.getState().setInlineEditSpell(spell);
    expect(usePackDetailStore.getState().inlineEditSpell).toEqual(spell);
  });

  it('setInlineEditSpell clears spell when null', () => {
    usePackDetailStore.setState({ inlineEditSpell: { id: 'spell-1' } as any });
    usePackDetailStore.getState().setInlineEditSpell(null);
    expect(usePackDetailStore.getState().inlineEditSpell).toBeNull();
  });
});
