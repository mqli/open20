// ExhaustionTracker.test.tsx — T-208

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, defaultTranslations } from '@open20/ui';
import type { ActiveCondition } from 'open20-core';
import { useCharacterStore } from '@/stores/characterStore';
import { initContent } from '@/core/content-resolver';
import { makeCharacter } from '@/test/fixtures';
import { ExhaustionTracker } from '../ExhaustionTracker';

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
      {ui}
    </I18nProvider>,
  );
}

function setExhaustionConditions(level: number) {
  const character = makeCharacter();
  let conditions: readonly ActiveCondition[] = character.conditions;

  if (level > 0) {
    conditions = [
      ...conditions,
      { id: 'Exhaustion' as const, source: '', appliedAt: new Date().toISOString(), level },
    ];
  }

  // Override conditions directly (simulating what setExhaustionLevel does)
  const updated = { ...character, conditions };
  useCharacterStore.setState({
    character: updated,
    characters: { [updated.id]: updated },
    activeCharacterId: updated.id,
    isLoaded: true,
    error: null,
    lastDamageForConcentration: null,
  });
}

function resetStore() {
  useCharacterStore.setState({
    character: null,
    characters: {},
    activeCharacterId: null,
    isLoaded: false,
    error: null,
    lastDamageForConcentration: null,
  });
}

describe('ExhaustionTracker', () => {
  beforeEach(() => {
    initContent();
    localStorage.clear();
    resetStore();
  });

  // ── Rendering ──

  it('renders exhaustion label and stepper', () => {
    setExhaustionConditions(0);
    renderWithI18n(<ExhaustionTracker />);

    expect(screen.getByText('Exhaustion')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Increase exhaustion level' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Decrease exhaustion level' })).toBeInTheDocument();
  });

  it('shows "No exhaustion" when level is 0', () => {
    setExhaustionConditions(0);
    renderWithI18n(<ExhaustionTracker />);

    expect(screen.getByText('No exhaustion')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('displays stepper at 0 when no exhaustion condition exists', () => {
    setExhaustionConditions(0);
    renderWithI18n(<ExhaustionTracker />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  // ── Penalty text at different levels ──

  it('shows penalty text at level 2: −4 D20 Tests, −10 ft Speed', () => {
    setExhaustionConditions(2);
    renderWithI18n(<ExhaustionTracker />);

    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/−4 to D20 Tests, −10 ft Speed/)).toBeInTheDocument();
  });

  it('shows penalty text at level 6: −12 D20 Tests, −30 ft Speed', () => {
    setExhaustionConditions(6);
    renderWithI18n(<ExhaustionTracker />);

    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.getByText(/−12 to D20 Tests, −30 ft Speed/)).toBeInTheDocument();
  });

  it('does not show penalty text at level 0', () => {
    setExhaustionConditions(0);
    renderWithI18n(<ExhaustionTracker />);

    expect(screen.queryByText(/D20 Tests/)).not.toBeInTheDocument();
  });

  // ── Danger tint at ≥ 4 ──

  it('does not apply danger tint at level 3', () => {
    setExhaustionConditions(3);
    renderWithI18n(<ExhaustionTracker />);

    const text = screen.getByText('3');
    expect(text.className).not.toContain('danger');
  });

  it('applies danger tint at level 4', () => {
    setExhaustionConditions(4);
    renderWithI18n(<ExhaustionTracker />);

    const text = screen.getByText('4');
    expect(text.className).toContain('danger');
  });

  it('applies danger tint at level 6', () => {
    setExhaustionConditions(6);
    renderWithI18n(<ExhaustionTracker />);

    const text = screen.getByText('6');
    expect(text.className).toContain('danger');
  });

  // ── Stepper disabled at boundaries ──

  it('disables - button when level is 0', () => {
    setExhaustionConditions(0);
    renderWithI18n(<ExhaustionTracker />);

    expect(screen.getByRole('button', { name: 'Decrease exhaustion level' })).toBeDisabled();
  });

  it('disables + button when level is 6', () => {
    setExhaustionConditions(6);
    renderWithI18n(<ExhaustionTracker />);

    expect(screen.getByRole('button', { name: 'Increase exhaustion level' })).toBeDisabled();
  });

  // ── Stepper actions call store ──

  it('calls setExhaustionLevel with 1 when + is clicked at level 0', () => {
    setExhaustionConditions(0);
    const spy = vi.fn();
    useCharacterStore.setState({ setExhaustionLevel: spy });

    renderWithI18n(<ExhaustionTracker />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase exhaustion level' }));

    expect(spy).toHaveBeenCalledWith(1);
  });

  it('calls setExhaustionLevel with 5 when - is clicked at level 6', () => {
    setExhaustionConditions(6);
    const spy = vi.fn();
    useCharacterStore.setState({ setExhaustionLevel: spy });

    renderWithI18n(<ExhaustionTracker />);
    fireEvent.click(screen.getByRole('button', { name: 'Decrease exhaustion level' }));

    expect(spy).toHaveBeenCalledWith(5);
  });

  it('does not call setExhaustionLevel when + is clicked at level 6 (disabled)', () => {
    setExhaustionConditions(6);
    const spy = vi.fn();
    useCharacterStore.setState({ setExhaustionLevel: spy });

    renderWithI18n(<ExhaustionTracker />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase exhaustion level' }));

    expect(spy).not.toHaveBeenCalled();
  });

  // ── className prop ──

  it('applies className prop', () => {
    setExhaustionConditions(0);
    const { container } = renderWithI18n(<ExhaustionTracker className="custom-class" />);

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
