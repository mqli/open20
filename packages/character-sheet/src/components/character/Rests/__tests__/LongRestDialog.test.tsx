// LongRestDialog.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, defaultTranslations } from '@open20/ui';
import { LongRestDialog } from '../LongRestDialog';

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
      {ui}
    </I18nProvider>,
  );
}

describe('LongRestDialog', () => {
  it('renders all recovery checklist items', () => {
    renderWithI18n(<LongRestDialog open={true} onOpenChange={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.getByText('Restore all HP to maximum')).toBeInTheDocument();
    expect(screen.getByText('Recover all hit dice')).toBeInTheDocument();
    expect(screen.getByText('Recover all spell slots')).toBeInTheDocument();
    expect(screen.getByText('Reset death saving throws')).toBeInTheDocument();
    expect(screen.getByText('Reset once-per-rest abilities')).toBeInTheDocument();
    expect(screen.getByText('Remove all conditions')).toBeInTheDocument();
    expect(screen.getByText('End concentration')).toBeInTheDocument();
  });

  it('calls onConfirm and closes dialog on "Long Rest" button click', () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();

    renderWithI18n(
      <LongRestDialog open={true} onOpenChange={onOpenChange} onConfirm={onConfirm} />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Confirm long rest' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('each checklist item has a non-color icon (NFR-01)', () => {
    renderWithI18n(<LongRestDialog open={true} onOpenChange={vi.fn()} onConfirm={vi.fn()} />);

    const listItems = screen
      .getAllByRole('listitem')
      .filter((li) => li.closest('ul') === screen.getByRole('list'));

    // All 7 items should have an SVG icon (lucide icons)
    for (const item of listItems) {
      const svg = item.querySelector('svg');
      expect(svg).not.toBeNull();
      expect(svg!.getAttribute('aria-hidden')).toBe('true');
    }
  });
});
