import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, defaultTranslations } from '@open20/ui';
import { CharacterCreateWizard } from '../CharacterCreateWizard';
import { initContent } from '@/core/content-resolver';
import { defaultScoresFor } from 'open20-core';

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
      {ui}
    </I18nProvider>,
  );
}

// Mock the store — the wizard only needs `createCharacter` plus `error` for
// the failure path.
const storeState = {
  createCharacter: vi.fn<(input: unknown) => string | null>(() => 'new-id'),
  error: null as string | null,
};

vi.mock('@/stores/characterStore', () => ({
  useCharacterStore: Object.assign(
    (selector: (state: typeof storeState) => unknown) => selector(storeState),
    { getState: () => storeState },
  ),
}));

const onOpenChange = vi.fn();

function renderWizard() {
  return renderWithI18n(<CharacterCreateWizard open onOpenChange={onOpenChange} />);
}

const next = () => screen.getByRole('button', { name: 'Next' });
const pick = (name: string | RegExp) => fireEvent.click(screen.getByRole('button', { name }));

/** Fill in step 1 and advance to the class step. */
function completeBasics(species = 'Elf', background = 'Sage') {
  fireEvent.change(screen.getByLabelText('Character name'), { target: { value: 'Nyx' } });
  pick(species);
  pick(background);
  fireEvent.click(next());
}

describe('CharacterCreateWizard', () => {
  beforeEach(() => {
    initContent();
    storeState.createCharacter.mockReset();
    storeState.createCharacter.mockReturnValue('new-id');
    storeState.error = null;
    onOpenChange.mockReset();
  });

  it('opens on step 1 with Next disabled', () => {
    renderWizard();
    expect(screen.getByText('Step 1 of 3: Basics')).toBeInTheDocument();
    expect(next()).toBeDisabled();
  });

  it('enables Next once name, species and background are chosen', () => {
    renderWizard();
    fireEvent.change(screen.getByLabelText('Character name'), { target: { value: 'Nyx' } });
    expect(next()).toBeDisabled();
    pick('Elf');
    expect(next()).toBeDisabled();
    pick('Sage');
    expect(next()).toBeEnabled();
  });

  it('offers a lineage picker only for species that have subtypes', () => {
    renderWizard();
    expect(screen.queryByRole('group', { name: 'Lineage (optional)' })).not.toBeInTheDocument();

    pick('Elf');
    const lineage = screen.getByRole('group', { name: 'Lineage (optional)' });
    expect(lineage).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'High Elf' })).toBeInTheDocument();

    pick('Human');
    expect(screen.queryByRole('group', { name: 'Lineage (optional)' })).not.toBeInTheDocument();
  });

  it('gates the class step on picking a class', () => {
    renderWizard();
    completeBasics();

    expect(screen.getByText('Step 2 of 3: Class')).toBeInTheDocument();
    expect(next()).toBeDisabled();
    pick('Wizard');
    expect(next()).toBeEnabled();
  });

  it('steps the class level and stops at 1', () => {
    renderWizard();
    completeBasics();
    pick('Wizard');

    expect(screen.getByLabelText('Decrease Wizard level')).toBeDisabled();
    fireEvent.click(screen.getByLabelText('Increase Wizard level'));
    fireEvent.click(screen.getByLabelText('Increase Wizard level'));
    expect(screen.getByText('Total level: 3 / 20')).toBeInTheDocument();
    expect(screen.getByLabelText('Decrease Wizard level')).toBeEnabled();
  });

  it('reveals a subclass only once its unlock level is reached', () => {
    renderWizard();
    completeBasics();
    pick('Fighter');

    // Champion unlocks at level 3.
    expect(screen.getByText('Subclass unlocks at level 3')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Champion' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Increase Fighter level'));
    fireEvent.click(screen.getByLabelText('Increase Fighter level'));
    expect(screen.getByRole('button', { name: 'Champion' })).toBeInTheDocument();
  });

  it('offers a level-1 subclass for classes that grant one immediately', () => {
    renderWizard();
    completeBasics();
    pick('Cleric');
    expect(screen.getByRole('button', { name: 'Life Domain' })).toBeInTheDocument();
  });

  it('adds and removes a multiclass row, disabling classes already taken', () => {
    renderWizard();
    completeBasics();
    pick('Wizard');

    fireEvent.click(screen.getByRole('button', { name: /Add Class/ }));
    expect(next()).toBeDisabled(); // second row has no class yet

    // Wizard is taken by row 0, so row 1 offers it disabled.
    const wizardButtons = screen.getAllByRole('button', { name: 'Wizard' });
    expect(wizardButtons).toHaveLength(2);
    expect(wizardButtons[1]).toBeDisabled();

    fireEvent.click(screen.getAllByRole('button', { name: 'Fighter' })[1]);
    expect(next()).toBeEnabled();

    fireEvent.click(screen.getByLabelText('Remove Fighter'));
    expect(screen.getAllByRole('button', { name: 'Wizard' })).toHaveLength(1);
    expect(next()).toBeEnabled();
  });

  it('preserves the draft when going back', () => {
    renderWizard();
    completeBasics();
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByLabelText('Character name')).toHaveValue('Nyx');
  });

  it('submits the collected draft to the store and closes', () => {
    renderWizard();
    completeBasics();
    pick('Wizard');
    fireEvent.click(screen.getByLabelText('Increase Wizard level'));
    fireEvent.click(screen.getByLabelText('Increase Wizard level'));
    fireEvent.click(screen.getByRole('button', { name: /Add Class/ }));
    fireEvent.click(screen.getAllByRole('button', { name: 'Fighter' })[1]);
    fireEvent.click(screen.getAllByRole('button', { name: /Increase Fighter level/ })[0]);
    fireEvent.click(next());

    expect(screen.getByText('Step 3 of 3: Ability Scores')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Create Character' }));

    expect(storeState.createCharacter).toHaveBeenCalledTimes(1);
    expect(storeState.createCharacter).toHaveBeenCalledWith({
      name: 'Nyx',
      speciesId: 'Elf',
      speciesSubtypeId: undefined,
      backgroundId: 'sage',
      classId: 'Wizard',
      classLevel: 3,
      subclassId: undefined,
      abilityScores: defaultScoresFor('point-buy'),
      // Sage's Origin Feat — core does not derive this from the background.
      featIds: ['magic-initiate'],
      additionalClasses: [{ classId: 'Fighter', level: 2, subclassId: undefined }],
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("passes the chosen background's Origin Feat", () => {
    renderWizard();
    completeBasics('Human', 'Soldier');
    pick('Fighter');
    fireEvent.click(next());
    fireEvent.click(screen.getByRole('button', { name: 'Create Character' }));

    const [input] = storeState.createCharacter.mock.calls[0] as [{ featIds?: string[] }];
    expect(input.featIds).toEqual(['savage-attacker']);
  });

  it('blocks Create while the ability scores are invalid', () => {
    renderWizard();
    completeBasics();
    pick('Wizard');
    fireEvent.click(next());

    // Manual entry above the 1–20 range makes step 3 invalid.
    fireEvent.click(screen.getByRole('button', { name: /Manual/ }));
    fireEvent.change(screen.getByLabelText('Strength score'), { target: { value: '21' } });

    const create = screen.getByRole('button', { name: 'Create Character' });
    expect(create).toBeDisabled();
    fireEvent.click(create);
    expect(storeState.createCharacter).not.toHaveBeenCalled();

    // Back in range → the button unlocks.
    fireEvent.change(screen.getByLabelText('Strength score'), { target: { value: '15' } });
    expect(screen.getByRole('button', { name: 'Create Character' })).toBeEnabled();
  });

  it('omits additionalClasses for a single-class character', () => {
    renderWizard();
    completeBasics();
    pick('Wizard');
    fireEvent.click(next());
    fireEvent.click(screen.getByRole('button', { name: 'Create Character' }));

    const [input] = storeState.createCharacter.mock.calls[0] as [Record<string, unknown>];
    expect(input).not.toHaveProperty('additionalClasses');
  });

  it('keeps the dialog open and surfaces the error when creation fails', () => {
    storeState.createCharacter.mockReturnValue(null);
    storeState.error = 'Invalid classId: "Bogus" not found in deps';

    renderWizard();
    completeBasics();
    pick('Wizard');
    fireEvent.click(next());
    fireEvent.click(screen.getByRole('button', { name: 'Create Character' }));

    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(screen.getByRole('alert')).toHaveTextContent('Invalid classId');
  });

  it('cancels without creating anything', () => {
    renderWizard();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(storeState.createCharacter).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
