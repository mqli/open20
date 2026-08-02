import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SavingThrowsGrid } from '../SavingThrowsGrid';
import { makeCharacter } from '@/test/fixtures';

const noop = () => {};

describe('SavingThrowsGrid', () => {
  // --- basic rendering ---

  it('renders all six ability short labels', () => {
    const char = makeCharacter();
    render(<SavingThrowsGrid character={char} onRollSave={noop} />);
    expect(screen.getByText('STR')).toBeInTheDocument();
    expect(screen.getByText('DEX')).toBeInTheDocument();
    expect(screen.getByText('CON')).toBeInTheDocument();
    expect(screen.getByText('INT')).toBeInTheDocument();
    expect(screen.getByText('WIS')).toBeInTheDocument();
    expect(screen.getByText('CHA')).toBeInTheDocument();
  });

  it('renders saving throw bonus with + prefix (clickable)', () => {
    const char = makeCharacter();
    render(<SavingThrowsGrid character={char} onRollSave={noop} />);
    // Wizard has INT 16 (+3) and PB +3 -> INT save +6
    expect(screen.getByText('+6')).toBeInTheDocument();
    // WIS 12 (+1) and PB +3 -> WIS save +4
    expect(screen.getByText('+4')).toBeInTheDocument();
  });

  // --- proficiency indicators ---

  it('shows proficient ring border and CircleDot icon for proficient saves', () => {
    const char = makeCharacter();
    const { container } = render(<SavingThrowsGrid character={char} onRollSave={noop} />);
    // Wizard has INT and WIS proficiency
    const intCard = screen.getByText('INT').closest('[class*="ring-2"]');
    expect(intCard).not.toBeNull();
    expect(intCard?.className).toContain('ring-primary-600');

    // Verify CircleDot icons exist (exact count = 2 proficient saves)
    const circleDots = container.querySelectorAll('.lucide-circle-dot');
    expect(circleDots.length).toBe(2);
  });

  it('does not show ring border and uses Circle for non-proficient saves', () => {
    const char = makeCharacter();
    const { container } = render(<SavingThrowsGrid character={char} onRollSave={noop} />);
    // STR is non-proficient for Wizard — no ring class
    const strCard = screen.getByText('STR').closest('[class*="flex"]');
    expect(strCard?.className).not.toContain('ring-2');

    // Circle icons for the 4 non-proficient saves
    const circles = container.querySelectorAll('.lucide-circle');
    expect(circles.length).toBe(4);
  });

  // --- roll interaction ---

  it('calls onRollSave with ability and normal modifier when dice clicked', () => {
    const char = makeCharacter();
    const onRollSave = vi.fn();
    render(<SavingThrowsGrid character={char} onRollSave={onRollSave} />);
    fireEvent.click(screen.getByLabelText('Roll Dexterity saving throw'));
    expect(onRollSave).toHaveBeenCalledWith('Dexterity', 'none');
  });

  it('ChevronUp button rolls with advantage', () => {
    const char = makeCharacter();
    const onRollSave = vi.fn();
    render(<SavingThrowsGrid character={char} onRollSave={onRollSave} />);
    fireEvent.click(screen.getByLabelText('Roll Dexterity saving throw with advantage'));
    expect(onRollSave).toHaveBeenCalledWith('Dexterity', 'advantage');
  });

  it('ChevronDown button rolls with disadvantage', () => {
    const char = makeCharacter();
    const onRollSave = vi.fn();
    render(<SavingThrowsGrid character={char} onRollSave={onRollSave} />);
    fireEvent.click(screen.getByLabelText('Roll Dexterity saving throw with disadvantage'));
    expect(onRollSave).toHaveBeenCalledWith('Dexterity', 'disadvantage');
  });

  // --- layout ---

  it('uses grid-cols-3 for mobile 3x2 layout', () => {
    const char = makeCharacter();
    const { container } = render(<SavingThrowsGrid character={char} onRollSave={noop} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain('grid-cols-3');
  });
});
