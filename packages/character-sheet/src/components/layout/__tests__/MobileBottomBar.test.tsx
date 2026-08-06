// MobileBottomBar.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileBottomBar } from '../MobileBottomBar';
import type { SectionKey } from '../Sidebar';
import { initContent } from '@/core/content-resolver';

describe('MobileBottomBar', () => {
  const onSectionChange = vi.fn();

  beforeEach(() => {
    initContent();
    onSectionChange.mockClear();
  });

  function renderBar(activeSection: SectionKey = 'combat') {
    return render(
      <MobileBottomBar activeSection={activeSection} onSectionChange={onSectionChange} />,
    );
  }

  // --- primary tab rendering ---

  it('renders 4 tab buttons (3 primary + More)', () => {
    renderBar();
    const tabs = screen.getAllByRole('tab');
    // Combat, Skills, Spells, More = 4
    expect(tabs).toHaveLength(4);
  });

  it('marks the active primary tab as selected', () => {
    renderBar('skills');
    const skillsTab = screen.getByRole('tab', { name: 'Skills' });
    expect(skillsTab).toHaveAttribute('aria-selected', 'true');
  });

  it('marks inactive primary tabs as not selected', () => {
    renderBar('skills');
    const combatTab = screen.getByRole('tab', { name: 'Combat' });
    expect(combatTab).toHaveAttribute('aria-selected', 'false');
  });

  it('renders correct labels for primary tabs', () => {
    renderBar();
    expect(screen.getByRole('tab', { name: 'Combat' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Skills' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Spells' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'More sections' })).toBeInTheDocument();
  });

  // --- nav callbacks ---

  it('calls onSectionChange with combat when Combat tab is clicked', () => {
    renderBar('skills');
    fireEvent.click(screen.getByRole('tab', { name: 'Combat' }));
    expect(onSectionChange).toHaveBeenCalledWith('combat');
  });

  it('calls onSectionChange with skills when Skills tab is clicked', () => {
    renderBar('combat');
    fireEvent.click(screen.getByRole('tab', { name: 'Skills' }));
    expect(onSectionChange).toHaveBeenCalledWith('skills');
  });

  it('calls onSectionChange with spells when Spells tab is clicked', () => {
    renderBar('combat');
    fireEvent.click(screen.getByRole('tab', { name: 'Spells' }));
    expect(onSectionChange).toHaveBeenCalledWith('spells');
  });

  // --- More dropdown ---

  it('opens overflow dropdown when More tab is clicked', () => {
    renderBar();
    // More dropdown should not be visible initially
    expect(screen.queryByRole('button', { name: 'Abilities' })).not.toBeInTheDocument();

    // Click More
    fireEvent.click(screen.getByRole('tab', { name: 'More sections' }));

    // Overflow items should now be visible
    expect(screen.getByText('Abilities')).toBeInTheDocument();
    expect(screen.getByText('Equipment')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('marks More tab as selected when activeSection is an overflow section', () => {
    renderBar('abilities');
    const moreTab = screen.getByRole('tab', { name: 'More sections' });
    expect(moreTab).toHaveAttribute('aria-selected', 'true');
  });

  it('marks More tab as selected for equipment', () => {
    renderBar('equipment');
    const moreTab = screen.getByRole('tab', { name: 'More sections' });
    expect(moreTab).toHaveAttribute('aria-selected', 'true');
  });

  it('marks More tab as selected for features', () => {
    renderBar('features');
    const moreTab = screen.getByRole('tab', { name: 'More sections' });
    expect(moreTab).toHaveAttribute('aria-selected', 'true');
  });

  it('marks More tab as selected for notes', () => {
    renderBar('notes');
    const moreTab = screen.getByRole('tab', { name: 'More sections' });
    expect(moreTab).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onSectionChange and closes dropdown when overflow item is clicked', () => {
    renderBar();
    fireEvent.click(screen.getByRole('tab', { name: 'More sections' }));
    fireEvent.click(screen.getByText('Abilities'));

    expect(onSectionChange).toHaveBeenCalledWith('abilities');
    // Dropdown should close
    expect(screen.queryByText('Abilities')).not.toBeInTheDocument();
  });

  it('closes dropdown on outside click', () => {
    renderBar();
    fireEvent.click(screen.getByRole('tab', { name: 'More sections' }));
    expect(screen.getByText('Abilities')).toBeInTheDocument();

    // Click outside — fire mousedown on document
    fireEvent.mouseDown(document.body);

    // Dropdown should close
    expect(screen.queryByText('Abilities')).not.toBeInTheDocument();
  });

  it('closes dropdown on Escape key', () => {
    renderBar();
    fireEvent.click(screen.getByRole('tab', { name: 'More sections' }));
    expect(screen.getByText('Abilities')).toBeInTheDocument();

    // Press Escape
    fireEvent.keyDown(document, { key: 'Escape' });

    // Dropdown should close
    expect(screen.queryByText('Abilities')).not.toBeInTheDocument();
  });

  // --- More dropdown contains RestActions ---

  it('renders RestActions inside the More dropdown', () => {
    renderBar();
    fireEvent.click(screen.getByRole('tab', { name: 'More sections' }));
    expect(screen.getByText('Rest Actions')).toBeInTheDocument();
    expect(screen.getByText('Short Rest')).toBeInTheDocument();
    expect(screen.getByText('Long Rest')).toBeInTheDocument();
  });

  // --- More button aria attributes ---

  it('sets aria-haspopup and aria-expanded on More tab', () => {
    renderBar();
    const moreTab = screen.getByRole('tab', { name: 'More sections' });
    expect(moreTab).toHaveAttribute('aria-haspopup', 'true');
    expect(moreTab).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(moreTab);
    expect(moreTab).toHaveAttribute('aria-expanded', 'true');
  });

  // --- nav element ---

  it('renders a nav element with correct aria-label', () => {
    renderBar();
    const nav = document.querySelector('nav');
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveAttribute('aria-label', 'Character sheet navigation');
  });

  // --- active section visual indicator ---

  it('shows active indicator dot on the combat tab when active', () => {
    renderBar('combat');
    // The active tab has a div for the indicator bar at the top
    const combatTab = screen.getByRole('tab', { name: 'Combat' });
    const indicator = combatTab.querySelector('.absolute');
    expect(indicator).toBeInTheDocument();
  });

  // --- overflow items active styling ---

  it('renders overflow items with correct text content', () => {
    renderBar();
    fireEvent.click(screen.getByRole('tab', { name: 'More sections' }));

    // Each overflow item should render its label
    expect(screen.getByText('Abilities')).toBeInTheDocument();
    expect(screen.getByText('Equipment')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('applies className prop', () => {
    const { container } = render(
      <MobileBottomBar
        activeSection="combat"
        onSectionChange={onSectionChange}
        className="bottom-bar-extra"
      />,
    );
    const nav = container.querySelector('nav');
    expect(nav?.className).toContain('bottom-bar-extra');
  });
});
