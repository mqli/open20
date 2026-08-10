// CurrencyRow.test.tsx — T-204

import { describe, it, expect, vi, beforeEach } from 'vitest';
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

  it('renders 5 labelled number inputs', () => {
    const currency = makeCurrency();
    render(<CurrencyRow currency={currency} onModify={() => {}} />);

    for (const label of ['CP amount', 'SP amount', 'EP amount', 'GP amount', 'PP amount']) {
      const input = screen.getByRole('spinbutton', { name: label });
      expect(input).toBeInTheDocument();
    }
  });

  it('renders denomination labels', () => {
    const currency = makeCurrency();
    render(<CurrencyRow currency={currency} onModify={() => {}} />);
    expect(screen.getByText('CP')).toBeInTheDocument();
    expect(screen.getByText('SP')).toBeInTheDocument();
    expect(screen.getByText('EP')).toBeInTheDocument();
    expect(screen.getByText('GP')).toBeInTheDocument();
    expect(screen.getByText('PP')).toBeInTheDocument();
  });

  it('displays correct initial values', () => {
    const currency = makeCurrency({ cp: 42, sp: 15, gp: 100, pp: 3 });
    render(<CurrencyRow currency={currency} onModify={() => {}} />);

    expect(screen.getByRole('spinbutton', { name: 'CP amount' })).toHaveValue(42);
    expect(screen.getByRole('spinbutton', { name: 'SP amount' })).toHaveValue(15);
    expect(screen.getByRole('spinbutton', { name: 'EP amount' })).toHaveValue(0);
    expect(screen.getByRole('spinbutton', { name: 'GP amount' })).toHaveValue(100);
    expect(screen.getByRole('spinbutton', { name: 'PP amount' })).toHaveValue(3);
  });

  it('shows all zeroes when currency is empty', () => {
    const currency = makeCurrency();
    render(<CurrencyRow currency={currency} onModify={() => {}} />);
    for (const label of ['CP amount', 'SP amount', 'EP amount', 'GP amount', 'PP amount']) {
      expect(screen.getByRole('spinbutton', { name: label })).toHaveValue(0);
    }
  });

  // --- Blur commits delta ---

  it('commits a delta on blur when value changed', () => {
    const onModify = vi.fn();
    const currency = makeCurrency({ gp: 100 });
    render(<CurrencyRow currency={currency} onModify={onModify} />);

    const input = screen.getByRole('spinbutton', { name: 'GP amount' });
    fireEvent.change(input, { target: { value: '250' } });
    fireEvent.blur(input);

    expect(onModify).toHaveBeenCalledWith({ gp: 150 });
  });

  it('commits a negative delta when value is decreased', () => {
    const onModify = vi.fn();
    const currency = makeCurrency({ gp: 100 });
    render(<CurrencyRow currency={currency} onModify={onModify} />);

    const input = screen.getByRole('spinbutton', { name: 'GP amount' });
    fireEvent.change(input, { target: { value: '30' } });
    fireEvent.blur(input);

    expect(onModify).toHaveBeenCalledWith({ gp: -70 });
  });

  it('does not commit if value is unchanged', () => {
    const onModify = vi.fn();
    const currency = makeCurrency({ gp: 100 });
    render(<CurrencyRow currency={currency} onModify={onModify} />);

    const input = screen.getByRole('spinbutton', { name: 'GP amount' });
    fireEvent.blur(input); // no change

    expect(onModify).not.toHaveBeenCalled();
  });

  it('reverts to original value on invalid input (NaN)', () => {
    const onModify = vi.fn();
    const currency = makeCurrency({ gp: 100 });
    render(<CurrencyRow currency={currency} onModify={onModify} />);

    const input = screen.getByRole('spinbutton', { name: 'GP amount' });
    fireEvent.change(input, { target: { value: 'abc' } });
    fireEvent.blur(input);

    expect(onModify).not.toHaveBeenCalled();
    expect(input).toHaveValue(100);
  });

  it('reverts to original value on negative input', () => {
    const onModify = vi.fn();
    const currency = makeCurrency({ gp: 100 });
    render(<CurrencyRow currency={currency} onModify={onModify} />);

    const input = screen.getByRole('spinbutton', { name: 'GP amount' });
    fireEvent.change(input, { target: { value: '-5' } });
    fireEvent.blur(input);

    expect(onModify).not.toHaveBeenCalled();
    expect(input).toHaveValue(100);
  });

  it('commits on Enter key (triggers blur)', () => {
    const onModify = vi.fn();
    const currency = makeCurrency({ cp: 10 });
    render(<CurrencyRow currency={currency} onModify={onModify} />);

    const input = screen.getByRole('spinbutton', { name: 'CP amount' });
    fireEvent.change(input, { target: { value: '99' } });
    // Enter triggers blur, which fires commit
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.blur(input);

    expect(onModify).toHaveBeenCalledWith({ cp: 89 });
  });

  it('accepts zero as a valid value', () => {
    const onModify = vi.fn();
    const currency = makeCurrency({ gp: 100 });
    render(<CurrencyRow currency={currency} onModify={onModify} />);

    const input = screen.getByRole('spinbutton', { name: 'GP amount' });
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.blur(input);

    expect(onModify).toHaveBeenCalledWith({ gp: -100 });
  });

  it('can modify all 5 denominations independently', () => {
    const onModify = vi.fn();
    const currency = makeCurrency();
    render(<CurrencyRow currency={currency} onModify={onModify} />);

    const labels = ['CP amount', 'SP amount', 'EP amount', 'GP amount', 'PP amount'] as const;
    for (const label of labels) {
      const input = screen.getByRole('spinbutton', { name: label });
      fireEvent.change(input, { target: { value: '7' } });
      fireEvent.blur(input);
    }

    expect(onModify).toHaveBeenCalledTimes(5);
    expect(onModify).toHaveBeenNthCalledWith(1, { cp: 7 });
    expect(onModify).toHaveBeenNthCalledWith(2, { sp: 7 });
    expect(onModify).toHaveBeenNthCalledWith(3, { ep: 7 });
    expect(onModify).toHaveBeenNthCalledWith(4, { gp: 7 });
    expect(onModify).toHaveBeenNthCalledWith(5, { pp: 7 });
  });

  it('syncs input value when upstream currency changes', () => {
    const onModify = vi.fn();
    const { rerender } = render(
      <CurrencyRow currency={makeCurrency({ cp: 5 })} onModify={onModify} />,
    );

    const inputA = screen.getByRole('spinbutton', { name: 'CP amount' });
    expect(inputA).toHaveValue(5);

    // Simulate store update — key={value} causes remount with new defaultValue
    rerender(<CurrencyRow currency={makeCurrency({ cp: 42 })} onModify={onModify} />);

    const inputB = screen.getByRole('spinbutton', { name: 'CP amount' });
    expect(inputB).toHaveValue(42);
  });

  // --- Accessibility ---

  it('inputs have min-h-[44px] for touch target', () => {
    const currency = makeCurrency();
    render(<CurrencyRow currency={currency} onModify={() => {}} />);

    const input = screen.getByRole('spinbutton', { name: 'GP amount' });
    expect(input.className).toContain('min-h-[44px]');
  });

  it('applies className prop', () => {
    const currency = makeCurrency();
    const { container } = render(
      <CurrencyRow currency={currency} onModify={() => {}} className="custom-row" />,
    );
    const surface = container.querySelector('[class*="custom-row"]');
    expect(surface).toBeInTheDocument();
  });
});
