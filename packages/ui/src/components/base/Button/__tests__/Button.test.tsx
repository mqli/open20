import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('applies interactiveBase classes (focus ring, disabled state)', () => {
    render(<Button>Click me</Button>);
    const btn = screen.getByRole('button');
    expect(btn.className).toContain('focus:outline-none');
    expect(btn.className).toContain('disabled:cursor-not-allowed');
  });
});
