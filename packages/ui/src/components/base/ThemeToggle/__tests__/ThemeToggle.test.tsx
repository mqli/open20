import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeToggle } from '..';
import { I18nProvider } from '@/i18n';

describe('ThemeToggle', () => {
  const renderWithI18n = (ui: React.ReactElement) => {
    return render(<I18nProvider>{ui}</I18nProvider>);
  };

  it('should render the toggle button', () => {
    const mockOnToggle = vi.fn();
    renderWithI18n(<ThemeToggle theme="light" onToggle={mockOnToggle} />);
    const toggle = screen.getByRole('button');
    expect(toggle).toBeInTheDocument();
  });

  it('should have accessible label', () => {
    const mockOnToggle = vi.fn();
    renderWithI18n(<ThemeToggle theme="light" onToggle={mockOnToggle} />);
    const toggle = screen.getByRole('button');
    expect(toggle).toHaveAttribute('title');
  });

  it('should call onToggle when clicked', () => {
    const mockOnToggle = vi.fn();
    renderWithI18n(<ThemeToggle theme="light" onToggle={mockOnToggle} />);
    const toggle = screen.getByRole('button');
    toggle.click();
    expect(mockOnToggle).toHaveBeenCalledTimes(1);
  });
});
