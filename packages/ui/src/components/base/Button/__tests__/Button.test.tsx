import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  describe('interactiveBase classes', () => {
    it('applies focus ring classes', () => {
      render(<Button>Click me</Button>);
      const btn = screen.getByRole('button');
      expect(btn.className).toContain('focus:outline-none');
      expect(btn.className).toContain('focus:ring-2');
      expect(btn.className).toContain('focus:ring-primary-400');
    });

    it('applies Button-specific focus ring offset classes', () => {
      render(<Button>Click me</Button>);
      const btn = screen.getByRole('button');
      expect(btn.className).toContain('focus:ring-offset-2');
      expect(btn.className).toContain('focus:ring-offset-bg-primary');
    });

    it('applies disabled state classes', () => {
      render(<Button disabled>Click me</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
      expect(btn.className).toContain('disabled:cursor-not-allowed');
      expect(btn.className).toContain('disabled:opacity-50');
    });

    it('applies transition classes', () => {
      render(<Button>Click me</Button>);
      const btn = screen.getByRole('button');
      expect(btn.className).toContain('transition-all');
      expect(btn.className).toContain('duration-200');
    });
  });

  describe('rendering', () => {
    it('renders children correctly', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('renders as button element', () => {
      render(<Button>Click me</Button>);
      const btn = screen.getByRole('button');
      expect(btn.tagName).toBe('BUTTON');
    });

    it('applies base button classes', () => {
      render(<Button>Click me</Button>);
      const btn = screen.getByRole('button');
      expect(btn.className).toContain('inline-flex');
      expect(btn.className).toContain('items-center');
      expect(btn.className).toContain('justify-center');
      expect(btn.className).toContain('rounded-md');
      expect(btn.className).toContain('font-medium');
    });
  });

  describe('variants', () => {
    it('applies primary variant by default', () => {
      render(<Button>Click me</Button>);
      const btn = screen.getByRole('button');
      expect(btn.className).toContain('bg-primary-600');
    });

    it('applies different variants correctly', () => {
      const { rerender } = render(<Button variant="secondary">Click me</Button>);
      let btn = screen.getByRole('button');
      expect(btn.className).toContain('bg-bg-tertiary');

      rerender(<Button variant="outline">Click me</Button>);
      btn = screen.getByRole('button');
      expect(btn.className).toContain('bg-transparent');
    });

    it('applies different sizes correctly', () => {
      const { rerender } = render(<Button size="sm">Click me</Button>);
      let btn = screen.getByRole('button');
      expect(btn.className).toContain('px-2');
      expect(btn.className).toContain('py-1');

      rerender(<Button size="lg">Click me</Button>);
      btn = screen.getByRole('button');
      expect(btn.className).toContain('px-6');
      expect(btn.className).toContain('py-3');
    });
  });
});
