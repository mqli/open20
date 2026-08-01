import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PreparedSpellCard } from '../PreparedSpellCard';

describe('PreparedSpellCard', () => {
  const baseProps = {
    spellId: 'fireball',
    spellName: 'Fireball',
    spellLevel: 3 as const,
    spellSchool: 'Evocation' as const,
    concentration: false,
    ritual: false,
    highestAvailableSlot: 3 as const,
    onCast: vi.fn(),
  };

  it('renders spell name, level badge, and school', () => {
    render(<PreparedSpellCard {...baseProps} />);
    expect(screen.getByText('Fireball')).toBeInTheDocument();
    expect(screen.getByText('Lv3')).toBeInTheDocument();
    expect(screen.getByText('Evo')).toBeInTheDocument();
  });

  it('shows Cantrip badge for level 0 spells', () => {
    render(
      <PreparedSpellCard
        {...baseProps}
        spellLevel={0}
        spellName="Fire Bolt"
        highestAvailableSlot={0 as const}
      />,
    );
    expect(screen.getByText('Cantrip')).toBeInTheDocument();
  });

  it('shows concentration icon when concentration is true', () => {
    render(<PreparedSpellCard {...baseProps} concentration={true} />);
    expect(screen.getByLabelText('Concentration')).toBeInTheDocument();
  });

  it('shows ritual icon when ritual is true', () => {
    render(<PreparedSpellCard {...baseProps} ritual={true} />);
    expect(screen.getByLabelText('Ritual')).toBeInTheDocument();
  });

  it('calls onCast with correct slot level when Cast button is clicked', () => {
    const onCast = vi.fn();
    render(<PreparedSpellCard {...baseProps} onCast={onCast} />);

    const button = screen.getByLabelText('Cast Fireball');
    fireEvent.click(button);

    expect(onCast).toHaveBeenCalledWith(3);
  });

  it('calls onCast with level 0 for cantrips', () => {
    const onCast = vi.fn();
    render(
      <PreparedSpellCard
        {...baseProps}
        spellLevel={0}
        spellName="Fire Bolt"
        highestAvailableSlot={0 as const}
        onCast={onCast}
      />,
    );

    const button = screen.getByLabelText('Cast Fire Bolt');
    fireEvent.click(button);

    expect(onCast).toHaveBeenCalledWith(0);
  });

  it('disables Cast button when no slots available (non-cantrip)', () => {
    render(<PreparedSpellCard {...baseProps} highestAvailableSlot={null} />);
    const button = screen.getByLabelText('Cast Fireball');
    expect(button).toBeDisabled();
  });

  it('enables Cast button for cantrips even with null slots', () => {
    render(
      <PreparedSpellCard
        {...baseProps}
        spellLevel={0}
        spellName="Fire Bolt"
        highestAvailableSlot={null}
      />,
    );
    const button = screen.getByLabelText('Cast Fire Bolt');
    expect(button).not.toBeDisabled();
  });
});
