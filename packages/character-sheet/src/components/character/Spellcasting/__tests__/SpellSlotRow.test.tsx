import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpellSlotRow } from '../SpellSlotRow';

describe('SpellSlotRow', () => {
  it('renders "Cantrip" label with infinity symbol and no pips', () => {
    render(<SpellSlotRow level="Cantrip" total={0} used={0} />);
    expect(screen.getByText('Cantrip')).toBeInTheDocument();
    expect(screen.getByText('∞')).toBeInTheDocument();
  });

  it('renders level label and slot count for level 1', () => {
    render(<SpellSlotRow level={1} total={4} used={1} />);
    expect(screen.getByText('1st')).toBeInTheDocument();
    const pips = screen.getAllByRole('button');
    expect(pips).toHaveLength(4);
  });

  it('renders correct used/available pip count', () => {
    render(<SpellSlotRow level={2} total={3} used={2} />);
    const availablePips = screen.getAllByLabelText('Available slot');
    const usedPips = screen.getAllByLabelText('Used slot');
    expect(availablePips).toHaveLength(1);
    expect(usedPips).toHaveLength(2);
  });

  it('renders zero total as empty', () => {
    render(<SpellSlotRow level={5} total={0} used={0} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows "N/M" counter text', () => {
    render(<SpellSlotRow level={3} total={3} used={1} />);
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('handles all-used state', () => {
    render(<SpellSlotRow level={1} total={4} used={4} />);
    expect(screen.getByText('0 / 4')).toBeInTheDocument();
    const usedPips = screen.getAllByLabelText('Used slot');
    expect(usedPips).toHaveLength(4);
  });
});
