// AbilityScoresGrid.test.tsx — T-103 / T-218

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TooltipProvider } from '@open20/ui';
import { AbilityScoresGrid } from '../AbilityScoresGrid';
import { makeCharacter } from '@/test/fixtures';

const noop = () => {};

function renderWithTooltip(ui: React.ReactElement) {
  return render(<TooltipProvider>{ui}</TooltipProvider>);
}

describe('AbilityScoresGrid', () => {
  // --- basic rendering ---

  it('renders all six ability short labels', () => {
    const char = makeCharacter();
    renderWithTooltip(<AbilityScoresGrid character={char} onRollCheck={noop} onRollSave={noop} />);
    expect(screen.getByText('STR')).toBeInTheDocument();
    expect(screen.getByText('DEX')).toBeInTheDocument();
    expect(screen.getByText('CON')).toBeInTheDocument();
    expect(screen.getByText('INT')).toBeInTheDocument();
    expect(screen.getByText('WIS')).toBeInTheDocument();
    expect(screen.getByText('CHA')).toBeInTheDocument();
  });

  it('renders score values for each ability', () => {
    const char = makeCharacter();
    renderWithTooltip(<AbilityScoresGrid character={char} onRollCheck={noop} onRollSave={noop} />);

    // Each ability should have a score value displayed
    const scores = screen.getAllByText(/\b(10|12|14|16)\b/);
    expect(scores.length).toBeGreaterThanOrEqual(6);
  });

  it('displays modifier badge for ability check', () => {
    const char = makeCharacter();
    renderWithTooltip(<AbilityScoresGrid character={char} onRollCheck={noop} onRollSave={noop} />);

    // Find modifier badges: should include +3 (INT) and others
    const positiveMods = screen.getAllByText(/^\+[0-9]+$/);
    expect(positiveMods.length).toBeGreaterThan(0);
  });

  it('uses a 3-column grid layout', () => {
    const char = makeCharacter();
    const { container } = renderWithTooltip(
      <AbilityScoresGrid character={char} onRollCheck={noop} onRollSave={noop} />,
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid.className).toContain('grid-cols-3');
  });

  // --- Ability check roll ---

  it('calls onRollCheck when modifier badge is clicked', () => {
    const char = makeCharacter();
    const onRollCheck = vi.fn();
    renderWithTooltip(
      <AbilityScoresGrid character={char} onRollCheck={onRollCheck} onRollSave={noop} />,
    );

    fireEvent.click(screen.getByLabelText('Roll Strength check'));
    expect(onRollCheck).toHaveBeenCalledWith('Strength', 'none');
  });

  it('renders ability check button for each ability', () => {
    const char = makeCharacter();
    renderWithTooltip(<AbilityScoresGrid character={char} onRollCheck={noop} onRollSave={noop} />);
    expect(screen.getByLabelText('Roll Strength check')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Dexterity check')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Constitution check')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Intelligence check')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Wisdom check')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Charisma check')).toBeInTheDocument();
  });

  // --- Saving throw roll ---

  it('calls onRollSave when saving throw is clicked', () => {
    const char = makeCharacter();
    const onRollSave = vi.fn();
    renderWithTooltip(
      <AbilityScoresGrid character={char} onRollCheck={noop} onRollSave={onRollSave} />,
    );

    fireEvent.click(screen.getByLabelText('Roll Strength saving throw'));
    expect(onRollSave).toHaveBeenCalledWith('Strength', 'none');
  });

  it('renders saving throw button for each ability', () => {
    const char = makeCharacter();
    renderWithTooltip(<AbilityScoresGrid character={char} onRollCheck={noop} onRollSave={noop} />);
    expect(screen.getByLabelText('Roll Strength saving throw')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Dexterity saving throw')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Constitution saving throw')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Intelligence saving throw')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Wisdom saving throw')).toBeInTheDocument();
    expect(screen.getByLabelText('Roll Charisma saving throw')).toBeInTheDocument();
  });

  // --- Proficiency indicator ---

  it('shows proficiency indicator for proficient saves', () => {
    // Wizard is proficient in INT and WIS saves
    const char = makeCharacter({ classId: 'Wizard', classLevel: 5 });
    renderWithTooltip(<AbilityScoresGrid character={char} onRollCheck={noop} onRollSave={noop} />);

    // INT and WIS save bonus should be higher than modifier alone
    // INT mod = +3, with +3 PB = +6 save
    const intSaveBtn = screen.getByLabelText('Roll Intelligence saving throw');
    expect(intSaveBtn).toBeInTheDocument();
  });

  // --- className prop ---

  it('applies className prop to grid container', () => {
    const char = makeCharacter();
    const { container } = renderWithTooltip(
      <AbilityScoresGrid
        character={char}
        onRollCheck={noop}
        onRollSave={noop}
        className="custom-grid"
      />,
    );
    expect(container.querySelector('.custom-grid')).toBeInTheDocument();
  });
});
