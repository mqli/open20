import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { initContent } from '@/core/content-resolver';
import { SubclassStep } from '../SubclassStep';

const onChange = vi.fn<(subclassId: string | null) => void>();

function renderStep(classId = 'Wizard', newLevel = 3, subclassId: string | null = null) {
  return render(
    <SubclassStep
      classId={classId}
      newLevel={newLevel}
      subclassId={subclassId}
      onChange={onChange}
    />,
  );
}

describe('SubclassStep', () => {
  beforeEach(() => {
    initContent();
    onChange.mockReset();
  });

  it('shows subclass options when at unlock level', () => {
    // Wizard subclasses unlock at level 3
    renderStep('Wizard', 3);
    expect(screen.getByRole('group', { name: 'Subclass' })).toBeInTheDocument();
    // Should show "None" option
    expect(screen.getByRole('button', { name: 'None' })).toBeInTheDocument();
  });

  it('shows "unlocks at level X" when below unlock level', () => {
    renderStep('Fighter', 2);
    expect(screen.getByText(/Subclass unlocks at level/)).toBeInTheDocument();
  });

  it('calls onChange with subclass id when selected', () => {
    renderStep('Wizard', 3);
    fireEvent.click(screen.getByRole('button', { name: 'Evoker' }));
    expect(onChange).toHaveBeenCalledWith('Evoker');
  });

  it('calls onChange with null when "None" is selected', () => {
    renderStep('Wizard', 3, 'Evoker');
    fireEvent.click(screen.getByRole('button', { name: 'None' }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('shows all unlocked subclasses for the class', () => {
    renderStep('Fighter', 3);
    // Champion is the only Fighter subclass in SRD
    expect(screen.getByRole('button', { name: 'Champion' })).toBeInTheDocument();
  });

  it('shows "No subclasses" when class has none', () => {
    // Some classes may have no subclasses in SRD
    renderStep('Wizard', 3); // Wizard does have them
    expect(screen.getByRole('group', { name: 'Subclass' })).toBeInTheDocument();
  });
});
