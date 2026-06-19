import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider } from '@open20/ui';
import { CreatePackWizard } from './CreatePackWizard';

// Mock the packStore
vi.mock('../stores/packStore', () => ({
  usePackStore: vi.fn((selector) => {
    const state = {
      createAndSavePack: vi.fn(() => Promise.resolve()),
    };
    return typeof selector === 'function' ? selector(state) : state;
  }),
}));

describe('CreatePackWizard', () => {
  const mockOnClose = vi.fn();

  it('renders the wizard title', () => {
    render(
      <I18nProvider>
        <CreatePackWizard onClose={mockOnClose} />
      </I18nProvider>,
    );
    expect(screen.getByText('Create New Content Pack')).toBeInTheDocument();
  });

  it('renders step indicator', () => {
    render(
      <I18nProvider>
        <CreatePackWizard onClose={mockOnClose} />
      </I18nProvider>,
    );
    expect(screen.getByText(/Step 1 of 2/)).toBeInTheDocument();
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
  });

  it('renders form fields in step 1', () => {
    render(
      <I18nProvider>
        <CreatePackWizard onClose={mockOnClose} />
      </I18nProvider>,
    );
    expect(screen.getByText('Pack ID *')).toBeInTheDocument();
    expect(screen.getByText('Pack Name *')).toBeInTheDocument();
    expect(screen.getByText('Version')).toBeInTheDocument();
    expect(screen.getByText('Author')).toBeInTheDocument();
    expect(screen.getByText('Description (optional)')).toBeInTheDocument();
  });

  it('has Next button disabled when fields are empty', () => {
    render(
      <I18nProvider>
        <CreatePackWizard onClose={mockOnClose} />
      </I18nProvider>,
    );
    const nextButton = screen.getByText('Next →');
    expect(nextButton).toBeDisabled();
  });

  it('moves to step 2 when Next is clicked after filling required fields', () => {
    render(
      <I18nProvider>
        <CreatePackWizard onClose={mockOnClose} />
      </I18nProvider>,
    );

    const packIdInput = screen.getByPlaceholderText('my-homebrew');
    const packNameInput = screen.getByPlaceholderText('My Homebrew Spells');

    fireEvent.change(packIdInput, { target: { value: 'my-pack' } });
    fireEvent.change(packNameInput, { target: { value: 'My Pack' } });

    const nextButton = screen.getByText('Next →');
    expect(nextButton).not.toBeDisabled();

    fireEvent.click(nextButton);

    expect(screen.getByText(/Step 2 of 2/)).toBeInTheDocument();
    expect(screen.getByText('Confirm & Create')).toBeInTheDocument();
  });

  it('shows confirmation details in step 2', () => {
    render(
      <I18nProvider>
        <CreatePackWizard onClose={mockOnClose} />
      </I18nProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText('my-homebrew'), { target: { value: 'my-pack' } });
    fireEvent.change(screen.getByPlaceholderText('My Homebrew Spells'), {
      target: { value: 'My Pack' },
    });
    fireEvent.click(screen.getByText('Next →'));

    expect(screen.getByText('Confirm Pack Details')).toBeInTheDocument();
    // The confirm step shows the entered values (ID: my-pack, Name: My Pack)
    // These appear in <strong> tags
    const strongElements = screen.getAllByText(/my-pack|My Pack/);
    expect(strongElements.length).toBeGreaterThanOrEqual(2);
  });

  it('has Create Pack button in step 2', () => {
    render(
      <I18nProvider>
        <CreatePackWizard onClose={mockOnClose} />
      </I18nProvider>,
    );

    fireEvent.change(screen.getByPlaceholderText('my-homebrew'), { target: { value: 'my-pack' } });
    fireEvent.change(screen.getByPlaceholderText('My Homebrew Spells'), {
      target: { value: 'My Pack' },
    });
    fireEvent.click(screen.getByText('Next →'));

    expect(screen.getByText('Create Pack')).toBeInTheDocument();
  });

  it('calls onClose when Cancel is clicked', () => {
    render(
      <I18nProvider>
        <CreatePackWizard onClose={mockOnClose} />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
