import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AbilityScoresGrid } from '../AbilityScoresGrid';
import { makeCharacter } from '@/test/fixtures';

describe('AbilityScoresGrid', () => {
  it('renders all six abilities with modifiers', () => {
    const char = makeCharacter(); // INT 16 → +3
    render(<AbilityScoresGrid abilityScores={char.abilityScores} onRoll={() => {}} />);
    expect(screen.getByText('STR')).toBeInTheDocument();
    expect(screen.getByText('CHA')).toBeInTheDocument();
    // INT 16 → +3 (at least one ability shows a +3 modifier badge)
    expect(screen.getAllByText('+3').length).toBeGreaterThan(0);
  });

  it('rolls the tapped ability', () => {
    const char = makeCharacter();
    const onRoll = vi.fn();
    render(<AbilityScoresGrid abilityScores={char.abilityScores} onRoll={onRoll} />);
    fireEvent.click(screen.getByLabelText('Roll Strength check'));
    expect(onRoll).toHaveBeenCalledWith('Strength');
  });
});
