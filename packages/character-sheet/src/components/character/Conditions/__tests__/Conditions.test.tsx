// Conditions.test.tsx — T-207

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConditionChip, AddConditionMenu, ConditionsPanel } from '../Conditions';
import type { ActiveCondition, ConditionName } from 'open20-core';
import { initContent } from '@/core/content-resolver';

function makeCondition(name: ConditionName = 'Blinded'): ActiveCondition {
  return {
    id: name,
    source: 'Test',
    appliedAt: new Date().toISOString(),
  };
}

/** Click the Add button and wait for the dropdown to open. */
async function openMenu() {
  const trigger = screen.getByRole('button', { name: 'Add condition' });
  fireEvent.pointerDown(trigger);
  await waitFor(() => {
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });
}

// ─── ConditionChip ─────────────────────────────────────────

describe('ConditionChip', () => {
  beforeEach(() => {
    initContent();
  });

  it('renders the condition name as text (non-color cue, NFR-01)', () => {
    render(<ConditionChip condition={makeCondition('Poisoned')} onDismiss={() => {}} />);
    expect(screen.getByText('Poisoned')).toBeInTheDocument();
  });

  it('calls onDismiss when X button is clicked', () => {
    const onDismiss = vi.fn();
    render(<ConditionChip condition={makeCondition()} onDismiss={onDismiss} />);

    fireEvent.click(screen.getByRole('button', { name: 'Remove Blinded' }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it('has warning color styling', () => {
    render(<ConditionChip condition={makeCondition()} onDismiss={() => {}} />);

    const name = screen.getByText('Blinded');
    expect(name.className).toContain('text-warning');
  });

  it('shows description as title attribute', () => {
    render(
      <ConditionChip
        condition={makeCondition()}
        description="Can't see and auto-fails sight checks."
        onDismiss={() => {}}
      />,
    );

    const chip = screen.getByText('Blinded').closest('div')!;
    expect(chip.getAttribute('title')).toBe("Can't see and auto-fails sight checks.");
  });

  it('renders different condition names correctly', () => {
    const { rerender } = render(
      <ConditionChip condition={makeCondition('Petrified')} onDismiss={() => {}} />,
    );
    expect(screen.getByText('Petrified')).toBeInTheDocument();

    rerender(<ConditionChip condition={makeCondition('Stunned')} onDismiss={() => {}} />);
    expect(screen.getByText('Stunned')).toBeInTheDocument();
  });
});

// ─── AddConditionMenu ──────────────────────────────────────

describe('AddConditionMenu', () => {
  beforeEach(() => {
    initContent();
  });

  it('renders an Add button', () => {
    render(<AddConditionMenu activeIds={new Set()} onToggle={() => {}} />);
    expect(screen.getByRole('button', { name: 'Add condition' })).toBeInTheDocument();
  });

  it('opens dropdown showing 14 conditions (minus Exhaustion) on click', async () => {
    render(<AddConditionMenu activeIds={new Set()} onToggle={() => {}} />);
    await openMenu();

    // All 14 conditions should be listed
    const conditions = [
      'Blinded',
      'Charmed',
      'Deafened',
      'Frightened',
      'Grappled',
      'Incapacitated',
      'Invisible',
      'Paralyzed',
      'Petrified',
      'Poisoned',
      'Prone',
      'Restrained',
      'Stunned',
      'Unconscious',
    ];
    for (const name of conditions) {
      expect(screen.getByText(name)).toBeInTheDocument();
    }

    // Exhaustion should NOT appear
    expect(screen.queryByText(/^Exhaustion$/)).not.toBeInTheDocument();
  });

  it('filters out already-active conditions', async () => {
    render(<AddConditionMenu activeIds={new Set(['Blinded', 'Prone'])} onToggle={() => {}} />);
    await openMenu();

    // Active conditions should not appear in menu
    expect(screen.queryByText(/^Blinded$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Prone$/)).not.toBeInTheDocument();
    // Others should still be there
    expect(screen.getByText('Charmed')).toBeInTheDocument();
  });

  it('calls onToggle when a condition is selected', async () => {
    const onToggle = vi.fn();
    render(<AddConditionMenu activeIds={new Set()} onToggle={onToggle} />);
    await openMenu();

    // Radix DropdownMenu items use onSelect, triggered by click on the menuitem
    fireEvent.click(screen.getByText('Blinded'));

    expect(onToggle).toHaveBeenCalledWith('Blinded');
  });

  it('shows "All conditions active" when all 14 are active', async () => {
    const all14 = new Set<ConditionName>([
      'Blinded',
      'Charmed',
      'Deafened',
      'Frightened',
      'Grappled',
      'Incapacitated',
      'Invisible',
      'Paralyzed',
      'Petrified',
      'Poisoned',
      'Prone',
      'Restrained',
      'Stunned',
      'Unconscious',
    ]);
    render(<AddConditionMenu activeIds={all14} onToggle={() => {}} />);
    await openMenu();

    expect(screen.getByText('All conditions active')).toBeInTheDocument();
  });

  it('shows descriptions for each condition', async () => {
    render(<AddConditionMenu activeIds={new Set()} onToggle={() => {}} />);
    await openMenu();

    // Blinded description should mention sight-related text
    const menu = screen.getByRole('menu');
    expect(menu.textContent).toMatch(/can'?t see/i);
  });
});

// ─── ConditionsPanel ───────────────────────────────────────

describe('ConditionsPanel', () => {
  beforeEach(() => {
    initContent();
  });

  it('renders active condition chips', () => {
    const conditions = [makeCondition('Blinded'), makeCondition('Prone')];
    render(<ConditionsPanel conditions={conditions} onToggle={() => {}} />);

    expect(screen.getByText('Blinded')).toBeInTheDocument();
    expect(screen.getByText('Prone')).toBeInTheDocument();
  });

  it('calls onToggle when a chip is dismissed', () => {
    const onToggle = vi.fn();
    const conditions = [makeCondition('Blinded')];
    render(<ConditionsPanel conditions={conditions} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole('button', { name: 'Remove Blinded' }));
    expect(onToggle).toHaveBeenCalledWith('Blinded');
  });

  it('renders AddConditionMenu even when no conditions are active', () => {
    render(<ConditionsPanel conditions={[]} onToggle={() => {}} />);
    expect(screen.getByRole('button', { name: 'Add condition' })).toBeInTheDocument();
  });

  it('shows Exhaustion as tracker, not as dismissible chip', () => {
    const conditions = [makeCondition('Exhaustion'), makeCondition('Blinded')];
    render(<ConditionsPanel conditions={conditions} onToggle={() => {}} />);

    // Blinded chip should appear
    expect(screen.getByText('Blinded')).toBeInTheDocument();

    // Exhaustion should NOT appear as a dismissible chip (no X button next to it)
    const chipLabels = screen.getAllByText('Exhaustion');
    // Should be present (tracker label) not absent
    expect(chipLabels.length).toBeGreaterThanOrEqual(1);

    // No X button for removing Exhaustion as a chip
    expect(screen.queryByRole('button', { name: 'Remove Exhaustion' })).not.toBeInTheDocument();
  });

  it('renders ExhaustionTracker when exhaustion is active', () => {
    const conditions = [makeCondition('Exhaustion')];
    render(<ConditionsPanel conditions={conditions} onToggle={() => {}} />);

    // The tracker shows the exhaustion label and stepper
    expect(screen.getByText('Exhaustion')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Increase exhaustion level' })).toBeInTheDocument();
  });
});
