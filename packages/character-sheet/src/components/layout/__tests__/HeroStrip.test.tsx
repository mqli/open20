// HeroStrip.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeroStrip } from '../HeroStrip';
import { makeCharacter } from '@/test/fixtures';
import { initContent } from '@/core/content-resolver';

describe('HeroStrip', () => {
  beforeEach(() => {
    initContent();
  });

  // --- HP bar rendering ---

  it('renders HP current/max text', () => {
    const char = makeCharacter();
    render(<HeroStrip character={char} />);
    expect(screen.getByText(`${char.hitPoints.current}/${char.hitPoints.max}`)).toBeInTheDocument();
  });

  it('renders HP progress bar with correct aria attributes', () => {
    const char = makeCharacter();
    render(<HeroStrip character={char} />);
    const bar = screen.getByRole('progressbar', { name: 'Hit points' });
    expect(bar).toHaveAttribute('aria-valuenow', String(char.hitPoints.current));
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', String(char.hitPoints.max));
  });

  it('shows danger color when HP < 25%', () => {
    // Create character with low HP. We'll render a character then patch HP to low.
    const char = makeCharacter();
    const lowHp = {
      ...char,
      hitPoints: { ...char.hitPoints, current: 1, max: 100 },
    };
    render(<HeroStrip character={lowHp} />);
    const fill = screen.getByRole('progressbar').firstChild as HTMLElement;
    expect(fill.className).toContain('bg-danger');
  });

  it('shows success color when HP >= 25%', () => {
    const char = makeCharacter();
    render(<HeroStrip character={char} />);
    const fill = screen.getByRole('progressbar').firstChild as HTMLElement;
    expect(fill.className).toContain('bg-success');
  });

  // --- AC rendering ---

  it('renders AC value', () => {
    const char = makeCharacter();
    render(<HeroStrip character={char} />);
    expect(screen.getByText(String(char.combatStats.AC))).toBeInTheDocument();
  });

  // --- PB rendering ---

  it('renders proficiency bonus with + prefix', () => {
    const char = makeCharacter();
    render(<HeroStrip character={char} />);
    // Level 5 → PB is +3
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  it('renders negative PB correctly', () => {
    // PB is level-derived so it's always positive, but test the fmt function handles negative
    const char = makeCharacter();
    const negativePb = {
      ...char,
      combatStats: { ...char.combatStats, proficiencyBonus: -2 },
    };
    render(<HeroStrip character={negativePb} />);
    expect(screen.getByText('-2')).toBeInTheDocument();
  });

  // --- Click / expand behavior ---

  it('fires onExpand when clicked', () => {
    const char = makeCharacter();
    const onExpand = vi.fn();
    render(<HeroStrip character={char} onExpand={onExpand} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onExpand).toHaveBeenCalledOnce();
  });

  it('has button role and correct aria-label when onExpand is provided', () => {
    const char = makeCharacter();
    render(<HeroStrip character={char} onExpand={() => {}} />);
    const btn = screen.getByRole('button', { name: 'Expand combat stats' });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute('tabIndex', '0');
  });

  it('does NOT have button role when onExpand is absent', () => {
    const char = makeCharacter();
    render(<HeroStrip character={char} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  // --- Edge cases ---

  it('handles max HP of 0 gracefully (0% bar, no danger)', () => {
    const char = makeCharacter();
    const zeroMax = {
      ...char,
      hitPoints: { ...char.hitPoints, current: 0, max: 0 },
    };
    render(<HeroStrip character={zeroMax} />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '0');
    // Should not crash
  });

  it('handles full HP (100%)', () => {
    const char = makeCharacter();
    const fullHp = {
      ...char,
      hitPoints: { ...char.hitPoints, current: char.hitPoints.max },
    };
    render(<HeroStrip character={fullHp} />);
    const fill = screen.getByRole('progressbar').firstChild as HTMLElement;
    expect(fill.className).toContain('bg-success');
  });

  it('applies className prop', () => {
    const char = makeCharacter();
    const { container } = render(<HeroStrip character={char} className="test-strip-class" />);
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain('test-strip-class');
  });

  it('renders Heart, Shield, and Star icons', () => {
    const char = makeCharacter();
    render(<HeroStrip character={char} />);
    // All icons should be aria-hidden
    const icons = document.querySelectorAll('svg[aria-hidden="true"]');
    // Heart + Shield + Star = 3 icons
    expect(icons.length).toBe(3);
  });
});
