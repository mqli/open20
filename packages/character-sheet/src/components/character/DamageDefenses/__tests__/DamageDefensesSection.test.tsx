// DamageDefensesSection.test.tsx — T-210

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { DamageDefensesSection } from '../DamageDefensesSection';
import type { DamageDefenses } from 'open20-core';

const onToggle = vi.fn();

function makeDefenses(overrides?: Partial<DamageDefenses>): DamageDefenses {
  return {
    resistances: [],
    immunities: [],
    vulnerabilities: [],
    ...overrides,
  };
}

beforeEach(() => {
  onToggle.mockClear();
});

describe('DamageDefensesSection', () => {
  // --- rendering ---

  it('shows all three group labels', () => {
    render(<DamageDefensesSection defenses={makeDefenses()} onToggle={onToggle} />);
    expect(screen.getByText('Resistances')).toBeInTheDocument();
    expect(screen.getByText('Immunities')).toBeInTheDocument();
    expect(screen.getByText('Vulnerabilities')).toBeInTheDocument();
  });

  it('shows distinct icons (non-colour cues, NFR-01)', () => {
    const { container } = render(
      <DamageDefensesSection defenses={makeDefenses()} onToggle={onToggle} />,
    );
    const icons = container.querySelectorAll('svg[aria-hidden]');
    expect(icons.length).toBeGreaterThanOrEqual(3);
  });

  it('shows "(none)" for empty groups', () => {
    render(<DamageDefensesSection defenses={makeDefenses()} onToggle={onToggle} />);
    const empties = screen.getAllByText('(none)');
    expect(empties).toHaveLength(3);
  });

  // --- populated groups ---

  it('renders damage type badges', () => {
    render(
      <DamageDefensesSection
        defenses={makeDefenses({ resistances: ['Fire', 'Cold'] })}
        onToggle={onToggle}
      />,
    );
    expect(screen.getByText('Fire')).toBeInTheDocument();
    expect(screen.getByText('Cold')).toBeInTheDocument();
    // Only immunities should have (none)
    const empties = screen.getAllByText('(none)');
    expect(empties).toHaveLength(2);
  });

  it('handles all three groups populated', () => {
    render(
      <DamageDefensesSection
        defenses={makeDefenses({
          resistances: ['Fire'],
          immunities: ['Poison'],
          vulnerabilities: ['Radiant'],
        })}
        onToggle={onToggle}
      />,
    );
    expect(screen.getByText('Fire')).toBeInTheDocument();
    expect(screen.getByText('Poison')).toBeInTheDocument();
    expect(screen.getByText('Radiant')).toBeInTheDocument();
  });

  // --- dismiss badges ---

  it('calls onToggle when badge is clicked (remove)', () => {
    render(
      <DamageDefensesSection
        defenses={makeDefenses({ resistances: ['Fire'] })}
        onToggle={onToggle}
      />,
    );
    fireEvent.click(screen.getByText('Fire'));
    expect(onToggle).toHaveBeenCalledWith('resistances', 'Fire');
  });

  it('calls onToggle for immunities dismissal', () => {
    render(
      <DamageDefensesSection
        defenses={makeDefenses({ immunities: ['Poison'] })}
        onToggle={onToggle}
      />,
    );
    fireEvent.click(screen.getByText('Poison'));
    expect(onToggle).toHaveBeenCalledWith('immunities', 'Poison');
  });

  // --- add dropdown ---

  it('renders Add buttons for each group', () => {
    render(<DamageDefensesSection defenses={makeDefenses()} onToggle={onToggle} />);
    // Three dropdown triggers
    expect(screen.getByRole('button', { name: 'Add resistances' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add immunities' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add vulnerabilities' })).toBeInTheDocument();
  });

  it('opens dropdown and shows available damage types', async () => {
    render(<DamageDefensesSection defenses={makeDefenses()} onToggle={onToggle} />);
    // Open resistances dropdown
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Add resistances' }));
    // All 13 types should be available
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Fire')).toBeInTheDocument();
  });

  it('filters out active types from dropdown', () => {
    render(
      <DamageDefensesSection
        defenses={makeDefenses({ resistances: ['Fire'] })}
        onToggle={onToggle}
      />,
    );
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Add resistances' }));
    const menu = screen.getByRole('menu');
    // Fire should not appear in the dropdown (already active)
    expect(within(menu).queryByText('Fire')).not.toBeInTheDocument();
    // Others should
    expect(within(menu).getByText('Cold')).toBeInTheDocument();
  });

  it('calls onToggle when a damage type is selected from dropdown', () => {
    render(<DamageDefensesSection defenses={makeDefenses()} onToggle={onToggle} />);
    fireEvent.pointerDown(screen.getByRole('button', { name: 'Add resistances' }));
    fireEvent.click(screen.getByText('Fire'));
    expect(onToggle).toHaveBeenCalledWith('resistances', 'Fire');
  });
});
