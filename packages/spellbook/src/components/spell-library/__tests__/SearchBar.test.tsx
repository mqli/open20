// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '@/components/spell-library/SearchBar';

// Mock the store
vi.mock('../../stores/spell-store', () => ({
  useSpellStore: vi.fn(() => ({
    searchQuery: '',
    setSearchQuery: vi.fn(),
  })),
}));

describe('FR-004: Spell Search', () => {
  it('should render search input with placeholder', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Search spells...');
    expect(input).toBeInTheDocument();
  });

  it('should update local query on type', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Search spells...');
    fireEvent.change(input, { target: { value: 'fire' } });
    expect(input).toHaveValue('fire');
  });

  it('should show clear button when query is not empty', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Search spells...');

    // Initially no clear button
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();

    // Type something
    fireEvent.change(input, { target: { value: 'fire' } });
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('should clear query when clear button is clicked', () => {
    render(<SearchBar />);
    const input = screen.getByPlaceholderText('Search spells...');

    fireEvent.change(input, { target: { value: 'fire' } });
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    expect(input).toHaveValue('');
  });

  it('should have search icon', () => {
    render(<SearchBar />);
    const searchIcon = document.querySelector('svg');
    expect(searchIcon).toBeInTheDocument();
  });
});
