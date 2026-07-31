import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CombatStatsBar } from '../CombatStatsBar';
import { makeCharacter } from '@/test/fixtures';

// Mock rollAdapter to avoid side effects
vi.mock('@/core/roll-adapter', () => ({
  rollInitiative: vi.fn(),
}));

import { rollInitiative } from '@/core/roll-adapter';

describe('CombatStatsBar', () => {
  // --- basic rendering ---

  it('renders AC from combatStats', () => {
    const char = makeCharacter();
    render(<CombatStatsBar character={char} />);
    // Elf DEX 14+2 racial = 16 (+3), no armor -> AC 13
    expect(screen.getByText('13')).toBeInTheDocument();
  });

  it('renders Initiative bonus with + prefix', () => {
    const char = makeCharacter();
    render(<CombatStatsBar character={char} />);
    // DEX 14+2 racial = 16 (+3) -> +3 initiative
    // Both Init and PB show +3, so query via the Init button
    const initBtn = screen.getByRole('button', { name: 'Roll Init' });
    expect(initBtn).toHaveTextContent('+3');
  });

  it('renders Speed in feet', () => {
    const char = makeCharacter();
    render(<CombatStatsBar character={char} />);
    // Elf base speed = 30 ft
    expect(screen.getByText('30 ft')).toBeInTheDocument();
  });

  it('renders Passive Perception', () => {
    const char = makeCharacter();
    render(<CombatStatsBar character={char} />);
    // Wizard has Perception not proficient, WIS 12 (+1) -> PP 11
    expect(screen.getByText('11')).toBeInTheDocument();
  });

  it('renders Proficiency Bonus with + prefix', () => {
    const char = makeCharacter();
    render(<CombatStatsBar character={char} />);
    // Level 5 -> PB +3 (both Init and PB show +3)
    const bonusTexts = screen.getAllByText('+3');
    expect(bonusTexts.length).toBeGreaterThanOrEqual(2);
  });

  it('renders Inspiration as — when false', () => {
    const char = makeCharacter();
    const onToggleInspiration = vi.fn();
    render(<CombatStatsBar character={char} onToggleInspiration={onToggleInspiration} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders Inspiration as ON when true', () => {
    const char = { ...makeCharacter(), inspiration: true };
    const onToggleInspiration = vi.fn();
    render(<CombatStatsBar character={char} onToggleInspiration={onToggleInspiration} />);
    expect(screen.getByText('ON')).toBeInTheDocument();
  });

  // --- inspiration tap ---

  it('calls onToggleInspiration when inspiration card is tapped', () => {
    const onToggleInspiration = vi.fn();
    const char = makeCharacter();
    render(<CombatStatsBar character={char} onToggleInspiration={onToggleInspiration} />);
    fireEvent.click(screen.getByRole('button', { name: 'Roll Insp' }));
    expect(onToggleInspiration).toHaveBeenCalled();
  });

  // --- initiative tap ---

  it('calls rollInitiative when initiative card is tapped', () => {
    const char = makeCharacter();
    render(<CombatStatsBar character={char} />);
    fireEvent.click(screen.getByRole('button', { name: 'Roll Init' }));
    expect(rollInitiative).toHaveBeenCalledWith(char);
  });

  // --- non-rollable cards have no button ---

  it('AC card has no button (not rollable)', () => {
    const char = makeCharacter();
    const onToggleInspiration = vi.fn();
    render(<CombatStatsBar character={char} onToggleInspiration={onToggleInspiration} />);

    // AC should render as text but NOT have a surrounding button
    const buttons = screen.queryAllByRole('button');
    // Init + Inspiration should be buttons
    expect(buttons).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Roll Init' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Roll Insp' })).toBeInTheDocument();
  });

  // --- layout ---

  it('uses grid-cols-3 for mobile layout', () => {
    const char = makeCharacter();
    const { container } = render(<CombatStatsBar character={char} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain('grid-cols-3');
  });
});
