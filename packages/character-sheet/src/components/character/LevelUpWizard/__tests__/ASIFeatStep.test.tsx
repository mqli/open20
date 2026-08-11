import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { initContent } from '@/core/content-resolver';
import { makeCharacter } from '@/test/fixtures';
import { ASIFeatStep, type WizardASIFeat } from '../ASIFeatStep';

const onChange = vi.fn<(v: WizardASIFeat) => void>();

function renderStep(asiOrFeat: WizardASIFeat | null = null) {
  return render(
    <ASIFeatStep character={makeCharacter()} asiOrFeat={asiOrFeat} onChange={onChange} />,
  );
}

describe('ASIFeatStep', () => {
  beforeEach(() => {
    initContent();
    onChange.mockReset();
  });

  it('renders three top-level radio options: Skip, ASI, Feat', () => {
    renderStep();
    expect(screen.getByRole('radio', { name: 'Skip' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'ASI (Ability)' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Feat' })).toBeInTheDocument();
  });

  it('defaults to Skip selected', () => {
    renderStep();
    expect(screen.getByRole('radio', { name: 'Skip' })).toHaveAttribute('aria-checked', 'true');
  });

  it('shows Skip selection as pre-selected', () => {
    renderStep({ type: 'Skip' });
    expect(screen.getByRole('radio', { name: 'Skip' })).toHaveAttribute('aria-checked', 'true');
  });

  it('shows ability picker when ASI is selected', () => {
    renderStep({ type: 'asi', mode: 'plus2', ability: 'Strength' });
    expect(screen.getByRole('radio', { name: 'ASI (Ability)' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    // Should show ability chips
    expect(screen.getByText(/\+2 to one/)).toBeInTheDocument();
  });

  it('switches between +2 and +1/+1 modes', () => {
    renderStep({ type: 'asi', mode: 'plus2', ability: 'Strength' });
    fireEvent.click(screen.getByText('+1 to two'));
    expect(onChange).toHaveBeenCalled();
    const [call] = onChange.mock.calls[0] as [WizardASIFeat];
    expect(call.type).toBe('asi');
    expect((call as { mode: string }).mode).toBe('plus1plus1');
  });

  it('shows feat picker when Feat is selected', () => {
    renderStep({ type: 'feat', featId: 'alert' });
    expect(screen.getByRole('radio', { name: 'Feat' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText(/Choose a feat/)).toBeInTheDocument();
  });

  it('calls onChange with Skip when Skip is clicked', () => {
    renderStep({ type: 'asi', mode: 'plus2', ability: 'Strength' });
    fireEvent.click(screen.getByRole('radio', { name: 'Skip' }));
    expect(onChange).toHaveBeenCalledWith({ type: 'Skip' });
  });

  it('calls onChange with asi/plus2 when ASI is clicked', () => {
    renderStep();
    fireEvent.click(screen.getByRole('radio', { name: 'ASI (Ability)' }));
    expect(onChange).toHaveBeenCalled();
    const [call] = onChange.mock.calls[0] as [WizardASIFeat];
    expect(call.type).toBe('asi');
    expect((call as { mode: string }).mode).toBe('plus2');
  });

  it('calls onChange with feat when Feat radio is clicked', () => {
    renderStep();
    fireEvent.click(screen.getByRole('radio', { name: 'Feat' }));
    expect(onChange).toHaveBeenCalled();
    const [call] = onChange.mock.calls[0] as [WizardASIFeat];
    expect(call.type).toBe('feat');
  });
});
