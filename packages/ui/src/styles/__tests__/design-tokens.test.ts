import { describe, it, expect } from 'vitest';
import { interactiveBase, cantripBadgeVariants } from '../design-tokens';

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

describe('cantripBadgeVariants', () => {
  it('has true key with emerald colors', () => {
    expect(cantripBadgeVariants.true).toContain('bg-emerald-500/15');
    expect(cantripBadgeVariants.true).toContain('text-emerald-600');
    expect(cantripBadgeVariants.true).toContain('dark:text-emerald-400');
  });

  it('has false key with primary colors', () => {
    expect(cantripBadgeVariants.false).toContain('bg-primary-500/15');
    expect(cantripBadgeVariants.false).toContain('text-primary-600');
    expect(cantripBadgeVariants.false).toContain('dark:text-primary-400');
  });
});
