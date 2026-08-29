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

  it('renders 5 tab buttons (4 primary + More)', () => {
    renderBar();
    const tabs = screen.getAllByRole('tab');
    // Combat, Skills, Spells, Abilities, More = 5
    expect(tabs).toHaveLength(5);
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
    expect(screen.getByRole('tab', { name: 'Abilities' })).toBeInTheDocument();
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

  it('calls onSectionChange with abilities when Abilities tab is clicked', () => {
    renderBar('combat');
    fireEvent.click(screen.getByRole('tab', { name: 'Abilities' }));
    expect(onSectionChange).toHaveBeenCalledWith('abilities');
  });

  // --- More bottom sheet ---

  it('opens the More bottom sheet when More tab is clicked', () => {
    renderBar();
    // Secondary section items should not be visible initially
    expect(screen.queryByText('Equipment')).not.toBeInTheDocument();

    // Click More
    fireEvent.click(screen.getByRole('tab', { name: 'More sections' }));

    // Secondary items should now be visible in the sheet
    expect(screen.getByText('Equipment')).toBeInTheDocument();
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('marks More tab as selected when activeSection is a secondary section', () => {
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

  it('calls onSectionChange and closes sheet when a secondary item is clicked', () => {
    renderBar();
    fireEvent.click(screen.getByRole('tab', { name: 'More sections' }));
    fireEvent.click(screen.getByText('Equipment'));

    expect(onSectionChange).toHaveBeenCalledWith('equipment');
    // Sheet should close
    expect(screen.queryByText('Equipment')).not.toBeInTheDocument();
  });

  it('closes sheet on backdrop click', () => {
    renderBar();
    fireEvent.click(screen.getByRole('tab', { name: 'More sections' }));
    expect(screen.getByText('Equipment')).toBeInTheDocument();

    // Click the backdrop (the dialog overlay)
    const backdrop = document.querySelector('[aria-hidden="true"].bg-black\\/50');
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop!);

    expect(screen.queryByText('Equipment')).not.toBeInTheDocument();
  });

  it('closes sheet on close button click', () => {
    renderBar();
    fireEvent.click(screen.getByRole('tab', { name: 'More sections' }));
    expect(screen.getByText('Equipment')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));

    expect(screen.queryByText('Equipment')).not.toBeInTheDocument();
  });

  // --- More button aria attributes ---

  it('sets aria-haspopup and aria-expanded on More tab', () => {
    renderBar();
    const moreTab = screen.getByRole('tab', { name: 'More sections' });
    expect(moreTab).toHaveAttribute('aria-haspopup', 'dialog');
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

  it('shows active indicator bar on the combat tab when active', () => {
    renderBar('combat');
    const combatTab = screen.getByRole('tab', { name: 'Combat' });
    const indicator = combatTab.querySelector('.absolute');
    expect(indicator).toBeInTheDocument();
  });

  // --- className prop ---

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
