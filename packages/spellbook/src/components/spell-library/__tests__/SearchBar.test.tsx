// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '@/components/spell-library/SearchBar';
import { I18nProvider } from '@open20/ui';
const renderWithI18n = (ui: React.ReactElement) => {
  return render(<I18nProvider>{ui}</I18nProvider>);
};
// Mock the store
vi.mock('../../stores/spell-store', () => ({
  useSpellStore: vi.fn(() => ({
    searchQuery: '',
    setSearchQuery: vi.fn(),
  })),
}));

describe('FR-004: Spell Search', () => {
  it('should render search input with placeholder', () => {
    renderWithI18n(<SearchBar />);
    const input = screen.getByPlaceholderText('searchSpells');
    expect(input).toBeInTheDocument();
  });

  it('should update local query on type', () => {
    renderWithI18n(<SearchBar />);
    const input = screen.getByPlaceholderText('searchSpells');
    fireEvent.change(input, { target: { value: 'fire' } });
    expect(input).toHaveValue('fire');
  });

  it('should show clear button when query is not empty', () => {
    renderWithI18n(<SearchBar />);
    const input = screen.getByPlaceholderText('searchSpells');

    // Initially no clear button
    expect(screen.queryByLabelText('clearSearch')).not.toBeInTheDocument();

    // Type something
    fireEvent.change(input, { target: { value: 'fire' } });
    expect(screen.getByLabelText('clearSearch')).toBeInTheDocument();
  });

  it('should clear query when clear button is clicked', () => {
    renderWithI18n(<SearchBar />);
    const input = screen.getByPlaceholderText('searchSpells');

    fireEvent.change(input, { target: { value: 'fire' } });
    const clearButton = screen.getByLabelText('clearSearch');
    fireEvent.click(clearButton);

    expect(input).toHaveValue('');
  });

  it('should have search icon', () => {
    renderWithI18n(<SearchBar />);
    const searchIcon = document.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });
});
