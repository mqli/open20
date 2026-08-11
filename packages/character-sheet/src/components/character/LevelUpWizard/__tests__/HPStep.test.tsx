import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HPStep } from '../HPStep';

import type { DieType } from 'open20-core';

const onChange = vi.fn<(choice: 'fixed' | 'roll') => void>();

function renderStep(dieType: DieType = 'd8', conMod = 2, hpChoice: 'fixed' | 'roll' = 'fixed') {
  return render(
    <HPStep
      classDisplayName="Wizard"
      dieType={dieType}
      conMod={conMod}
      hpChoice={hpChoice}
      onChange={onChange}
    />,
  );
}

describe('HPStep', () => {
  beforeEach(() => {
    onChange.mockReset();
  });

  it('renders the context line with class name, hit die, and CON modifier', () => {
    renderStep();
    expect(screen.getByText(/Wizard hit die: d8 \(\+2 CON\)/)).toBeInTheDocument();
  });

  it('renders both Take Average and Roll as radio buttons', () => {
    renderStep();
    expect(screen.getByRole('radio', { name: /Take Average/ })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /Roll/ })).toBeInTheDocument();
  });

  it('shows correct average value for d8 with +2 CON', () => {
    // getHitDieFixedValue('d8') = 5, +2 CON = 7 HP
    renderStep('d8', 2);
    expect(screen.getByText('5 +2 = 7 HP')).toBeInTheDocument();
  });

  it('shows correct roll range for d8 with +2 CON', () => {
    // 1d8 + 2 = 3 to 10 HP
    renderStep('d8', 2);
    expect(screen.getByText('1d8 +2 = 3 to 10 HP')).toBeInTheDocument();
  });

  it('handles negative CON modifier in preview', () => {
    // getHitDieFixedValue('d6') = 4, -1 CON = 3 HP
    // 1d6 - 1 = range 1 to 5 HP (minimum clamped to 1)
    renderStep('d6', -1);
    expect(screen.getByText(/4 -1 = 3 HP/)).toBeInTheDocument();
    expect(screen.getByText(/1d6 -1 = 1 to 5 HP/)).toBeInTheDocument();
  });

  it('shows correct math for d12 with +3 CON', () => {
    renderStep('d12', 3);
    expect(screen.getByText('7 +3 = 10 HP')).toBeInTheDocument();
    expect(screen.getByText('1d12 +3 = 4 to 15 HP')).toBeInTheDocument();
  });

  it('defaults to fixed selected', () => {
    renderStep('d8', 2, 'fixed');
    expect(screen.getByRole('radio', { name: /Take Average/ })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    expect(screen.getByRole('radio', { name: /Roll/ })).toHaveAttribute('aria-checked', 'false');
  });

  it('highlights Roll when hpChoice is roll', () => {
    renderStep('d8', 2, 'roll');
    expect(screen.getByRole('radio', { name: /Roll/ })).toHaveAttribute('aria-checked', 'true');
  });

  it('calls onChange("roll") when Roll option is clicked', () => {
    renderStep('d8', 2, 'fixed');
    fireEvent.click(screen.getByRole('radio', { name: /Roll/ }));
    expect(onChange).toHaveBeenCalledWith('roll');
  });

  it('calls onChange("fixed") when Take Average is clicked while roll is selected', () => {
    renderStep('d8', 2, 'roll');
    fireEvent.click(screen.getByRole('radio', { name: /Take Average/ }));
    expect(onChange).toHaveBeenCalledWith('fixed');
  });
});
