import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nProvider, defaultTranslations } from '@open20/ui';
import { LevelUpWizard } from '../LevelUpWizard';
import { makeCharacter } from '@/test/fixtures';
import { initContent } from '@/core/content-resolver';

import type { LevelUpOptions } from 'open20-core';

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
      {ui}
    </I18nProvider>,
  );
}

// Mock store state — the wizard reads `character` and calls `levelUp`.
const storeState = {
  character: makeCharacter(),
  levelUp: vi.fn<(options: LevelUpOptions) => void>(),
};

vi.mock('@/stores/characterStore', () => ({
  useCharacterStore: Object.assign(
    (selector: (state: typeof storeState) => unknown) => selector(storeState),
    { getState: () => storeState },
  ),
}));

const onOpenChange = vi.fn();

function renderWizard() {
  return renderWithI18n(<LevelUpWizard open onOpenChange={onOpenChange} />);
}

describe('LevelUpWizard', () => {
  beforeEach(() => {
    initContent();
    storeState.character = makeCharacter();
    storeState.levelUp.mockReset();
    onOpenChange.mockReset();
  });

  it('renders the dialog when open', () => {
    renderWizard();
    expect(screen.getByText('Level Up')).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 2: Class/)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithI18n(<LevelUpWizard open={false} onOpenChange={onOpenChange} />);
    expect(screen.queryByText('Level Up')).not.toBeInTheDocument();
  });

  it('has Next disabled until a class is selected', () => {
    renderWizard();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });

  it('enables Next after selecting a class and advances to HP step', () => {
    renderWizard();
    fireEvent.click(screen.getByRole('button', { name: 'Wizard' }));
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByText(/Step 2 of 2: Hit Points/)).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Take Average/ })).toBeInTheDocument();
  });

  it('Back button returns to class step preserving selection', () => {
    renderWizard();
    fireEvent.click(screen.getByRole('button', { name: 'Wizard' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    // Now on step 2 — go back
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText(/Step 1 of 2: Class/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Wizard' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('Cancel button closes dialog and resets state', () => {
    renderWizard();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('Level Up button calls store.levelUp with correct options and closes dialog', async () => {
    renderWizard();

    // Select wizard (existing class)
    fireEvent.click(screen.getByRole('button', { name: 'Wizard' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    // Choose Roll HP
    fireEvent.click(screen.getByRole('radio', { name: /Roll/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Level Up' }));

    await waitFor(() => {
      expect(storeState.levelUp).toHaveBeenCalledTimes(1);
    });
    expect(storeState.levelUp).toHaveBeenCalledWith({
      classId: 'Wizard',
      hpChoice: 'roll',
      isNewClass: undefined,
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('passes isNewClass: true when selecting a non-existing class', async () => {
    renderWizard();

    // Select Fighter (new class for a Wizard character)
    fireEvent.click(screen.getByRole('button', { name: 'Fighter' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    fireEvent.click(screen.getByRole('button', { name: 'Level Up' }));

    await waitFor(() => {
      expect(storeState.levelUp).toHaveBeenCalledTimes(1);
    });
    expect(storeState.levelUp).toHaveBeenCalledWith({
      classId: 'Fighter',
      hpChoice: 'fixed',
      isNewClass: true,
    });
  });

  it('shows the HP step with class-specific hit die context', () => {
    renderWizard();
    // Select Wizard (d6)
    fireEvent.click(screen.getByRole('button', { name: 'Wizard' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    expect(screen.getByText(/Wizard hit die: d6/)).toBeInTheDocument();
  });

  it('resets state when re-opened', () => {
    const { unmount } = renderWizard();
    fireEvent.click(screen.getByRole('button', { name: 'Wizard' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);

    // Simulate parent closing and re-opening the dialog
    unmount();
    render(
      <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
        <LevelUpWizard open onOpenChange={onOpenChange} />
      </I18nProvider>,
    );

    // Should be back at step 0 with no selection
    expect(screen.getByText(/Step 1 of 2: Class/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled();
  });
});
