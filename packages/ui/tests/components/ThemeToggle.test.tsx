import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeToggle } from '../../src/components/ThemeToggle';

describe('ThemeToggle', () => {
  it('should render the toggle button', () => {
    const mockOnToggle = vi.fn();
    render(<ThemeToggle theme="light" onToggle={mockOnToggle} />);
    const toggle = screen.getByRole('button');
    expect(toggle).toBeInTheDocument();
  });

  it('should have accessible label', () => {
    const mockOnToggle = vi.fn();
    render(<ThemeToggle theme="light" onToggle={mockOnToggle} />);
    const toggle = screen.getByRole('button');
    expect(toggle).toHaveAttribute('title');
  });

  it('should call onToggle when clicked', () => {
    const mockOnToggle = vi.fn();
    render(<ThemeToggle theme="light" onToggle={mockOnToggle} />);
    const toggle = screen.getByRole('button');
    toggle.click();
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });
});
