import { describe, it, expect } from 'vitest';
import {
  chipBase,
  inlineMeta,
  sectionDivider,
  collapseToggle,
  iconSizes,
} from '../component-styles';

describe('component-styles', () => {
  it('exports chipBase with rounded-md and text-[11px]', () => {
    expect(chipBase).toContain('rounded-md');
    expect(chipBase).toContain('text-[11px]');
  });

  it('exports iconSizes with xs/sm/md keys', () => {
    expect(iconSizes.xs).toBe('h-3 w-3');
    expect(iconSizes.sm).toBe('h-3.5 w-3.5');
    expect(iconSizes.md).toBe('h-4 w-4');
  });

  it('exports sectionDivider with border-t', () => {
    expect(sectionDivider).toContain('border-t');
  });

  it('exports collapseToggle with hover classes', () => {
    expect(collapseToggle).toContain('hover:text-text-secondary');
  });

  it('exports inlineMeta with gap-1', () => {
    expect(inlineMeta).toContain('gap-1');
  });
});
