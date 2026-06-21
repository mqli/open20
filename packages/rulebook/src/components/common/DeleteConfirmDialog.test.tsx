import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider } from '@open20/ui';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

describe('DeleteConfirmDialog', () => {
  const mockOnConfirm = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when open is false', () => {
    const { container } = render(
      <I18nProvider>
        <DeleteConfirmDialog
          open={false}
          mode="delete-pack"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      </I18nProvider>,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders delete-pack mode with pack name', () => {
    render(
      <I18nProvider>
        <DeleteConfirmDialog
          open
          mode="delete-pack"
          packName="My Homebrew Spells"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      </I18nProvider>,
    );
    expect(screen.getByText('Delete Content Pack')).toBeInTheDocument();
    expect(screen.getByText(/My Homebrew Spells/)).toBeInTheDocument();
    expect(screen.getByText(/This action cannot be undone/)).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('renders delete-content mode with item list', () => {
    render(
      <I18nProvider>
        <DeleteConfirmDialog
          open
          mode="delete-content"
          packName="Spell Pack"
          content={{ items: ['Acid Rain', 'Fireball', 'Frost Bolt'] }}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      </I18nProvider>,
    );
    expect(screen.getByText('Delete Content')).toBeInTheDocument();
    expect(screen.getByText('Acid Rain')).toBeInTheDocument();
    expect(screen.getByText('Fireball')).toBeInTheDocument();
    expect(screen.getByText('Frost Bolt')).toBeInTheDocument();
  });

  it('renders disable-pack mode with content summary', () => {
    render(
      <I18nProvider>
        <DeleteConfirmDialog
          open
          mode="disable-pack"
          packName="My Module"
          contentSummary={{ Spells: 391, Monsters: 3, Species: 9 }}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      </I18nProvider>,
    );
    expect(screen.getByText('Disable Content Pack')).toBeInTheDocument();
    expect(screen.getByText('Disable')).toBeInTheDocument();
    expect(screen.getByText('Spells: 391')).toBeInTheDocument();
    expect(screen.getByText('Monsters: 3')).toBeInTheDocument();
  });

  it('renders discard-changes mode', () => {
    render(
      <I18nProvider>
        <DeleteConfirmDialog
          open
          mode="discard-changes"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      </I18nProvider>,
    );
    expect(screen.getByText('Discard Changes')).toBeInTheDocument();
    expect(screen.getByText('Discard')).toBeInTheDocument();
    expect(screen.getByText(/You have unsaved changes/)).toBeInTheDocument();
  });

  it('calls onConfirm when confirm button is clicked', () => {
    render(
      <I18nProvider>
        <DeleteConfirmDialog
          open
          mode="delete-pack"
          packName="Test"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByText('Delete'));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <I18nProvider>
        <DeleteConfirmDialog
          open
          mode="delete-pack"
          packName="Test"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when backdrop is clicked', () => {
    render(
      <I18nProvider>
        <DeleteConfirmDialog
          open
          mode="delete-pack"
          packName="Test"
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('shows more than 5 items with +N more', () => {
    const items = Array.from({ length: 8 }, (_, i) => `Item ${i + 1}`);
    render(
      <I18nProvider>
        <DeleteConfirmDialog
          open
          mode="delete-content"
          content={{ items }}
          onConfirm={mockOnConfirm}
          onCancel={mockOnCancel}
        />
      </I18nProvider>,
    );
    expect(screen.getByText('+3 more')).toBeInTheDocument();
  });
});
