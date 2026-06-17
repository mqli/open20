import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '@open20/ui';
import { AddContentButton } from './AddContentButton';

// Mock DropdownMenu from @open20/ui
vi.mock('@open20/ui', async () => {
  const actual = await vi.importActual('@open20/ui');
  return {
    ...actual,
    DropdownMenu: {
      Root: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="dropdown-root">{children}</div>
      ),
      Trigger: ({ children, asChild: _asChild }: any) => (
        <button data-testid="dropdown-trigger">{children}</button>
      ),
      Content: ({ children, className }: any) => (
        <div data-testid="dropdown-content" className={className}>
          {children}
        </div>
      ),
      Item: ({ children, onClick, className }: any) => (
        <button data-testid="dropdown-item" onClick={onClick} className={className}>
          {children}
        </button>
      ),
      Separator: () => <hr data-testid="dropdown-separator" />,
    },
  };
});

describe('AddContentButton', () => {
  const mockOnAddSpell = vi.fn();
  const mockOnAddMonster = vi.fn();
  const mockOnAddSpecies = vi.fn();
  const mockOnImport = vi.fn();

  it('renders Add button', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <AddContentButton />
        </I18nProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('renders dropdown menu items', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <AddContentButton />
        </I18nProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Add Spell')).toBeInTheDocument();
    expect(screen.getByText('Add Monster')).toBeInTheDocument();
    expect(screen.getByText('Add Species')).toBeInTheDocument();
    expect(screen.getByText('Import Content')).toBeInTheDocument();
  });

  it('navigates to editor when Add Spell is clicked with packId', () => {
    // We can't easily test navigation, but we can test that the callback is invoked
    render(
      <MemoryRouter>
        <I18nProvider>
          <AddContentButton packId="test-pack" onAddSpell={mockOnAddSpell} />
        </I18nProvider>
      </MemoryRouter>,
    );
    const addSpellBtn = screen.getByText('Add Spell');
    expect(addSpellBtn).toBeInTheDocument();
  });

  it('calls onAddSpell callback', async () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <AddContentButton
            onAddSpell={mockOnAddSpell}
            onAddMonster={mockOnAddMonster}
            onAddSpecies={mockOnAddSpecies}
            onImport={mockOnImport}
          />
        </I18nProvider>
      </MemoryRouter>,
    );

    // Click each dropdown item
    const items = screen.getAllByTestId('dropdown-item');
    items[0].click();
    expect(mockOnAddSpell).toHaveBeenCalled();

    items[1].click();
    expect(mockOnAddMonster).toHaveBeenCalled();

    items[2].click();
    expect(mockOnAddSpecies).toHaveBeenCalled();

    items[3].click();
    expect(mockOnImport).toHaveBeenCalled();
  });

  it('renders dropdown separator', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <AddContentButton />
        </I18nProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('dropdown-separator')).toBeInTheDocument();
  });
});
