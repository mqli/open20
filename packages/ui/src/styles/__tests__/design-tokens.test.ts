import { describe, it, expect } from 'vitest';
import { interactiveBase } from '../design-tokens';

describe('interactive', () => {
  it('includes focus ring classes', () => {
    expect(interactiveBase).toContain('focus:outline-none');
    expect(interactiveBase).toContain('focus:ring-2');
    expect(interactiveBase).toContain('focus:ring-primary-400');
  });

  it('includes disabled state classes', () => {
    expect(interactiveBase).toContain('disabled:cursor-not-allowed');
    expect(interactiveBase).toContain('disabled:opacity-50');
  });

  it('includes transition classes', () => {
    expect(interactiveBase).toContain('transition-all');
    expect(interactiveBase).toContain('duration-200');
  });
});
