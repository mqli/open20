import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@open20/ui';
import { ExportDialog } from './ExportDialog';

// Mock the content-manager module
vi.mock('../../stores/contentManager', () => ({
  default: {
    loadPack: vi.fn(() =>
      Promise.resolve({
        meta: { id: 'test-pack', name: 'Test Pack', version: '1.0.0' },
        spells: [],
      }),
    ),
  },
}));

// Mock the @open20/content/io module
vi.mock('@open20/content/io', () => ({
  exportPack: vi.fn(() => JSON.stringify({ meta: { id: 'test-pack', name: 'Test Pack' } })),
}));

describe('ExportDialog', () => {
  const mockOnClose = vi.fn();

  it('renders export dialog', () => {
    render(
      <I18nProvider>
        <ExportDialog packId="test-pack" packName="Test Pack" onClose={mockOnClose} />
      </I18nProvider>,
    );
    expect(screen.getByText('Export Content Pack')).toBeInTheDocument();
  });

  it('renders pack name', () => {
    render(
      <I18nProvider>
        <ExportDialog packId="test-pack" packName="Test Pack" onClose={mockOnClose} />
      </I18nProvider>,
    );
    expect(screen.getByText(/Test Pack/)).toBeInTheDocument();
  });
});
