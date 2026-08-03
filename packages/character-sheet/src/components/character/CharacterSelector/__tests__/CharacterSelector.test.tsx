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
};

vi.mock('@/stores/characterStore', () => ({
  useCharacterStore: (selector: (state: typeof storeState) => unknown) => selector(storeState),
}));

const onRequestCreate = vi.fn();

describe('CharacterSelector', () => {
  beforeEach(() => {
    storeState.characters = {};
    storeState.activeCharacterId = null;
    storeState.setActiveCharacter.mockReset();
    storeState.deleteCharacter.mockReset();
    onRequestCreate.mockReset();
  });

  it('renders empty state when no characters exist', () => {
    renderWithI18n(
      <CharacterSelector open onOpenChange={vi.fn()} onRequestCreate={onRequestCreate} />,
    );
    expect(screen.getByText('No characters yet. Create one to get started.')).toBeInTheDocument();
  });

  it('lists saved characters with name, level, and class', () => {
    const char = makeCharacter();
    storeState.characters = { [char.id]: char };
    storeState.activeCharacterId = char.id;

    renderWithI18n(
      <CharacterSelector open onOpenChange={vi.fn()} onRequestCreate={onRequestCreate} />,
    );
    expect(screen.getByText('Tharion')).toBeInTheDocument();
    expect(screen.getByText(/Lv\.5/)).toBeInTheDocument();
    expect(screen.getByText(/Wizard/)).toBeInTheDocument();
  });

  it('shows HP, AC, and PP for each character', () => {
    const char = makeCharacter();
    storeState.characters = { [char.id]: char };
    storeState.activeCharacterId = char.id;

    renderWithI18n(
      <CharacterSelector open onOpenChange={vi.fn()} onRequestCreate={onRequestCreate} />,
    );
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

    renderWithI18n(
      <CharacterSelector open onOpenChange={vi.fn()} onRequestCreate={onRequestCreate} />,
    );
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('calls setActiveCharacter on select', () => {
    const char = makeCharacter();
    storeState.characters = { [char.id]: char };
    // Set activeCharacterId to a DIFFERENT id so clicking this card triggers setActiveCharacter
    storeState.activeCharacterId = 'other-id';

    renderWithI18n(
      <CharacterSelector open onOpenChange={vi.fn()} onRequestCreate={onRequestCreate} />,
    );

    // Click the character card
    const card = screen.getByLabelText(`Select ${char.name}`);
    fireEvent.click(card);
    expect(storeState.setActiveCharacter).toHaveBeenCalledWith(char.id);
  });

  it('shows delete confirmation on first click', () => {
    const char = makeCharacter();
    storeState.characters = { [char.id]: char };
    storeState.activeCharacterId = null;

    renderWithI18n(
      <CharacterSelector open onOpenChange={vi.fn()} onRequestCreate={onRequestCreate} />,
    );

    // Click delete button once (first click = confirm state)
    const deleteBtn = screen.getByLabelText(`Delete ${char.name}`);
    fireEvent.click(deleteBtn);
    expect(screen.getByText('Sure?')).toBeInTheDocument();
  });

  it('renders dialog title and description', () => {
    renderWithI18n(
      <CharacterSelector open onOpenChange={vi.fn()} onRequestCreate={onRequestCreate} />,
    );
    expect(screen.getByText('Characters')).toBeInTheDocument();
    expect(screen.getByText('Select a character or create a new one.')).toBeInTheDocument();
  });

  it('renders Done and New buttons', () => {
    renderWithI18n(
      <CharacterSelector open onOpenChange={vi.fn()} onRequestCreate={onRequestCreate} />,
    );
    expect(screen.getByText('Done')).toBeInTheDocument();
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('New closes the selector and asks the host to open the create wizard', () => {
    const onOpenChange = vi.fn();
    renderWithI18n(
      <CharacterSelector open onOpenChange={onOpenChange} onRequestCreate={onRequestCreate} />,
    );

    fireEvent.click(screen.getByText('New'));

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onRequestCreate).toHaveBeenCalledTimes(1);
  });
});
