import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Shield, Swords, Footprints, Eye } from 'lucide-react';
import { CombatStatCard } from '../CombatStatCard';

describe('CombatStatCard', () => {
  // --- basic rendering ---

  it('renders icon, label, and value', () => {
    render(<CombatStatCard icon={Shield} label="AC" value="15" />);
    expect(screen.getByText('AC')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    // Icon is rendered as SVG
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders different stat values', () => {
    render(<CombatStatCard icon={Eye} label="PP" value="14" />);
    expect(screen.getByText('PP')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
  });

  it('renders value with + prefix for positive modifiers', () => {
    render(<CombatStatCard icon={Swords} label="Init" value="+3" />);
    expect(screen.getByText('+3')).toBeInTheDocument();
  });

  // --- non-interactive (no onTap) ---

  it('renders as a plain Surface when onTap is not provided', () => {
    const { container } = render(<CombatStatCard icon={Shield} label="AC" value="15" />);
    // Should NOT wrap in a button
    const button = container.querySelector('button');
    expect(button).toBeNull();
  });

  // --- interactive (with onTap) ---

  it('wraps in a button when onTap is provided', () => {
    const onTap = vi.fn();
    render(<CombatStatCard icon={Swords} label="Init" value="+3" onTap={onTap} />);
    const button = screen.getByRole('button', { name: 'Roll Init' });
    expect(button).toBeInTheDocument();
  });

  it('calls onTap when clicked', () => {
    const onTap = vi.fn();
    render(<CombatStatCard icon={Swords} label="Init" value="+3" onTap={onTap} />);
    fireEvent.click(screen.getByRole('button', { name: 'Roll Init' }));
    expect(onTap).toHaveBeenCalledOnce();
  });

  it('has aria-label on interactive card', () => {
    render(<CombatStatCard icon={Footprints} label="Speed" value="30" onTap={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Roll Speed' })).toBeInTheDocument();
  });

  // --- className passthrough ---

  it('passes className to the Surface', () => {
    const { container } = render(
      <CombatStatCard icon={Shield} label="AC" value="15" className="test-extra" />,
    );
    const surface = container.querySelector('.test-extra');
    expect(surface).not.toBeNull();
  });
});
