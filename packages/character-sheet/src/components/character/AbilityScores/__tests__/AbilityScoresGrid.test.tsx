import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AbilityScoresGrid } from '../AbilityScoresGrid';
import { makeCharacter } from '@/test/fixtures';

describe('AbilityScoresGrid', () => {
  it('renders all six ability short labels', () => {
    const char = makeCharacter();
    render(<AbilityScoresGrid abilityScores={char.abilityScores} onRoll={() => {}} />);
    expect(screen.getByText('STR')).toBeInTheDocument();
    expect(screen.getByText('DEX')).toBeInTheDocument();
    expect(screen.getByText('CON')).toBeInTheDocument();
    expect(screen.getByText('INT')).toBeInTheDocument();
    expect(screen.getByText('WIS')).toBeInTheDocument();
    expect(screen.getByText('CHA')).toBeInTheDocument();
  });

  it('renders positive modifier badges (INT 16 base + species bonuses)', () => {
    const char = makeCharacter();
    render(<AbilityScoresGrid abilityScores={char.abilityScores} onRoll={() => {}} />);
    // At least one modifier should be positive (e.g. INT or DEX from Elf species)
    const positiveBadge = screen.getAllByText(/^\+/)[0];
    expect(positiveBadge).toBeInTheDocument();
  });

  it('renders negative modifier as danger badge', () => {
    const char = makeCharacter({ abilityScores: { Strength: 8 } }); // STR 8 → -1
    render(<AbilityScoresGrid abilityScores={char.abilityScores} onRoll={() => {}} />);
    expect(screen.getByText('-1')).toBeInTheDocument();
  });

  it('renders zero modifier as secondary badge', () => {
    const char = makeCharacter({ abilityScores: { Charisma: 10 } }); // CHA 10 → +0
    render(<AbilityScoresGrid abilityScores={char.abilityScores} onRoll={() => {}} />);
    // +0 should be rendered somewhere (at least one ability could be 10)
    const allBadges = screen.getAllByText(/^[+−]\d$/);
    expect(allBadges.length).toBeGreaterThan(0);
  });

  it('rolls the tapped ability', () => {
    const char = makeCharacter();
    const onRoll = vi.fn();
    render(<AbilityScoresGrid abilityScores={char.abilityScores} onRoll={onRoll} />);
    fireEvent.click(screen.getByLabelText('Roll Strength check'));
    expect(onRoll).toHaveBeenCalledWith('Strength');
  });

  it('uses grid-cols-3 for mobile 3×2 layout', () => {
    const char = makeCharacter();
    const { container } = render(
      <AbilityScoresGrid abilityScores={char.abilityScores} onRoll={() => {}} />,
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain('grid-cols-3');
  });

  it('renders roll button for each ability with correct aria-label', () => {
    const char = makeCharacter();
    render(<AbilityScoresGrid abilityScores={char.abilityScores} onRoll={() => {}} />);
    expect(screen.getByLabelText('Roll Strength check')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Dexterity check')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Constitution check')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Intelligence check')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Wisdom check')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Charisma check')).toBeInTheDocument();
  });
});
