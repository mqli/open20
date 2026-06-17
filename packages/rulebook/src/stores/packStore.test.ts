import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usePackStore } from './packStore';

// Mock content-manager - must use inline factory, no top-level vars
vi.mock('./content-manager', () => ({
  default: {
    listPacks: vi.fn(),
    createPack: vi.fn(),
    savePack: vi.fn(),
    deletePack: vi.fn(),
    isPackEnabled: vi.fn(),
    enablePack: vi.fn(),
    disablePack: vi.fn(),
    isBuiltInPack: vi.fn(),
  },
}));

// Dynamic import to get the mocked module
const getManager = async () => {
  const mod = await import('./content-manager');
  return mod.default;
};

describe('packStore', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const mgr = await getManager();
    vi.mocked(mgr.listPacks).mockReset();
    vi.mocked(mgr.createPack).mockReset();
    vi.mocked(mgr.savePack).mockReset();
    vi.mocked(mgr.isPackEnabled).mockReset();
    vi.mocked(mgr.enablePack).mockReset();
    vi.mocked(mgr.disablePack).mockReset();
    vi.mocked(mgr.isBuiltInPack).mockReset();
    // Reset store state
    usePackStore.setState({
      packs: [],
      loading: false,
      error: null,
    });
  });

  it('has correct initial state', () => {
    const state = usePackStore.getState();
    expect(state.packs).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  it('fetchPacks updates packs and loading state', async () => {
    const mgr = await getManager();
    const mockPacks = [
      { id: 'pack-1', name: 'Pack 1', version: '1.0.0', source: 'Test' },
      { id: 'pack-2', name: 'Pack 2', version: '1.0.0', source: 'Test' },
    ];
    vi.mocked(mgr.listPacks).mockResolvedValue(mockPacks);

    await usePackStore.getState().fetchPacks();

    const state = usePackStore.getState();
    expect(state.packs).toEqual(mockPacks);
    expect(state.loading).toBe(false);
    expect(mgr.listPacks).toHaveBeenCalled();
  });

  it('fetchPacks handles errors', async () => {
    const mgr = await getManager();
    vi.mocked(mgr.listPacks).mockRejectedValue(new Error('Failed to load'));

    await usePackStore.getState().fetchPacks();

    const state = usePackStore.getState();
    expect(state.error).toContain('Failed to load');
    expect(state.loading).toBe(false);
  });

  it('createAndSavePack creates and refreshes pack list', async () => {
    const mgr = await getManager();
    const newMeta = { id: 'new-pack', name: 'New Pack', version: '1.0.0', source: 'Test' };
    const createdPack = { meta: newMeta, spells: [] };
    vi.mocked(mgr.createPack).mockReturnValue(createdPack);
    vi.mocked(mgr.savePack).mockResolvedValue(undefined);
    vi.mocked(mgr.listPacks).mockResolvedValue([newMeta]);

    await usePackStore.getState().createAndSavePack(newMeta);

    expect(mgr.createPack).toHaveBeenCalledWith(newMeta);
    expect(mgr.savePack).toHaveBeenCalledWith(createdPack);
    expect(mgr.listPacks).toHaveBeenCalled();

    const state = usePackStore.getState();
    expect(state.packs).toEqual([newMeta]);
  });

  it('isPackEnabled delegates to manager', async () => {
    const mgr = await getManager();
    vi.mocked(mgr.isPackEnabled).mockReturnValue(true);
    expect(usePackStore.getState().isPackEnabled('pack-1')).toBe(true);
    expect(mgr.isPackEnabled).toHaveBeenCalledWith('pack-1');
  });

  it('isBuiltInPack delegates to manager', async () => {
    const mgr = await getManager();
    vi.mocked(mgr.isBuiltInPack).mockReturnValue(true);
    expect(usePackStore.getState().isBuiltInPack('srd-pack')).toBe(true);
  });

  it('togglePackEnabled enables disabled pack', async () => {
    const mgr = await getManager();
    usePackStore.setState({
      packs: [{ id: 'pack-1', name: 'Pack 1', version: '1.0.0', source: 'Test' }],
    });
    vi.mocked(mgr.isPackEnabled).mockReturnValue(false);

    usePackStore.getState().togglePackEnabled('pack-1');
    expect(mgr.enablePack).toHaveBeenCalledWith('pack-1');
  });

  it('togglePackEnabled disables enabled pack', async () => {
    const mgr = await getManager();
    usePackStore.setState({
      packs: [{ id: 'pack-1', name: 'Pack 1', version: '1.0.0', source: 'Test' }],
    });
    vi.mocked(mgr.isPackEnabled).mockReturnValue(true);

    usePackStore.getState().togglePackEnabled('pack-1');
    expect(mgr.disablePack).toHaveBeenCalledWith('pack-1');
  });
});
