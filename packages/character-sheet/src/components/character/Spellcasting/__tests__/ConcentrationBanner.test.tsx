// ConcentrationBanner.test.tsx (T-117)
// Unit tests for the ConcentrationBanner component.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import { ConcentrationBanner } from '../ConcentrationBanner';

describe('ConcentrationBanner', () => {
  it('renders spell name and "Concentrating" label', () => {
    render(
      <ConcentrationBanner
        spellName="Haste"
        damageAmount={null}
        concentrationDC={null}
        onEndConcentration={vi.fn()}
        onRollConcentrationSave={vi.fn()}
      />,
    );

    const banner = screen.getByTestId('concentration-banner');
    expect(banner).toBeInTheDocument();
    expect(within(banner).getByText('Concentrating')).toBeInTheDocument();
    expect(within(banner).getByText('Haste')).toBeInTheDocument();
  });

  it('renders "End Concentration" dismiss button', () => {
    render(
      <ConcentrationBanner
        spellName="Haste"
        damageAmount={null}
        concentrationDC={null}
        onEndConcentration={vi.fn()}
        onRollConcentrationSave={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /End concentration on Haste/i })).toBeInTheDocument();
  });

  it('calls onEndConcentration when dismiss button is clicked', () => {
    const onEnd = vi.fn();

    render(
      <ConcentrationBanner
        spellName="Haste"
        damageAmount={null}
        concentrationDC={null}
        onEndConcentration={onEnd}
        onRollConcentrationSave={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /End concentration on Haste/i }));
    expect(onEnd).toHaveBeenCalledTimes(1);
  });

  it('does NOT show CON save prompt when no damage', () => {
    render(
      <ConcentrationBanner
        spellName="Haste"
        damageAmount={null}
        concentrationDC={null}
        onEndConcentration={vi.fn()}
        onRollConcentrationSave={vi.fn()}
      />,
    );

    expect(screen.queryByText(/DC/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Roll DC/ })).not.toBeInTheDocument();
  });

  it('shows CON save prompt with correct DC when damage is present', () => {
    render(
      <ConcentrationBanner
        spellName="Haste"
        damageAmount={24}
        concentrationDC={12}
        onEndConcentration={vi.fn()}
        onRollConcentrationSave={vi.fn()}
      />,
    );

    expect(screen.getByText('DC 12 CON save')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Roll DC 12 Constitution save/i }),
    ).toBeInTheDocument();
  });

  it('shows DC = 10 when damage is small (floor half-damage < 10)', () => {
    render(
      <ConcentrationBanner
        spellName="Haste"
        damageAmount={5}
        concentrationDC={10}
        onEndConcentration={vi.fn()}
        onRollConcentrationSave={vi.fn()}
      />,
    );

    expect(screen.getByText('DC 10 CON save')).toBeInTheDocument();
  });

  it('calls onRollConcentrationSave when Roll CON Save is clicked', () => {
    const onRoll = vi.fn();

    render(
      <ConcentrationBanner
        spellName="Haste"
        damageAmount={20}
        concentrationDC={10}
        onEndConcentration={vi.fn()}
        onRollConcentrationSave={onRoll}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Roll DC 10 Constitution save/i }));
    expect(onRoll).toHaveBeenCalledTimes(1);
  });

  it('renders with long spell name without layout break', () => {
    render(
      <ConcentrationBanner
        spellName="Greater Invisibility - Level 4"
        damageAmount={null}
        concentrationDC={null}
        onEndConcentration={vi.fn()}
        onRollConcentrationSave={vi.fn()}
      />,
    );

    expect(screen.getByText('Greater Invisibility - Level 4')).toBeInTheDocument();
    expect(screen.getByTestId('concentration-banner')).toBeInTheDocument();
  });
});
