import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HpBar } from '../HpBar';

describe('HpBar', () => {
  it('renders current/max and temp HP', () => {
    render(<HpBar current={34} max={45} temporary={10} onAdjust={() => {}} />);
    expect(screen.getByText('34 / 45')).toBeInTheDocument();
    expect(screen.getByText('+10 Temp')).toBeInTheDocument();
  });

  it('calls onAdjust with the button delta', () => {
    const onAdjust = vi.fn();
    render(<HpBar current={34} max={45} temporary={0} onAdjust={onAdjust} />);
    fireEvent.click(screen.getByLabelText('Damage 5'));
    fireEvent.click(screen.getByLabelText('Heal 1'));
    expect(onAdjust).toHaveBeenNthCalledWith(1, -5);
    expect(onAdjust).toHaveBeenNthCalledWith(2, 1);
  });
});
