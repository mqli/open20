// DamageDefensesSection.test.tsx — T-210

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DamageDefensesSection } from '../DamageDefensesSection';
import type { DamageDefenses } from 'open20-core';

function makeDefenses(overrides?: Partial<DamageDefenses>): DamageDefenses {
  return {
    resistances: [],
    immunities: [],
    vulnerabilities: [],
    ...overrides,
  };
}

describe('DamageDefensesSection', () => {
  // --- rendering ---

  it('shows all three group labels', () => {
    render(<DamageDefensesSection defenses={makeDefenses()} />);
    expect(screen.getByText('Resistances')).toBeInTheDocument();
    expect(screen.getByText('Immunities')).toBeInTheDocument();
    expect(screen.getByText('Vulnerabilities')).toBeInTheDocument();
  });

  it('shows three distinct icons (non-colour cues, NFR-01)', () => {
    const { container } = render(<DamageDefensesSection defenses={makeDefenses()} />);
    // Three SVG icons should be present (aria-hidden)
    const icons = container.querySelectorAll('svg[aria-hidden]');
    expect(icons.length).toBe(3);
  });

  // --- empty state ---

  it('shows "(none)" for empty groups', () => {
    render(<DamageDefensesSection defenses={makeDefenses()} />);
    const empties = screen.getAllByText('(none)');
    expect(empties).toHaveLength(3);
  });

  // --- populated groups ---

  it('renders damage type badges for resistances', () => {
    render(<DamageDefensesSection defenses={makeDefenses({ resistances: ['Fire', 'Cold'] })} />);
    expect(screen.getByText('Fire')).toBeInTheDocument();
    expect(screen.getByText('Cold')).toBeInTheDocument();
  });

  it('renders damage type badges for immunities', () => {
    render(<DamageDefensesSection defenses={makeDefenses({ immunities: ['Poison'] })} />);
    expect(screen.getByText('Poison')).toBeInTheDocument();
  });

  it('renders damage type badges for vulnerabilities', () => {
    render(<DamageDefensesSection defenses={makeDefenses({ vulnerabilities: ['Radiant'] })} />);
    expect(screen.getByText('Radiant')).toBeInTheDocument();
  });

  it('handles all three groups populated', () => {
    render(
      <DamageDefensesSection
        defenses={makeDefenses({
          resistances: ['Fire'],
          immunities: ['Poison'],
          vulnerabilities: ['Radiant'],
        })}
      />,
    );
    expect(screen.getByText('Fire')).toBeInTheDocument();
    expect(screen.getByText('Poison')).toBeInTheDocument();
    expect(screen.getByText('Radiant')).toBeInTheDocument();
  });

  it('shows "(none)" for empty groups even when others are populated', () => {
    render(
      <DamageDefensesSection
        defenses={makeDefenses({
          resistances: ['Cold'],
          immunities: [],
          vulnerabilities: ['Lightning'],
        })}
      />,
    );
    // Only immunities should show "(none)"
    const empties = screen.getAllByText('(none)');
    expect(empties).toHaveLength(1);
  });

  it('applies className prop', () => {
    const { container } = render(
      <DamageDefensesSection defenses={makeDefenses()} className="defenses-extra" />,
    );
    const surface = container.querySelector('[class*="defenses-extra"]');
    expect(surface).toBeInTheDocument();
  });

  it('renders multiple resistances correctly', () => {
    render(
      <DamageDefensesSection
        defenses={makeDefenses({
          resistances: ['Fire', 'Cold', 'Lightning', 'Thunder', 'Acid'],
        })}
      />,
    );
    expect(screen.getByText('Fire')).toBeInTheDocument();
    expect(screen.getByText('Cold')).toBeInTheDocument();
    expect(screen.getByText('Lightning')).toBeInTheDocument();
    expect(screen.getByText('Thunder')).toBeInTheDocument();
    expect(screen.getByText('Acid')).toBeInTheDocument();
  });
});
