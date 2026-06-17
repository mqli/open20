import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { I18nProvider } from '@open20/ui';
import { ImportWizard } from './ImportWizard';

// Mock the content-manager module
vi.mock('../stores/content-manager', () => ({
  default: {
    loadPack: vi.fn(),
    createPack: vi.fn((meta) => ({ meta, spells: [] })),
    savePack: vi.fn(),
    listPacks: vi.fn(() => Promise.resolve([])),
  },
}));

// Mock the @open20/content/io module
vi.mock('@open20/content/io', () => ({
  parsePackJson: vi.fn(() => ({
    meta: { id: 'imported-pack', name: 'Imported Pack', version: '1.0.0' },
    spells: [],
  })),
  importPack: vi.fn(() => ({
    meta: { id: 'imported-pack', name: 'Imported Pack', version: '1.0.0' },
    spells: [],
  })),
  checkImportConflicts: vi.fn(() => []),
}));

describe('ImportWizard', () => {
  const mockOnClose = vi.fn();

  it('renders import wizard', () => {
    render(
      <I18nProvider>
        <ImportWizard onClose={mockOnClose} />
      </I18nProvider>,
    );
    expect(screen.getByText('Import Content Pack')).toBeInTheDocument();
  });

  it('renders step 1 heading', () => {
    render(
      <I18nProvider>
        <ImportWizard onClose={mockOnClose} />
      </I18nProvider>,
    );
    expect(screen.getByText(/Step 1/)).toBeInTheDocument();
  });
});
