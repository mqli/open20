import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, defaultTranslations } from '@open20/ui';
import { AbilityScoresStep } from '../AbilityScoresStep';
import { defaultScoresFor, type AbilityScoreMethod, type Scores } from '@/lib/point-buy';

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
      {ui}
    </I18nProvider>,
  );
}

const onChange = vi.fn();

/** Render the step as a controlled component driven by `onChange` patches. */
function renderStep(method: AbilityScoreMethod = 'point-buy', scores?: Scores) {
  return renderWithI18n(
    <AbilityScoresStep
      method={method}
      scores={scores ?? defaultScoresFor(method)}
      onChange={onChange}
    />,
  );
}

function scoreOf(ability: string): string {
  // The value sits between the decrease/increase buttons in the row.
  const decrease = screen.getByLabelText(`Decrease ${ability}`);
  return decrease.nextElementSibling!.textContent!.trim();
}

describe('AbilityScoresStep', () => {
  beforeEach(() => onChange.mockReset());

  it('starts point buy at all 8s with the full budget', () => {
    renderStep();
    expect(scoreOf('Strength')).toBe('8');
    expect(scoreOf('Charisma')).toBe('8');
    expect(screen.getByText(/Points remaining: 27 \/ 27/)).toBeInTheDocument();
  });

  it('charges the correct cost when raising a score', () => {
    // 8 → 11 costs 3 points.
    renderStep('point-buy', { ...defaultScoresFor('point-buy'), Strength: 11 });
    expect(scoreOf('Strength')).toBe('11');
    expect(screen.getByText(/Points remaining: 24 \/ 27/)).toBeInTheDocument();
  });

  it('disables decrement at 8 and increment at 15', () => {
    renderStep('point-buy', { ...defaultScoresFor('point-buy'), Strength: 15 });
    expect(screen.getByLabelText('Decrease Charisma')).toBeDisabled();
    expect(screen.getByLabelText('Increase Strength')).toBeDisabled();
  });

  it('enforces the point-buy budget — no increment is affordable at 0 remaining', () => {
    // Three 15s = 27 points exactly.
    const spent: Scores = {
      ...defaultScoresFor('point-buy'),
      Strength: 15,
      Dexterity: 15,
      Constitution: 15,
    };
    renderStep('point-buy', spent);

    expect(screen.getByText(/Points remaining: 0 \/ 27/)).toBeInTheDocument();
    for (const ability of [
      'Strength',
      'Dexterity',
      'Constitution',
      'Intelligence',
      'Wisdom',
      'Charisma',
    ]) {
      expect(screen.getByLabelText(`Increase ${ability}`)).toBeDisabled();
    }
  });

  it('emits a +1 step through onChange', () => {
    renderStep();
    fireEvent.click(screen.getByLabelText('Increase Strength'));
    expect(onChange).toHaveBeenCalledWith({
      scores: expect.objectContaining({ Strength: 9 }),
    });
  });

  it('shows the standard array and swaps values between abilities', () => {
    renderStep('standard-array');
    expect(scoreOf('Strength')).toBe('15');
    expect(scoreOf('Dexterity')).toBe('14');
    expect(screen.queryByText(/Points remaining/)).not.toBeInTheDocument();

    // Stepping Dexterity up swaps its 14 with Strength's 15.
    fireEvent.click(screen.getByLabelText('Increase Dexterity'));
    expect(onChange).toHaveBeenCalledWith({
      scores: expect.objectContaining({ Dexterity: 15, Strength: 14 }),
    });
  });

  it('offers direct number entry in manual mode', () => {
    renderStep('manual');
    const input = screen.getByLabelText('Strength score');
    fireEvent.change(input, { target: { value: '18' } });
    expect(onChange).toHaveBeenCalledWith({
      scores: expect.objectContaining({ Strength: 18 }),
    });
  });

  it('does not commit a score while the manual field is being cleared', () => {
    renderStep('manual', { ...defaultScoresFor('manual'), Strength: 18 });
    const input = screen.getByLabelText('Strength score');

    // Number('') is 0 — clearing the box must not be read as a score of 0.
    fireEvent.change(input, { target: { value: '' } });
    expect(onChange).not.toHaveBeenCalled();
    expect(input).toHaveValue(null); // the box really is empty on screen

    fireEvent.change(input, { target: { value: '9' } });
    expect(onChange).toHaveBeenCalledWith({
      scores: expect.objectContaining({ Strength: 9 }),
    });
  });

  it('restores the committed score when a partial manual edit is abandoned', () => {
    renderStep('manual', { ...defaultScoresFor('manual'), Strength: 18 });
    const input = screen.getByLabelText('Strength score');

    fireEvent.change(input, { target: { value: '' } });
    fireEvent.blur(input);

    expect(input).toHaveValue(18);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('flags manual scores above 20', () => {
    renderStep('manual', { ...defaultScoresFor('manual'), Strength: 21 });
    expect(screen.getByRole('alert')).toHaveTextContent(/between 1 and 20/i);
  });

  it('marks the active method with aria-pressed and keeps a non-colour cue', () => {
    renderStep('standard-array');
    expect(screen.getByRole('button', { name: /Standard Array/ })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /Point Buy/ })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('resets scores when switching to a strict method', () => {
    renderStep('point-buy');
    fireEvent.click(screen.getByRole('button', { name: /Standard Array/ }));
    expect(onChange).toHaveBeenCalledWith({
      method: 'standard-array',
      scores: defaultScoresFor('standard-array'),
    });
  });

  it('keeps current scores when switching to manual', () => {
    const scores = { ...defaultScoresFor('point-buy'), Strength: 15 };
    renderStep('point-buy', scores);
    fireEvent.click(screen.getByRole('button', { name: /Manual/ }));
    expect(onChange).toHaveBeenCalledWith({ method: 'manual', scores });
  });
});
