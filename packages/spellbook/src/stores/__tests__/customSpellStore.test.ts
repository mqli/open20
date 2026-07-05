import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCustomSpellStore } from '@/stores/customSpellStore';
import { storageService } from '@/core/storage-service';

// Use vi.hoisted to avoid the mock hoisting issue with top-level variables
const { mockReinitContent } = vi.hoisted(() => ({
  mockReinitContent: vi.fn(() => Promise.resolve()),
}));

vi.mock('@/core/content-resolver', () => ({
  reinitContent: mockReinitContent,
  initContent: vi.fn(() => Promise.resolve()),
  getContentPack: vi.fn(() => ({
    spells: [],
    classes: [],
    species: [],
    backgrounds: [],
    feats: [],
    subclasses: [],
    weapons: [],
    armors: [],
    gears: [],
  })),
}));

const testSpell = {
  id: 'test-homebrew',
  name: 'Test Homebrew Spell',
  level: 1 as const,
  school: 'Evocation' as const,
  castingTime: 'Action',
  range: '60 feet',
  components: ['V', 'S'] as const,
  duration: 'Instantaneous',
  concentration: false,
  ritual: false,
  description: ['A test spell for unit testing.'],
  source: 'Homebrew',
  classes: ['Wizard'] as readonly string[],
};

describe('useCustomSpellStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useCustomSpellStore.setState({ spells: [] });
    vi.clearAllMocks();
    // Ensure storage service starts clean
    storageService.saveCustomSpells([]);
  });

  it('should call reinitContent after addSpell', async () => {
    useCustomSpellStore.getState().addSpell(testSpell);
    // afterMutate is async, wait for it
    await vi.waitFor(() => {
      expect(mockReinitContent).toHaveBeenCalled();
    });
  });

  it('should call reinitContent after deleteSpell', async () => {
    // Add a spell first
    useCustomSpellStore.getState().addSpell(testSpell);
    await vi.waitFor(() => {
      expect(mockReinitContent).toHaveBeenCalled();
    });
    mockReinitContent.mockClear();

    // Now delete it
    useCustomSpellStore.getState().deleteSpell('test-homebrew');
    await vi.waitFor(() => {
      expect(mockReinitContent).toHaveBeenCalled();
    });
  });

  it('should call reinitContent after updateSpell', async () => {
    // Add a spell first
    useCustomSpellStore.getState().addSpell(testSpell);
    await vi.waitFor(() => {
      expect(mockReinitContent).toHaveBeenCalled();
    });
    mockReinitContent.mockClear();

    // Update it
    const updatedSpell = { ...testSpell, name: 'Updated Spell' };
    useCustomSpellStore.getState().updateSpell(updatedSpell);
    await vi.waitFor(() => {
      expect(mockReinitContent).toHaveBeenCalled();
    });
  });

  it('should call reinitContent after importSpells', async () => {
    useCustomSpellStore.getState().importSpells([testSpell]);
    await vi.waitFor(() => {
      expect(mockReinitContent).toHaveBeenCalled();
    });
  });

  it('should persist spells via storageService', () => {
    useCustomSpellStore.getState().addSpell(testSpell);

    const stored = storageService.loadCustomSpells();
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('test-homebrew');
    expect(stored[0].source).toBe('Homebrew');
  });
});
