import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { initContent } from '@/core/content-resolver';
import { SpellStep } from '../SpellStep';

describe('SpellStep', () => {
  beforeEach(() => {
    initContent();
  });

  it('renders spell list with counter when spellsToPick > 0', () => {
    render(
      <SpellStep
        classId="Wizard"
        newLevel={4}
        spellsToPick={2}
        newSpells={[]}
        onSpellsChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Spell Selection')).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 2/)).toBeInTheDocument();
  });

  it('does not render spell list when spellsToPick is 0', () => {
    render(
      <SpellStep
        classId="Wizard"
        newLevel={4}
        spellsToPick={0}
        newSpells={[]}
        onSpellsChange={vi.fn()}
      />,
    );
    expect(screen.getByText('Spell Selection')).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
  });

  it('clicking a spell add toggles selection', () => {
    const onSpells = vi.fn();
    render(
      <SpellStep
        classId="Wizard"
        newLevel={4}
        spellsToPick={2}
        newSpells={[]}
        onSpellsChange={onSpells}
      />,
    );

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThan(0);
    fireEvent.click(checkboxes[0]!);

    expect(onSpells).toHaveBeenCalledTimes(1);
    const [ids] = onSpells.mock.calls[0] as [string[]];
    expect(ids.length).toBe(1);
  });

  it('does not call onChange when clicking a disabled checkbox at selection limit', () => {
    const onSpells = vi.fn();
    render(
      <SpellStep
        classId="Wizard"
        newLevel={4}
        spellsToPick={1}
        newSpells={['magic-missile']}
        onSpellsChange={onSpells}
      />,
    );

    // Find an unselected item (should be disabled since max is 1)
    const checkboxes = screen.getAllByRole('checkbox');
    const selected = checkboxes.find((cb) => cb.getAttribute('aria-checked') === 'true');
    const unselected = checkboxes.find((cb) => cb.getAttribute('aria-checked') === 'false');
    expect(selected).toBeDefined();
    expect(unselected).toBeDefined();

    // Click the disabled unselected item
    onSpells.mockClear();
    fireEvent.click(unselected!);
    expect(onSpells).not.toHaveBeenCalled();
  });

  it('shows "No spells available" when class has no spells at this level', () => {
    render(
      <SpellStep
        classId="Fighter"
        newLevel={4}
        spellsToPick={2}
        newSpells={[]}
        onSpellsChange={vi.fn()}
      />,
    );
    // Fighter has no spells, so maxSpellLevel = 0, filtered list is empty
    expect(screen.getByText('No spells available')).toBeInTheDocument();
  });
});
