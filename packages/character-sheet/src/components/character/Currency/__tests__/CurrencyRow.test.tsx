// CurrencyRow.test.tsx — T-204

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CurrencyRow } from '../CurrencyRow';
import type { Currency } from 'open20-core';
import { initContent } from '@/core/content-resolver';

function makeCurrency(overrides?: Partial<Currency>): Currency {
  return { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0, ...overrides };
}

describe('CurrencyRow', () => {
  beforeEach(() => {
    initContent();
  });

  // --- Rendering ---

  it('renders all 5 denomination columns', () => {
    const currency = makeCurrency();
    render(<CurrencyRow currency={currency} onModify={() => {}} />);
    expect(screen.getByText('CP')).toBeInTheDocument();
    expect(screen.getByText('SP')).toBeInTheDocument();
    expect(screen.getByText('EP')).toBeInTheDocument();
    expect(screen.getByText('GP')).toBeInTheDocument();
    expect(screen.getByText('PP')).toBeInTheDocument();
  });

  it('displays correct amounts from currency prop', () => {
    const currency = makeCurrency({ cp: 42, sp: 15, ep: 7, gp: 100, pp: 3 });
    render(<CurrencyRow currency={currency} onModify={() => {}} />);
    // Each amount is rendered as text. All 5 values should appear.
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders all zero balances correctly', () => {
    const currency = makeCurrency();
    render(<CurrencyRow currency={currency} onModify={() => {}} />);
    // Five zeroes should be present
    const zeroes = screen.getAllByText('0');
    expect(zeroes).toHaveLength(5);
  });

  // --- Stepper callbacks ---

  it('calls onModify with +1 cp when [+] is clicked', () => {
    const onModify = vi.fn();
    const currency = makeCurrency();
    render(<CurrencyRow currency={currency} onModify={onModify} />);

    fireEvent.click(screen.getByRole('button', { name: 'Add 1 CP' }));
    expect(onModify).toHaveBeenCalledWith({ cp: 1 });
  });

  it('calls onModify with -1 cp when [-] is clicked', () => {
    const onModify = vi.fn();
    const currency = makeCurrency({ cp: 5 });
    render(<CurrencyRow currency={currency} onModify={onModify} />);

    fireEvent.click(screen.getByRole('button', { name: 'Spend 1 CP' }));
    expect(onModify).toHaveBeenCalledWith({ cp: -1 });
  });

  it('calls onModify with correct deltas for all 5 denominations', () => {
    const onModify = vi.fn();
    const currency = makeCurrency({ cp: 1, sp: 1, ep: 1, gp: 1, pp: 1 });
    render(<CurrencyRow currency={currency} onModify={onModify} />);

    const labels = ['CP', 'SP', 'EP', 'GP', 'PP'] as const;
    for (const label of labels) {
      fireEvent.click(screen.getByRole('button', { name: `Add 1 ${label}` }));
    }
    expect(onModify).toHaveBeenCalledTimes(5);
    expect(onModify).toHaveBeenNthCalledWith(1, { cp: 1 });
    expect(onModify).toHaveBeenNthCalledWith(2, { sp: 1 });
    expect(onModify).toHaveBeenNthCalledWith(3, { ep: 1 });
    expect(onModify).toHaveBeenNthCalledWith(4, { gp: 1 });
    expect(onModify).toHaveBeenNthCalledWith(5, { pp: 1 });
  });

  // --- Accessibility ---

  it('has aria-labels on all stepper buttons', () => {
    const currency = makeCurrency();
    render(<CurrencyRow currency={currency} onModify={() => {}} />);

    const labels = ['CP', 'SP', 'EP', 'GP', 'PP'] as const;
    for (const label of labels) {
      expect(screen.getByRole('button', { name: `Add 1 ${label}` })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: `Spend 1 ${label}` })).toBeInTheDocument();
    }
  });

  it('buttons meet NFR-02 (>=44px touch targets)', () => {
    const currency = makeCurrency();
    render(<CurrencyRow currency={currency} onModify={() => {}} />);

    const addCp = screen.getByRole('button', { name: 'Add 1 CP' });
    expect(addCp.className).toContain('min-h-[44px]');
    expect(addCp.className).toContain('min-w-[44px]');

    const subCp = screen.getByRole('button', { name: 'Spend 1 CP' });
    expect(subCp.className).toContain('min-h-[44px]');
    expect(subCp.className).toContain('min-w-[44px]');
  });

  // --- Edge cases ---

  it('handles large amounts gracefully', () => {
    const currency = makeCurrency({ gp: 9999, cp: 1234567 });
    render(<CurrencyRow currency={currency} onModify={() => {}} />);
    expect(screen.getByText('9999')).toBeInTheDocument();
    expect(screen.getByText('1234567')).toBeInTheDocument();
  });

  it('applies className prop', () => {
    const currency = makeCurrency();
    const { container } = render(
      <CurrencyRow currency={currency} onModify={() => {}} className="custom-row" />,
    );
    // className is passed to Surface, which wraps in a div
    const surface = container.querySelector('[class*="custom-row"]');
    expect(surface).toBeInTheDocument();
  });
});
