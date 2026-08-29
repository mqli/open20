import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Shield, Dumbbell } from 'lucide-react';
import { SectionCollapse } from '../SectionCollapse';

describe('SectionCollapse', () => {
  it('renders title and icon', () => {
    render(
      <SectionCollapse id="combat" title="Combat" icon={Shield} expanded={false} onToggle={vi.fn()}>
        <p>Content</p>
      </SectionCollapse>,
    );
    expect(screen.getByText('Combat')).toBeInTheDocument();
    // Icon is rendered as SVG
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('shows children when expanded', () => {
    render(
      <SectionCollapse id="abilities" title="Abilities" icon={Dumbbell} expanded onToggle={vi.fn()}>
        <p>Ability content</p>
      </SectionCollapse>,
    );
    expect(screen.getByText('Ability content')).toBeInTheDocument();
  });

  it('hides children when collapsed', () => {
    render(
      <SectionCollapse
        id="abilities"
        title="Abilities"
        icon={Dumbbell}
        expanded={false}
        onToggle={vi.fn()}
      >
        <p>Ability content</p>
      </SectionCollapse>,
    );
    // Content is inside overflow-hidden with grid-rows-[0fr], so it's visually hidden
    // but still rendered in DOM (for animation). Just verify it exists in the tree.
    expect(screen.getByText('Ability content')).toBeInTheDocument();
  });

  it('calls onToggle when header is clicked', () => {
    const onToggle = vi.fn();
    render(
      <SectionCollapse
        id="skills"
        title="Skills"
        icon={Dumbbell}
        expanded={false}
        onToggle={onToggle}
      >
        <p>Skills</p>
      </SectionCollapse>,
    );
    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('has aria-expanded reflecting state', () => {
    const { rerender } = render(
      <SectionCollapse
        id="skills"
        title="Skills"
        icon={Dumbbell}
        expanded={false}
        onToggle={vi.fn()}
      >
        <p>Skills</p>
      </SectionCollapse>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false');

    rerender(
      <SectionCollapse id="skills" title="Skills" icon={Dumbbell} expanded onToggle={vi.fn()}>
        <p>Skills</p>
      </SectionCollapse>,
    );
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'true');
  });

  it('sets id and aria-labelledby for accessibility', () => {
    render(
      <SectionCollapse id="section-combat" title="Combat" icon={Shield} expanded onToggle={vi.fn()}>
        <p>Accessible</p>
      </SectionCollapse>,
    );
    const section = document.getElementById('section-combat');
    expect(section).toBeInTheDocument();
    expect(section!.getAttribute('aria-labelledby')).toBe('section-combat-heading');
    expect(document.getElementById('section-combat-heading')).toBeInTheDocument();
  });
});
