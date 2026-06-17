import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider } from '@open20/ui';
import { PackCard } from './PackCard';

// Mock the packStore
vi.mock('../stores/packStore', () => ({
  usePackStore: vi.fn((selector) => {
    const state = {
      isPackEnabled: vi.fn((_id: string) => true),
      togglePackEnabled: vi.fn(),
      deletePackAndStorage: vi.fn(),
    };
    return typeof selector === 'function' ? selector(state) : state;
  }),
}));

const defaultPack = {
  id: 'test-pack',
  name: 'Test Pack',
  version: '1.0.0',
  source: 'Homebrew',
};

describe('PackCard', () => {
  const mockOnOpen = vi.fn();
  const mockOnExport = vi.fn();

  it('renders pack name', () => {
    render(
      <I18nProvider>
        <PackCard pack={defaultPack} spellCount={5} onOpen={mockOnOpen} onExport={mockOnExport} />
      </I18nProvider>,
    );
    expect(screen.getByText('Test Pack')).toBeInTheDocument();
  });

  it('renders version and source', () => {
    render(
      <I18nProvider>
        <PackCard pack={defaultPack} spellCount={5} onOpen={mockOnOpen} onExport={mockOnExport} />
      </I18nProvider>,
    );
    expect(screen.getByText(/v1\.0\.0/)).toBeInTheDocument();
    expect(screen.getByText(/Homebrew/)).toBeInTheDocument();
  });

  it('renders spell count', () => {
    render(
      <I18nProvider>
        <PackCard pack={defaultPack} spellCount={12} onOpen={mockOnOpen} onExport={mockOnExport} />
      </I18nProvider>,
    );
    expect(screen.getByText(/12 spells/)).toBeInTheDocument();
  });

  it('renders Open, Export, and Disable buttons', () => {
    render(
      <I18nProvider>
        <PackCard pack={defaultPack} spellCount={5} onOpen={mockOnOpen} onExport={mockOnExport} />
      </I18nProvider>,
    );
    expect(screen.getByText('Open')).toBeInTheDocument();
    expect(screen.getByText('Export')).toBeInTheDocument();
    expect(screen.getByText('Disable')).toBeInTheDocument();
  });

  it('calls onOpen when Open button is clicked', () => {
    render(
      <I18nProvider>
        <PackCard pack={defaultPack} spellCount={5} onOpen={mockOnOpen} onExport={mockOnExport} />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByText('Open'));
    expect(mockOnOpen).toHaveBeenCalledTimes(1);
  });

  it('calls onExport when Export button is clicked', () => {
    render(
      <I18nProvider>
        <PackCard pack={defaultPack} spellCount={5} onOpen={mockOnOpen} onExport={mockOnExport} />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByText('Export'));
    expect(mockOnExport).toHaveBeenCalledTimes(1);
  });

  it('shows Built-in badge when isBuiltIn is true', () => {
    render(
      <I18nProvider>
        <PackCard
          pack={defaultPack}
          spellCount={5}
          isBuiltIn={true}
          onOpen={mockOnOpen}
          onExport={mockOnExport}
        />
      </I18nProvider>,
    );
    expect(screen.getByText('Built-in')).toBeInTheDocument();
  });

  it('does not show Delete button for built-in packs', () => {
    render(
      <I18nProvider>
        <PackCard
          pack={defaultPack}
          spellCount={5}
          isBuiltIn={true}
          onOpen={mockOnOpen}
          onExport={mockOnExport}
        />
      </I18nProvider>,
    );
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('shows Delete button for non-built-in packs', () => {
    render(
      <I18nProvider>
        <PackCard pack={defaultPack} spellCount={5} onOpen={mockOnOpen} onExport={mockOnExport} />
      </I18nProvider>,
    );
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
