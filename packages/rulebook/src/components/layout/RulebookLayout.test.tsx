import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '@open20/ui';
import { RulebookLayout } from './RulebookLayout';

// Mock the packStore for Sidebar
vi.mock('../../stores/packStore', () => ({
  usePackStore: vi.fn((selector) => {
    const state = {
      packs: [],
    };
    return typeof selector === 'function' ? selector(state) : state;
  }),
}));

// Mock Outlet from react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Outlet: () => <div data-testid="outlet">Outlet Content</div>,
  };
});

describe('RulebookLayout', () => {
  it('renders the sidebar and top bar', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <RulebookLayout />
        </I18nProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Rulebook')).toBeInTheDocument();
    expect(screen.getByText('Packs')).toBeInTheDocument();
    expect(screen.getByText('Browse')).toBeInTheDocument();
  });

  it('renders the outlet content area', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <RulebookLayout />
        </I18nProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.getByText('Outlet Content')).toBeInTheDocument();
  });

  it('renders search and settings buttons in TopBar', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <RulebookLayout />
        </I18nProvider>
      </MemoryRouter>,
    );
    expect(screen.getByTitle('Search')).toBeInTheDocument();
    expect(screen.getByTitle('Settings')).toBeInTheDocument();
  });

  it('renders Quick Start Guide in sidebar footer', () => {
    render(
      <MemoryRouter>
        <I18nProvider>
          <RulebookLayout />
        </I18nProvider>
      </MemoryRouter>,
    );
    expect(screen.getByText('Quick Start Guide')).toBeInTheDocument();
  });
});
