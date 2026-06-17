import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useContentEditorStore } from './contentEditorStore';

// Mock content-manager
vi.mock('./content-manager', () => ({
  default: {
    loadPack: vi.fn(),
    savePack: vi.fn(),
  },
}));

// Mock @open20/content/editor
vi.mock('@open20/content/editor', () => ({
  ContentEditor: vi.fn().mockImplementation(() => ({
    updateSpell: vi.fn(),
    addSpell: vi.fn(),
  })),
}));

const getManager = async () => {
  const mod = await import('./content-manager');
  return mod.default;
};

describe('contentEditorStore', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    useContentEditorStore.setState({
      packId: null,
      contentType: null,
      contentId: null,
      spell: {
        id: '',
        name: '',
        level: 0,
        school: 'Evocation',
        castingTime: 'Action',
        range: '60 feet',
        components: ['V', 'S'],
        duration: 'Instantaneous',
        concentration: false,
        ritual: false,
        description: [''],
        source: 'Homebrew',
        classes: [],
      },
      isDirty: false,
      isPreviewOpen: false,
      isSaving: false,
    });
  });

  it('has correct initial state', () => {
    const state = useContentEditorStore.getState();
    expect(state.packId).toBeNull();
    expect(state.contentType).toBeNull();
    expect(state.contentId).toBeNull();
    expect(state.isDirty).toBe(false);
    expect(state.isPreviewOpen).toBe(false);
    expect(state.isSaving).toBe(false);
    expect(state.spell.school).toBe('Evocation');
    expect(state.spell.level).toBe(0);
  });

  it('setParams sets route params', () => {
    useContentEditorStore.getState().setParams('pack-1', 'spell');
    const state = useContentEditorStore.getState();
    expect(state.packId).toBe('pack-1');
    expect(state.contentType).toBe('spell');
    expect(state.contentId).toBeNull();
  });

  it('setParams with contentId for editing', () => {
    useContentEditorStore.getState().setParams('pack-1', 'spell', 'spell-1');
    const state = useContentEditorStore.getState();
    expect(state.packId).toBe('pack-1');
    expect(state.contentType).toBe('spell');
    expect(state.contentId).toBe('spell-1');
  });

  it('setSpell updates spell and marks dirty', () => {
    const newSpell = { name: 'Fireball', level: 3 as const };
    useContentEditorStore.getState().setSpell(newSpell);
    const state = useContentEditorStore.getState();
    expect(state.spell.name).toBe('Fireball');
    expect(state.spell.level).toBe(3);
    expect(state.isDirty).toBe(true);
  });

  it('markClean clears dirty flag', () => {
    useContentEditorStore.setState({ isDirty: true });
    useContentEditorStore.getState().markClean();
    expect(useContentEditorStore.getState().isDirty).toBe(false);
  });

  it('togglePreview toggles preview state', () => {
    expect(useContentEditorStore.getState().isPreviewOpen).toBe(false);
    useContentEditorStore.getState().togglePreview();
    expect(useContentEditorStore.getState().isPreviewOpen).toBe(true);
    useContentEditorStore.getState().togglePreview();
    expect(useContentEditorStore.getState().isPreviewOpen).toBe(false);
  });

  it('saveSpell does nothing without packId or spell id', async () => {
    const mgr = await getManager();
    await useContentEditorStore.getState().saveSpell('stay');
    // No error, just returns early - loadPack should not be called
    expect(mgr.loadPack).not.toHaveBeenCalled();
  });
});
