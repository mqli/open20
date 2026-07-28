import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, defaultTranslations } from '@open20/ui';
import { DeathSavesTracker } from '../DeathSavesTracker';

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
      {ui}
    </I18nProvider>,
  );
}

describe('DeathSavesTracker', () => {
  it('renders correct number of filled and empty circles', () => {
    const onToggleSuccess = vi.fn();
    const onToggleFailure = vi.fn();

    renderWithI18n(
      <DeathSavesTracker
        successes={2}
        failures={1}
        isStable={false}
        onToggleSuccess={onToggleSuccess}
        onToggleFailure={onToggleFailure}
      />,
    );

    // All 6 toggle buttons exist
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(6);

    // First 2 success circles have Check icons, third is empty
    expect(screen.getByLabelText('Toggle death save success 1').querySelector('svg')).toBeTruthy();
    expect(screen.getByLabelText('Toggle death save success 2').querySelector('svg')).toBeTruthy();
    expect(screen.getByLabelText('Toggle death save success 3').querySelector('svg')).toBeFalsy();

    // First failure circle has X icon, others empty
    expect(screen.getByLabelText('Toggle death save failure 1').querySelector('svg')).toBeTruthy();
    expect(screen.getByLabelText('Toggle death save failure 2').querySelector('svg')).toBeFalsy();
    expect(screen.getByLabelText('Toggle death save failure 3').querySelector('svg')).toBeFalsy();
  });

  it('only the next empty or last filled circle is toggleable (not disabled)', () => {
    const onToggleSuccess = vi.fn();
    const onToggleFailure = vi.fn();

    renderWithI18n(
      <DeathSavesTracker
        successes={1}
        failures={0}
        isStable={false}
        onToggleSuccess={onToggleSuccess}
        onToggleFailure={onToggleFailure}
      />,
    );

    // Success: 1 filled (index 0). Toggleable: index 0 (last filled) and index 1 (next empty).
    const s1 = screen.getByLabelText('Toggle death save success 1');
    expect(s1).not.toBeDisabled(); // last filled → toggleable
    const s2 = screen.getByLabelText('Toggle death save success 2');
    expect(s2).not.toBeDisabled(); // next empty → toggleable
    const s3 = screen.getByLabelText('Toggle death save success 3');
    expect(s3).toBeDisabled(); // not next empty → disabled

    // Failure: 0 filled. Toggleable: index 0 (next empty).
    const f1 = screen.getByLabelText('Toggle death save failure 1');
    expect(f1).not.toBeDisabled(); // next empty → toggleable
    const f2 = screen.getByLabelText('Toggle death save failure 2');
    expect(f2).toBeDisabled(); // not next empty → disabled
    const f3 = screen.getByLabelText('Toggle death save failure 3');
    expect(f3).toBeDisabled();
  });

  it('calls onToggleSuccess with correct index on click', () => {
    const onToggleSuccess = vi.fn();
    const onToggleFailure = vi.fn();

    renderWithI18n(
      <DeathSavesTracker
        successes={0}
        failures={0}
        isStable={false}
        onToggleSuccess={onToggleSuccess}
        onToggleFailure={onToggleFailure}
      />,
    );

    // Only index 0 is toggleable when successes=0
    fireEvent.click(screen.getByLabelText('Toggle death save success 1'));
    expect(onToggleSuccess).toHaveBeenCalledWith(0);
  });

  it('calls onToggleFailure with correct index on click', () => {
    const onToggleSuccess = vi.fn();
    const onToggleFailure = vi.fn();

    renderWithI18n(
      <DeathSavesTracker
        successes={0}
        failures={0}
        isStable={false}
        onToggleSuccess={onToggleSuccess}
        onToggleFailure={onToggleFailure}
      />,
    );

    // Only index 0 is toggleable when failures=0
    fireEvent.click(screen.getByLabelText('Toggle death save failure 1'));
    expect(onToggleFailure).toHaveBeenCalledWith(0);
  });

  it('shows "Stable" status when isStable is true', () => {
    const onToggleSuccess = vi.fn();
    const onToggleFailure = vi.fn();

    renderWithI18n(
      <DeathSavesTracker
        successes={3}
        failures={1}
        isStable={true}
        onToggleSuccess={onToggleSuccess}
        onToggleFailure={onToggleFailure}
      />,
    );

    expect(screen.getByText('Stable')).toBeInTheDocument();
  });

  it('shows success/failure counts when not stable', () => {
    const onToggleSuccess = vi.fn();
    const onToggleFailure = vi.fn();

    renderWithI18n(
      <DeathSavesTracker
        successes={1}
        failures={2}
        isStable={false}
        onToggleSuccess={onToggleSuccess}
        onToggleFailure={onToggleFailure}
      />,
    );

    expect(screen.getByText('1 / 3 successes · 2 / 3 failures')).toBeInTheDocument();
  });

  it('all circles are empty when successes=0, failures=0', () => {
    const onToggleSuccess = vi.fn();
    const onToggleFailure = vi.fn();

    renderWithI18n(
      <DeathSavesTracker
        successes={0}
        failures={0}
        isStable={false}
        onToggleSuccess={onToggleSuccess}
        onToggleFailure={onToggleFailure}
      />,
    );

    // All 6 circles have no SVG children
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn.querySelector('svg')).toBeFalsy();
    });
  });

  it('all circles are filled when successes=3, failures=3', () => {
    const onToggleSuccess = vi.fn();
    const onToggleFailure = vi.fn();

    renderWithI18n(
      <DeathSavesTracker
        successes={3}
        failures={3}
        isStable={true}
        onToggleSuccess={onToggleSuccess}
        onToggleFailure={onToggleFailure}
      />,
    );

    // All 6 circles have SVG icons
    const buttons = screen.getAllByRole('button');
    buttons.forEach((btn) => {
      expect(btn.querySelector('svg')).toBeTruthy();
    });
  });
});
