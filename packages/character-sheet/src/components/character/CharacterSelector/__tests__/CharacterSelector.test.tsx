import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, defaultTranslations } from '@open20/ui';
import { CharacterSelector } from '../CharacterSelector';
import { makeCharacter } from '@/test/fixtures';

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
      {ui}
    </I18nProvider>,
  );
}

// Mock the store — each test sets up its own mock state
const storeState = {
  characters: {} as Record<string, ReturnType<typeof makeCharacter>>,
  activeCharacterId: null as string | null,
  setActiveCharacter: vi.fn(),
  deleteCharacter: vi.fn(),
  upsertCharacter: vi.fn(),
};

vi.mock('@/stores/characterStore', () => ({
  useCharacterStore: (selector: (state: typeof storeState) => unknown) => selector(storeState),
}));

// Mock open20-core to avoid real character creation
vi.mock('open20-core', async () => {
  const actual = await vi.importActual<typeof import('open20-core')>('open20-core');
  return {
    ...actual,
    createCharacter: vi.fn((params: Record<string, unknown>) => {
      // Return a minimal mock character with the ID merged in by the component
      return {
        name: params.name ?? 'New Character',
        species: (params as { speciesId?: string }).speciesId ?? 'Human',
        classes: [
          {
            classId: (params as { classId?: string }).classId ?? 'Fighter',
            level: (params as { classLevel?: number }).classLevel ?? 1,
          },
        ],
        hitPoints: {
          current: 10,
          max: 10,
          temporary: 0,
          deathSaves: { successes: 0, failures: 0, isStable: false },
        },
        combatStats: {
          AC: 10,
          initiative: 0,
          speed: 30,
          passivePerception: 10,
          proficiencyBonus: 2,
          attacks: [],
        },
        abilityScores: {} as Record<string, unknown>,
        skills: {} as Record<string, unknown>,
        conditions: [],
        currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
        equipment: [],
        feats: [],
        concentration: null,
        damageDefenses: { resistances: [], immunities: [], vulnerabilities: [] },
        notes: '',
        classSpellData: [],
        spells: { knownSpells: [], preparedSpells: [] },
      } as unknown as ReturnType<typeof actual.createCharacter>;
    }),
  };
});

describe('CharacterSelector', () => {
  beforeEach(() => {
    storeState.characters = {};
    storeState.activeCharacterId = null;
    storeState.setActiveCharacter.mockReset();
    storeState.deleteCharacter.mockReset();
    storeState.upsertCharacter.mockReset();
  });

  it('renders empty state when no characters exist', () => {
    renderWithI18n(<CharacterSelector open onOpenChange={vi.fn()} />);
    expect(screen.getByText('No characters yet. Create one to get started.')).toBeInTheDocument();
  });

  it('lists saved characters with name, level, and class', () => {
    const char = makeCharacter();
    storeState.characters = { [char.id]: char };
    storeState.activeCharacterId = char.id;

    renderWithI18n(<CharacterSelector open onOpenChange={vi.fn()} />);
    expect(screen.getByText('Tharion')).toBeInTheDocument();
    expect(screen.getByText(/Lv\.5/)).toBeInTheDocument();
    expect(screen.getByText(/Wizard/)).toBeInTheDocument();
  });

  it('shows HP, AC, and PP for each character', () => {
    const char = makeCharacter();
    storeState.characters = { [char.id]: char };
    storeState.activeCharacterId = char.id;

    renderWithI18n(<CharacterSelector open onOpenChange={vi.fn()} />);
    // Dialog uses portals, so query the document body via screen
    expect(screen.getByText(/HP\s*\d+\s*\/\s*\d+/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`AC\\s*${char.combatStats.AC}`))).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(`PP\\s*${char.combatStats.passivePerception}`)),
    ).toBeInTheDocument();
  });

  it('highlights active character with "Active" label', () => {
    const char = makeCharacter();
    storeState.characters = { [char.id]: char };
    storeState.activeCharacterId = char.id;

    renderWithI18n(<CharacterSelector open onOpenChange={vi.fn()} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('calls setActiveCharacter on select', () => {
    const char = makeCharacter();
    storeState.characters = { [char.id]: char };
    // Set activeCharacterId to a DIFFERENT id so clicking this card triggers setActiveCharacter
    storeState.activeCharacterId = 'other-id';

    renderWithI18n(<CharacterSelector open onOpenChange={vi.fn()} />);

    // Click the character card
    const card = screen.getByLabelText(`Select ${char.name}`);
    fireEvent.click(card);
    expect(storeState.setActiveCharacter).toHaveBeenCalledWith(char.id);
  });

  it('shows delete confirmation on first click', () => {
    const char = makeCharacter();
    storeState.characters = { [char.id]: char };
    storeState.activeCharacterId = null;

    renderWithI18n(<CharacterSelector open onOpenChange={vi.fn()} />);

    // Click delete button once (first click = confirm state)
    const deleteBtn = screen.getByLabelText(`Delete ${char.name}`);
    fireEvent.click(deleteBtn);
    expect(screen.getByText('Sure?')).toBeInTheDocument();
  });

  it('renders dialog title and description', () => {
    renderWithI18n(<CharacterSelector open onOpenChange={vi.fn()} />);
    expect(screen.getByText('Characters')).toBeInTheDocument();
    expect(screen.getByText('Select a character or create a new one.')).toBeInTheDocument();
  });

  it('renders Done and New buttons', () => {
    renderWithI18n(<CharacterSelector open onOpenChange={vi.fn()} />);
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
  });
});
