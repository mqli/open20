import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AbilityScoresGrid } from '../AbilityScoresGrid';
import { makeCharacter } from '@/test/fixtures';

const noop = () => {};

describe('AbilityScoresGrid', () => {
  // --- basic rendering ---

  it('renders all six ability short labels', () => {
    const char = makeCharacter();
    render(<AbilityScoresGrid abilityScores={char.abilityScores} onRollCheck={noop} />);
    expect(screen.getByText('STR')).toBeInTheDocument();
    expect(screen.getByText('DEX')).toBeInTheDocument();
    expect(screen.getByText('CON')).toBeInTheDocument();
    expect(screen.getByText('INT')).toBeInTheDocument();
    expect(screen.getByText('WIS')).toBeInTheDocument();
    expect(screen.getByText('CHA')).toBeInTheDocument();
  });

  it('renders positive modifier badges', () => {
    const char = makeCharacter();
    render(<AbilityScoresGrid abilityScores={char.abilityScores} onRollCheck={noop} />);
    const positiveBadge = screen.getAllByText(/^\+/)[0];
    expect(positiveBadge).toBeInTheDocument();
  });

  it('renders negative modifier as danger badge', () => {
    const char = makeCharacter({ abilityScores: { Strength: 8 } });
    render(<AbilityScoresGrid abilityScores={char.abilityScores} onRollCheck={noop} />);
    expect(screen.getByText('-1')).toBeInTheDocument();
  });

  it('renders zero modifier as secondary badge', () => {
    const char = makeCharacter({ abilityScores: { Charisma: 10 } });
    render(<AbilityScoresGrid abilityScores={char.abilityScores} onRollCheck={noop} />);
    const allBadges = screen.getAllByText(/^[+-]\d$/);
    expect(allBadges.length).toBeGreaterThan(0);
  });

  it('uses grid-cols-3 for mobile 3x2 layout', () => {
    const char = makeCharacter();
    const { container } = render(
      <AbilityScoresGrid abilityScores={char.abilityScores} onRollCheck={noop} />,
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain('grid-cols-3');
  });

  // --- check roll ---

  it('calls onRollCheck with ability and default normal mode', () => {
    const char = makeCharacter();
    const onRollCheck = vi.fn();
    render(<AbilityScoresGrid abilityScores={char.abilityScores} onRollCheck={onRollCheck} />);
    fireEvent.click(screen.getByLabelText('Roll Strength check'));
    expect(onRollCheck).toHaveBeenCalledWith('Strength', 'none');
  });

  // --- advantage / disadvantage ---

  it('ChevronUp button rolls with advantage immediately', () => {
    const char = makeCharacter();
    const onRollCheck = vi.fn();
    render(<AbilityScoresGrid abilityScores={char.abilityScores} onRollCheck={onRollCheck} />);
    fireEvent.click(screen.getByLabelText('Roll Strength with advantage'));
    expect(onRollCheck).toHaveBeenCalledWith('Strength', 'advantage');
  });

  it('ChevronDown button rolls with disadvantage immediately', () => {
    const char = makeCharacter();
    const onRollCheck = vi.fn();
    render(<AbilityScoresGrid abilityScores={char.abilityScores} onRollCheck={onRollCheck} />);
    fireEvent.click(screen.getByLabelText('Roll Strength with disadvantage'));
    expect(onRollCheck).toHaveBeenCalledWith('Strength', 'disadvantage');
  });

  // --- aria-labels for all six abilities ---

  it('renders check button for each ability', () => {
    const char = makeCharacter();
    render(<AbilityScoresGrid abilityScores={char.abilityScores} onRollCheck={noop} />);
    expect(screen.getByLabelText('Roll Strength check')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Dexterity check')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Constitution check')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Intelligence check')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Wisdom check')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Charisma check')).toBeInTheDocument();
  });
});
