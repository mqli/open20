import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { initContent } from '@/core/content-resolver';
import { makeCharacter } from '@/test/fixtures';
import { ClassStep } from '../ClassStep';

const onChange = vi.fn<(classId: string, isNewClass: boolean) => void>();

function renderStep(character = makeCharacter(), classId = '') {
  return render(<ClassStep character={character} classId={classId} onChange={onChange} />);
}

describe('ClassStep', () => {
  beforeEach(() => {
    initContent();
    onChange.mockReset();
  });

  it('renders class options in a radio group', () => {
    renderStep();
    expect(screen.getByRole('group', { name: 'Choose a class to advance' })).toBeInTheDocument();
  });

  it('shows existing classes with level and hit die in sublabel', () => {
    // Default fixture is Level-5 High Elf Wizard.
    renderStep();
    const wizardBtn = screen.getByRole('button', { name: 'Wizard' });
    expect(wizardBtn).toBeInTheDocument();
    expect(screen.getByText(/Level 5 · d/)).toBeInTheDocument();
  });

  it('shows non-existing classes with "New class" sublabel', () => {
    // Character is a Wizard — Fighter should be available as new class.
    renderStep();
    const fighterBtn = screen.getByRole('button', { name: 'Fighter' });
    expect(fighterBtn).toBeInTheDocument();
    expect(fighterBtn).toHaveAttribute('aria-describedby');
    // At least one non-existing class shows "New class" sublabel.
    expect(screen.getAllByText(/New class · d/).length).toBeGreaterThan(0);
  });

  it('calls onChange with classId and isNewClass=false when selecting existing class', () => {
    renderStep();
    fireEvent.click(screen.getByRole('button', { name: 'Wizard' }));
    expect(onChange).toHaveBeenCalledWith('Wizard', false);
  });

  it('calls onChange with classId and isNewClass=true when selecting new class', () => {
    renderStep();
    fireEvent.click(screen.getByRole('button', { name: 'Fighter' }));
    expect(onChange).toHaveBeenCalledWith('Fighter', true);
  });

  it('shows the selected class with aria-pressed', () => {
    renderStep(makeCharacter(), 'Wizard');
    expect(screen.getByRole('button', { name: 'Wizard' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('lists existing classes first in the grid', () => {
    renderStep();
    const buttons = screen.getAllByRole('button');
    // The first button (existing classes first) should be the character's own class
    const firstBtn = buttons[0]! as HTMLElement;
    expect(firstBtn.getAttribute('aria-label')).toBe('Wizard');
  });
});
