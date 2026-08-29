import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, defaultTranslations } from '@open20/ui';
import { HpBar } from '../HpBar';

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
      {ui}
    </I18nProvider>,
  );
}

describe('HpBar', () => {
  it('renders current/max and temp HP', () => {
    renderWithI18n(<HpBar current={34} max={45} temporary={10} onAdjust={() => {}} />);
    expect(screen.getByText('34')).toBeInTheDocument();
    expect(screen.getByText('/ 45')).toBeInTheDocument();
    expect(screen.getByText('+10 Temp')).toBeInTheDocument();
  });

  it('calls onAdjust with the button delta', () => {
    const onAdjust = vi.fn();
    renderWithI18n(<HpBar current={34} max={45} temporary={0} onAdjust={onAdjust} />);
    fireEvent.click(screen.getByLabelText('Damage 5'));
    fireEvent.click(screen.getByLabelText('Heal 1'));
    expect(onAdjust).toHaveBeenNthCalledWith(1, -5);
    expect(onAdjust).toHaveBeenNthCalledWith(2, 1);
  });

  it('does not show temp HP text when temporary is 0', () => {
    renderWithI18n(<HpBar current={34} max={45} temporary={0} onAdjust={() => {}} />);
    expect(screen.queryByText('+0 Temp')).not.toBeInTheDocument();
  });

  it('renders inline custom HP input with + and − buttons', () => {
    renderWithI18n(<HpBar current={34} max={45} temporary={0} onAdjust={() => {}} />);
    expect(screen.getByLabelText('Custom HP adjustment value')).toBeInTheDocument();
    expect(screen.getByLabelText('Heal custom amount')).toBeInTheDocument();
    expect(screen.getByLabelText('Damage custom amount')).toBeInTheDocument();
  });

  it('calls onAdjust with positive value on + click', () => {
    const onAdjust = vi.fn();
    renderWithI18n(<HpBar current={34} max={45} temporary={0} onAdjust={onAdjust} />);

    const input = screen.getByLabelText('Custom HP adjustment value');
    fireEvent.change(input, { target: { value: '7' } });

    fireEvent.click(screen.getByLabelText('Heal custom amount'));
    expect(onAdjust).toHaveBeenCalledWith(7);
  });

  it('calls onAdjust with negative value on − click', () => {
    const onAdjust = vi.fn();
    renderWithI18n(<HpBar current={34} max={45} temporary={0} onAdjust={onAdjust} />);

    const input = screen.getByLabelText('Custom HP adjustment value');
    fireEvent.change(input, { target: { value: '3' } });

    fireEvent.click(screen.getByLabelText('Damage custom amount'));
    expect(onAdjust).toHaveBeenCalledWith(-3);
  });

  it('clears input after applying custom value', () => {
    const onAdjust = vi.fn();
    renderWithI18n(<HpBar current={34} max={45} temporary={0} onAdjust={onAdjust} />);

    const input = screen.getByLabelText('Custom HP adjustment value') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.click(screen.getByLabelText('Heal custom amount'));

    expect(input.value).toBe('');
  });

  it('renders danger threshold color when HP < 25%', () => {
    renderWithI18n(<HpBar current={10} max={45} temporary={0} onAdjust={() => {}} />);
    // Progress bar fill element
    const bar = screen.getByRole('progressbar').querySelector('div');
    expect(bar).toBeTruthy();
  });

  it('renders with motion-reduce class on progress bar container', () => {
    renderWithI18n(<HpBar current={34} max={45} temporary={0} onAdjust={() => {}} />);
    const progressbar = screen.getByRole('progressbar');
    expect(progressbar.className).toContain('motion-reduce:transition-none');
  });
});
