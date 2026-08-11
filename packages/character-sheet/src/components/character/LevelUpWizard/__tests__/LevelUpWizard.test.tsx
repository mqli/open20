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

/** Click Next until reaching the target step. */
function clickNext(times = 1) {
  for (let i = 0; i < times; i++) {
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
  }
}

/** Advance through the wizard: select class, skip through to HP, choose Roll, and Level Up. */
function completeWizard(classLabel: string, skipCount: number) {
  fireEvent.click(screen.getByRole('button', { name: classLabel }));
  clickNext(skipCount); // skip Features + optional Subclass/ASI steps
  fireEvent.click(screen.getByRole('radio', { name: /Roll/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Level Up' }));
}

describe('LevelUpWizard', () => {
  beforeEach(() => {
    initContent();
    // Default: Level-5 Wizard
    storeState.character = makeCharacter();
    storeState.levelUp.mockReset();
    onOpenChange.mockReset();
  });

  it('renders the dialog when open', () => {
    renderWizard();
    // Use role-based query to distinguish title from button
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Level Up' })).toBeInTheDocument();
    expect(screen.getByText(/Step 1 of 1: Class/)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    renderWithI18n(<LevelUpWizard open={false} onOpenChange={onOpenChange} />);
    expect(screen.queryByText('Level Up')).not.toBeInTheDocument();
  });

  it('has Next/Level Up disabled until a class is selected', () => {
    renderWizard();
    // Only 1 step when no class selected — shows "Level Up" (disabled)
    expect(screen.getByRole('button', { name: 'Level Up' })).toBeDisabled();
  });

  it('enables Next after selecting a class and advances to Features step', () => {
    renderWizard();
    fireEvent.click(screen.getByRole('button', { name: 'Wizard' }));
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    // Level 5 Wizard → 6: Features step shows level 6 gains
    expect(screen.getByText(/Wizard Level 6/)).toBeInTheDocument();
  });

  it('shows the Subclass step when new level reaches subclass unlock level', () => {
    // Level-5 Wizard advancing to 6: subclass step is shown (unlocks at 3)
    renderWizard();
    fireEvent.click(screen.getByRole('button', { name: 'Wizard' }));
    clickNext(); // Features
    clickNext(); // Subclass
    expect(screen.getByRole('group', { name: 'Subclass' })).toBeInTheDocument();
  });

  it('skips the Subclass step when new level is below unlock level', () => {
    // Fighter multiclass: new class at level 1, subclass at level 3
    renderWizard();
    fireEvent.click(screen.getByRole('button', { name: 'Fighter' }));
    clickNext(); // Features
    // Should skip subclass and go straight to HP
    expect(screen.getByText(/Hit Points/)).toBeInTheDocument();
  });

  it('Back button returns to previous step preserving selection', () => {
    renderWizard();
    fireEvent.click(screen.getByRole('button', { name: 'Wizard' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    // Now on Features step — go back
    fireEvent.click(screen.getByRole('button', { name: 'Back' }));
    expect(screen.getByText(/Step 1 of .+: Class/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Wizard' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('Cancel button closes dialog and resets state', () => {
    renderWizard();
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('Level Up button calls store.levelUp with correct options and closes dialog', async () => {
    renderWizard();
    // Wizard level 5 → 6: steps = Class, Features, Subclass, HP (4 steps)
    // skipCount = 3 (Features + Subclass + skip)
    completeWizard('Wizard', 3);

    await waitFor(() => {
      expect(storeState.levelUp).toHaveBeenCalledTimes(1);
    });
    const [call] = storeState.levelUp.mock.calls[0] as [LevelUpOptions];
    expect(call.classId).toBe('Wizard');
    expect(call.hpChoice).toBe('roll');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('passes isNewClass: true when selecting a non-existing class', async () => {
    renderWizard();
    // Fighter multiclass: steps = Class, Features, HP (3 steps)
    // skipCount = 2 (Features + 1 more to reach HP)
    completeWizard('Fighter', 2);

    await waitFor(() => {
      expect(storeState.levelUp).toHaveBeenCalledTimes(1);
    });
    const [call] = storeState.levelUp.mock.calls[0] as [LevelUpOptions];
    expect(call.classId).toBe('Fighter');
    expect(call.isNewClass).toBe(true);
  });

  it('shows the HP step with class-specific hit die context', () => {
    renderWizard();
    fireEvent.click(screen.getByRole('button', { name: 'Wizard' }));
    clickNext(); // Features
    clickNext(); // Subclass
    clickNext(); // HP
    // Now at HP step
    expect(screen.getByText(/Wizard hit die: d6/)).toBeInTheDocument();
  });

  it('shows feature preview content at the Features step', () => {
    renderWizard();
    fireEvent.click(screen.getByRole('button', { name: 'Wizard' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));
    // Features step for Wizard Level 6 should show content
    expect(screen.getByText(/What You Gain/)).toBeInTheDocument();
  });

  it('resets state when re-opened', () => {
    const { unmount } = renderWizard();
    fireEvent.click(screen.getByRole('button', { name: 'Wizard' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);

    unmount();
    render(
      <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
        <LevelUpWizard open onOpenChange={onOpenChange} />
      </I18nProvider>,
    );

    // Should be back at step 0 with no selection
    expect(screen.getByText(/Step 1 of 1: Class/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Level Up' })).toBeDisabled();
  });
});
