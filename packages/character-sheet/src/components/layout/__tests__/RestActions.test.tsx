// RestActions.test.tsx

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, defaultTranslations } from '@open20/ui';
import { useCharacterStore } from '@/stores/characterStore';
import { initContent } from '@/core/content-resolver';
import { makeCharacter } from '@/test/fixtures';
import { RestActions } from '../RestActions';

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
      {ui}
    </I18nProvider>,
  );
}

describe('RestActions', () => {
  beforeEach(() => {
    initContent();
    localStorage.clear();
    useCharacterStore.setState({
      character: null,
      characters: {},
      activeCharacterId: null,
      isLoaded: false,
      error: null,
      lastDamageForConcentration: null,
    });
  });

  it('renders Short Rest and Long Rest buttons', () => {
    renderWithI18n(<RestActions />);
    expect(screen.getByRole('button', { name: 'Take a short rest' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Take a long rest' })).toBeInTheDocument();
  });

  it('disables buttons when no character is active', () => {
    renderWithI18n(<RestActions />);
    expect(screen.getByRole('button', { name: 'Take a short rest' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Take a long rest' })).toBeDisabled();
  });

  it('enables buttons when a character is loaded', () => {
    const char = makeCharacter();
    useCharacterStore.getState().upsertCharacter(char);
    renderWithI18n(<RestActions />);
    expect(screen.getByRole('button', { name: 'Take a short rest' })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Take a long rest' })).not.toBeDisabled();
  });

  it('opens Short Rest hit dice dialog on button click', () => {
    const char = makeCharacter();
    useCharacterStore.getState().upsertCharacter(char);

    renderWithI18n(<RestActions />);
    fireEvent.click(screen.getByRole('button', { name: 'Take a short rest' }));

    // Dialog should appear with per-class row
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Take Short Rest' })).toBeInTheDocument();
  });

  it('executes short rest with chosen hit dice when confirmed in dialog', () => {
    const char = makeCharacter();
    useCharacterStore.getState().upsertCharacter(char);
    useCharacterStore.getState().modifyHP(-15);

    const before = useCharacterStore.getState().character!;
    const hpBefore = before.hitPoints.current;

    renderWithI18n(<RestActions />);

    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: 'Take a short rest' }));

    // Click + to spend 1 hit die, then confirm
    const plusBtn = screen.getByRole('button', { name: 'Spend one more Wizard hit die' });
    fireEvent.click(plusBtn);
    fireEvent.click(screen.getByRole('button', { name: 'Take Short Rest' }));

    const after = useCharacterStore.getState().character!;
    // shortRest should recover some HP
    expect(after.hitPoints.current).toBeGreaterThan(hpBefore);
    expect(after.id).toBe(char.id);
  });

  it('opens Long Rest confirmation dialog on click', () => {
    const char = makeCharacter();
    useCharacterStore.getState().upsertCharacter(char);
    renderWithI18n(<RestActions />);

    fireEvent.click(screen.getByRole('button', { name: 'Take a long rest' }));

    // Dialog should appear with checklist
    expect(screen.getByText('Restore all HP to maximum')).toBeInTheDocument();
  });

  it('executes long rest when confirmed in dialog', () => {
    const char = makeCharacter();
    useCharacterStore.getState().upsertCharacter(char);
    // Damage the character so we can verify HP restored
    useCharacterStore.getState().modifyHP(-20);
    const hurtHp = useCharacterStore.getState().character!.hitPoints.current;
    expect(hurtHp).toBeLessThan(char.hitPoints.max);

    renderWithI18n(<RestActions />);

    fireEvent.click(screen.getByRole('button', { name: 'Take a long rest' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm long rest' }));

    // HP should be fully restored
    const after = useCharacterStore.getState().character!;
    expect(after.hitPoints.current).toBe(after.hitPoints.max);
  });

  it('calls onShortRest callback after confirming short rest in dialog', () => {
    const char = makeCharacter();
    useCharacterStore.getState().upsertCharacter(char);
    let called = false;
    renderWithI18n(
      <RestActions
        onShortRest={() => {
          called = true;
        }}
      />,
    );

    // Open dialog
    fireEvent.click(screen.getByRole('button', { name: 'Take a short rest' }));

    // Confirm with 0 hit dice (just click Take Short Rest)
    fireEvent.click(screen.getByRole('button', { name: 'Take Short Rest' }));

    expect(called).toBe(true);
  });

  it('renders with class name from props', () => {
    renderWithI18n(<RestActions className="custom-class" />);
    const container = screen.getByText('Rest Actions').closest('div');
    expect(container?.className).toContain('custom-class');
  });
});
