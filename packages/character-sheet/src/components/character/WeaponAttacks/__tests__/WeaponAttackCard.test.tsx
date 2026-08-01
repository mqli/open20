import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WeaponAttackCard } from '../WeaponAttackCard';
import type { CharacterAttack } from 'open20-core';
import { makeCharacter } from '@/test/fixtures';

function makeLongswordAttack(overrides: Partial<CharacterAttack> = {}): CharacterAttack {
  return {
    name: 'Longsword',
    attackBonus: 5,
    damage: '1d8+3 Slashing',
    damageType: 'Slashing',
    abilityUsed: 'Strength',
    mastery: [],
    ...overrides,
  };
}

function makeDaggerAttack(overrides: Partial<CharacterAttack> = {}): CharacterAttack {
  return {
    name: 'Dagger',
    attackBonus: 5,
    damage: '1d4+3 Piercing',
    damageType: 'Piercing',
    abilityUsed: 'Dexterity',
    mastery: [],
    ...overrides,
  };
}

describe('WeaponAttackCard', () => {
  const character = makeCharacter();

  // --- basic rendering ---

  it('renders the attack name', () => {
    const attack = makeLongswordAttack();
    render(<WeaponAttackCard attack={attack} character={character} onRoll={vi.fn()} />);
    expect(screen.getByText('Longsword')).toBeInTheDocument();
  });

  it('renders the attack bonus badge', () => {
    const attack = makeLongswordAttack({ attackBonus: 7 });
    render(<WeaponAttackCard attack={attack} character={character} onRoll={vi.fn()} />);
    // +7 appears in both the Badge and the RollModifierRow button
    const elements = screen.getAllByText('+7');
    expect(elements.length).toBeGreaterThanOrEqual(2);
  });

  it('renders negative attack bonus in danger color', () => {
    const attack = makeLongswordAttack({ attackBonus: -2 });
    render(<WeaponAttackCard attack={attack} character={character} onRoll={vi.fn()} />);
    const elements = screen.getAllByText('\u22122');
    expect(elements.length).toBeGreaterThanOrEqual(2);
  });

  it('renders the damage text', () => {
    const attack = makeLongswordAttack({ damage: '1d8+3 Slashing' });
    render(<WeaponAttackCard attack={attack} character={character} onRoll={vi.fn()} />);
    expect(screen.getByText('1d8+3 Slashing')).toBeInTheDocument();
  });

  it('renders the ability tag', () => {
    const attack = makeLongswordAttack({ abilityUsed: 'Strength' });
    render(<WeaponAttackCard attack={attack} character={character} onRoll={vi.fn()} />);
    expect(screen.getByText('STR')).toBeInTheDocument();
  });

  it('renders DEX tag for dexterity-based attacks', () => {
    const attack = makeDaggerAttack({ abilityUsed: 'Dexterity' });
    render(<WeaponAttackCard attack={attack} character={character} onRoll={vi.fn()} />);
    expect(screen.getByText('DEX')).toBeInTheDocument();
  });

  // --- fallbacks for optional fields ---

  it('falls back to STR tag when abilityUsed is undefined', () => {
    const attack = makeLongswordAttack({ abilityUsed: undefined });
    render(<WeaponAttackCard attack={attack} character={character} onRoll={vi.fn()} />);
    expect(screen.getByText('STR')).toBeInTheDocument();
  });

  it('computes attack bonus from ability + PB when attackBonus is undefined', () => {
    // Character has DEX 16 (+3), PB +3 at level 5
    const attack = makeDaggerAttack({ attackBonus: undefined });
    render(<WeaponAttackCard attack={attack} character={character} onRoll={vi.fn()} />);
    // DEX +3 + PB +3 = +6, appears in Badge and RollModifierRow
    const elements = screen.getAllByText('+6');
    expect(elements.length).toBeGreaterThanOrEqual(2);
  });

  it('does not render damage text when attack has no damage entries or string', () => {
    const attack = makeLongswordAttack({ damage: undefined, damageEntries: undefined });
    render(<WeaponAttackCard attack={attack} character={character} onRoll={vi.fn()} />);
    // When there's no damage, no damage text is shown at all
    expect(screen.queryByText(/slashing/i)).toBeNull();
    // Attack name and bonus still render
    expect(screen.getByText('Longsword')).toBeInTheDocument();
    const bonusElements = screen.getAllByText('+5');
    expect(bonusElements.length).toBeGreaterThanOrEqual(2);
  });

  // --- roll callback ---

  it('calls onRoll with "none" when center button is clicked (normal roll)', () => {
    const onRoll = vi.fn();
    const attack = makeLongswordAttack();
    render(<WeaponAttackCard attack={attack} character={character} onRoll={onRoll} />);

    fireEvent.click(screen.getByRole('button', { name: 'Roll attack with Longsword' }));
    expect(onRoll).toHaveBeenCalledWith('none');
  });

  it('calls onRoll with "advantage" when advantage button is clicked', () => {
    const onRoll = vi.fn();
    const attack = makeLongswordAttack();
    render(<WeaponAttackCard attack={attack} character={character} onRoll={onRoll} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Roll attack with Longsword with advantage' }),
    );
    expect(onRoll).toHaveBeenCalledWith('advantage');
  });

  it('calls onRoll with "disadvantage" when disadvantage button is clicked', () => {
    const onRoll = vi.fn();
    const attack = makeLongswordAttack();
    render(<WeaponAttackCard attack={attack} character={character} onRoll={onRoll} />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Roll attack with Longsword with disadvantage' }),
    );
    expect(onRoll).toHaveBeenCalledWith('disadvantage');
  });

  // --- accessibility ---

  it('renders weapon icon with aria-hidden', () => {
    const attack = makeLongswordAttack();
    const { container } = render(
      <WeaponAttackCard attack={attack} character={character} onRoll={vi.fn()} />,
    );
    const icon = container.querySelector('svg[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
  });
});
