import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, defaultTranslations } from '@open20/ui';
import { CharacterEditDialog } from '../CharacterEditDialog';
import { initContent } from '@/core/content-resolver';
import type { AppCharacter } from '@/types';

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
      {ui}
    </I18nProvider>,
  );
}

// ── mock store ──────────────────────────────────────────────────────────

const updateCharacter = vi.fn();

const storeState = {
  character: null as AppCharacter | null,
  updateCharacter,
};

vi.mock('@/stores/characterStore', () => ({
  useCharacterStore: Object.assign(
    (selector: (state: typeof storeState) => unknown) => selector(storeState),
    { getState: () => storeState },
  ),
}));

function makeMockChar(): AppCharacter {
  return {
    schemaVersion: '1.0.0',
    name: 'Nyx',
    species: 'Elf',
    speciesSubtype: null,
    background: 'sage',
    classes: [
      {
        classId: 'Wizard',
        level: 5,
        subclassId: null,
        subclassLevel: null,
        hitDice: { die: 'd6', used: 0 },
      },
    ],
    abilityScores: {
      base: {
        Strength: 10,
        Dexterity: 14,
        Constitution: 14,
        Intelligence: 17,
        Wisdom: 12,
        Charisma: 8,
      },
      racialBonuses: { Dexterity: 2, Intelligence: 1 },
      backgroundBonuses: {},
      featBonuses: {},
      featGrants: {},
      temporaryBonuses: {},
    },
    skills: {} as AppCharacter['skills'],
    feats: [],
    equipment: [],
    spells: { classSpellcasting: {} } as AppCharacter['spells'],
    resources: {} as AppCharacter['resources'],
    hitPoints: {
      max: 32,
      current: 32,
      temporary: 0,
      deathSaves: { successes: 0, failures: 0, isStable: false },
    },
    combatStats: {
      AC: 12,
      initiative: 2,
      speed: 30,
      passivePerception: 11,
      proficiencyBonus: 3,
      attacks: [],
    },
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },
    conditions: [],
    concentration: null,
    activeEffects: [],
    damageDefenses: {} as AppCharacter['damageDefenses'],
    inspiration: false,
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    id: 'test-char-id',
  };
}

const onOpenChange = vi.fn();

function renderDialog() {
  return renderWithI18n(<CharacterEditDialog open onOpenChange={onOpenChange} />);
}

const pick = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));

describe('CharacterEditDialog', () => {
  beforeEach(() => {
    initContent();
    storeState.character = makeMockChar();
    updateCharacter.mockReset();
    onOpenChange.mockReset();
  });

  it('opens pre-filled with current character data', () => {
    renderDialog();

    const nameInput = screen.getByLabelText('Character name');
    expect(nameInput).toHaveValue('Nyx');

    // Species is selected
    const elfBtn = screen
      .getByRole('group', { name: 'Species' })
      .querySelector('[aria-pressed="true"]');
    expect(elfBtn).toHaveTextContent('Elf');

    // Background is selected
    const bgBtn = screen
      .getByRole('group', { name: 'Background' })
      .querySelector('[aria-pressed="true"]');
    expect(bgBtn).not.toBeNull();

    // Class is Wizard
    expect(screen.getByText('Level 5')).toBeInTheDocument();
  });

  it('calls updateCharacter and closes on save', () => {
    renderDialog();
    pick('Save Changes');

    expect(updateCharacter).toHaveBeenCalledTimes(1);
    const [input] = updateCharacter.mock.calls[0] as [Record<string, unknown>];
    expect(input.name).toBe('Nyx');
    expect(input.species).toBe('Elf');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('cancel reverts and closes without calling store', () => {
    renderDialog();

    // Change the name
    fireEvent.change(screen.getByLabelText('Character name'), { target: { value: 'ChangedName' } });
    expect(screen.getByLabelText('Character name')).toHaveValue('ChangedName');

    pick('Cancel');
    expect(updateCharacter).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('blocks save when ability scores invalid', () => {
    renderDialog();

    // Switch to manual and set a score out of range
    pick('Manual');
    const strengthInput = screen.getByLabelText('Strength score');
    fireEvent.change(strengthInput, { target: { value: '21' } });

    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  });

  it('blocks save when name is empty', () => {
    renderDialog();

    fireEvent.change(screen.getByLabelText('Character name'), { target: { value: '' } });
    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  });

  it('can add and remove multiclass', () => {
    renderDialog();

    expect(screen.queryByText('Class 2')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Add Class/ }));
    expect(screen.getByText('Class 2')).toBeInTheDocument();

    // Remove it
    fireEvent.click(screen.getByLabelText(/Remove/));
    expect(screen.queryByText('Class 2')).not.toBeInTheDocument();
  });

  it('shows lineage picker for species with subtypes', () => {
    renderDialog();

    // Elf should have lineage options
    expect(screen.getByRole('group', { name: 'Lineage (optional)' })).toBeInTheDocument();
  });

  it('ability score change is reflected in saved input', () => {
    renderDialog();

    // Increase dexterity in manual mode
    pick('Manual');
    fireEvent.click(screen.getByLabelText('Increase Dexterity score'));
    fireEvent.click(screen.getByLabelText('Increase Dexterity score'));

    pick('Save Changes');

    const [input] = updateCharacter.mock.calls[0] as [
      { abilityScores: { base: Record<string, number> } },
    ];
    expect(input.abilityScores.base.Dexterity).toBe(16);
  });

  it('returns nothing when no character is active', () => {
    storeState.character = null;
    const { container } = renderWithI18n(<CharacterEditDialog open onOpenChange={onOpenChange} />);
    expect(container).toBeEmptyDOMElement();
  });
});
