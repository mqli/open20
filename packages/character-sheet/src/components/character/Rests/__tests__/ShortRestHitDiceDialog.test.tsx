import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nProvider, defaultTranslations } from '@open20/ui';
import { ShortRestHitDiceDialog } from '../ShortRestHitDiceDialog';
import type { ClassHitDiceInfo } from '../ShortRestHitDiceDialog';

function renderWithI18n(ui: React.ReactElement) {
  return render(
    <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
      {ui}
    </I18nProvider>,
  );
}

const singleClass: ClassHitDiceInfo[] = [
  { classId: 'Wizard', className: 'Wizard', dieType: 'd6', available: 3, total: 5 },
];

const multiClass: ClassHitDiceInfo[] = [
  { classId: 'Fighter', className: 'Fighter', dieType: 'd10', available: 2, total: 5 },
  { classId: 'Wizard', className: 'Wizard', dieType: 'd6', available: 4, total: 4 },
];

describe('ShortRestHitDiceDialog', () => {
  it('renders per-class rows with steppers', () => {
    renderWithI18n(
      <ShortRestHitDiceDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        classHitDice={multiClass}
        conMod={2}
        currentHp={20}
        maxHp={55}
      />,
    );

    expect(screen.getByText('Fighter')).toBeInTheDocument();
    expect(screen.getByText('Wizard')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Take Short Rest' })).toBeInTheDocument();
  });

  it('shows die type and used/total for each class', () => {
    renderWithI18n(
      <ShortRestHitDiceDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        classHitDice={multiClass}
        conMod={2}
        currentHp={20}
        maxHp={55}
      />,
    );

    expect(screen.getByText('d10')).toBeInTheDocument();
    expect(screen.getByText('d6')).toBeInTheDocument();
    expect(screen.getByText('3 / 5 used')).toBeInTheDocument(); // Fighter: 5-2=3 available, 2 used
    expect(screen.getByText('0 / 4 used')).toBeInTheDocument(); // Wizard: 4-4=0 available, 0 used
  });

  it('increments and decrements per-class count', () => {
    renderWithI18n(
      <ShortRestHitDiceDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        classHitDice={singleClass}
        conMod={2}
        currentHp={20}
        maxHp={32}
      />,
    );

    // All counts start at 0
    const counts = screen.getAllByText('0');
    expect(counts.length).toBeGreaterThanOrEqual(1);

    // Click + for Wizard
    const plusBtn = screen.getByRole('button', { name: 'Spend one more Wizard hit die' });
    fireEvent.click(plusBtn);
    expect(screen.getByText('1')).toBeInTheDocument();

    // Click - to decrement
    const minusBtn = screen.getByRole('button', { name: 'Spend one less Wizard hit die' });
    fireEvent.click(minusBtn);
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
  });

  it('disables + button at max available', () => {
    renderWithI18n(
      <ShortRestHitDiceDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        classHitDice={singleClass}
        conMod={2}
        currentHp={20}
        maxHp={32}
      />,
    );

    const plusBtn = screen.getByRole('button', { name: 'Spend one more Wizard hit die' });
    // Click 3 times to reach max
    fireEvent.click(plusBtn);
    fireEvent.click(plusBtn);
    fireEvent.click(plusBtn);
    expect(plusBtn).toBeDisabled();
  });

  it('disables - button at 0', () => {
    renderWithI18n(
      <ShortRestHitDiceDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        classHitDice={singleClass}
        conMod={2}
        currentHp={20}
        maxHp={32}
      />,
    );

    const minusBtn = screen.getByRole('button', { name: 'Spend one less Wizard hit die' });
    expect(minusBtn).toBeDisabled();
  });

  it('Max button fills all available', () => {
    renderWithI18n(
      <ShortRestHitDiceDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        classHitDice={singleClass}
        conMod={2}
        currentHp={20}
        maxHp={32}
      />,
    );

    const maxBtn = screen.getByRole('button', { name: 'Spend all Wizard hit dice' });
    fireEvent.click(maxBtn);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows HP recovery preview', () => {
    renderWithI18n(
      <ShortRestHitDiceDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        classHitDice={singleClass}
        conMod={2}
        currentHp={20}
        maxHp={32}
      />,
    );

    // Click + to spend 1 die: d6 avg(4) + CON(2) = 6 HP
    const plusBtn = screen.getByRole('button', { name: 'Spend one more Wizard hit die' });
    fireEvent.click(plusBtn);

    expect(screen.getByText('~6 HP')).toBeInTheDocument();
    expect(screen.getByText('20 → 26 / 32')).toBeInTheDocument();
  });

  it('shows HP at maximum indicator', () => {
    renderWithI18n(
      <ShortRestHitDiceDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        classHitDice={singleClass}
        conMod={2}
        currentHp={32}
        maxHp={32}
      />,
    );

    expect(screen.getByText(/at maximum/)).toBeInTheDocument();
  });

  it('shows capped indicator when recovery exceeds max', () => {
    renderWithI18n(
      <ShortRestHitDiceDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        classHitDice={singleClass}
        conMod={2}
        currentHp={28}
        maxHp={32}
      />,
    );

    // Spend 1 die: 28+6=34 > 32 → capped
    const plusBtn = screen.getByRole('button', { name: 'Spend one more Wizard hit die' });
    fireEvent.click(plusBtn);

    expect(screen.getByText(/capped/)).toBeInTheDocument();
  });

  it('shows no hit dice available state', () => {
    renderWithI18n(
      <ShortRestHitDiceDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        classHitDice={[
          { classId: 'Wizard', className: 'Wizard', dieType: 'd6', available: 0, total: 5 },
        ]}
        conMod={2}
        currentHp={20}
        maxHp={32}
      />,
    );

    expect(screen.getByText('No hit dice available')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Take Short Rest' })).toBeDisabled();
  });

  it('CTA is enabled when 0 dice spent (rest for resources)', () => {
    renderWithI18n(
      <ShortRestHitDiceDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        classHitDice={singleClass}
        conMod={2}
        currentHp={20}
        maxHp={32}
      />,
    );

    expect(screen.getByRole('button', { name: 'Take Short Rest' })).not.toBeDisabled();
  });

  it('onConfirm emits per-class spending map', () => {
    const onConfirm = vi.fn();

    renderWithI18n(
      <ShortRestHitDiceDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
        classHitDice={multiClass}
        conMod={2}
        currentHp={20}
        maxHp={55}
      />,
    );

    // Spend 1 Fighter die
    const fighterPlus = screen.getByRole('button', { name: 'Spend one more Fighter hit die' });
    fireEvent.click(fighterPlus);

    // Spend 2 Wizard dice
    const wizardPlus = screen.getByRole('button', { name: 'Spend one more Wizard hit die' });
    fireEvent.click(wizardPlus);
    fireEvent.click(wizardPlus);

    fireEvent.click(screen.getByRole('button', { name: 'Take Short Rest' }));

    expect(onConfirm).toHaveBeenCalledWith({ Fighter: 1, Wizard: 2 });
  });

  it('omits classes with 0 spending from onConfirm', () => {
    const onConfirm = vi.fn();

    renderWithI18n(
      <ShortRestHitDiceDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={onConfirm}
        classHitDice={multiClass}
        conMod={2}
        currentHp={20}
        maxHp={55}
      />,
    );

    // Spend only from Wizard
    const wizardPlus = screen.getByRole('button', { name: 'Spend one more Wizard hit die' });
    fireEvent.click(wizardPlus);

    fireEvent.click(screen.getByRole('button', { name: 'Take Short Rest' }));

    expect(onConfirm).toHaveBeenCalledWith({ Wizard: 1 });
    expect(onConfirm.mock.calls[0][0]).not.toHaveProperty('Fighter');
  });

  it('resets all steppers on dialog close', () => {
    const onOpenChange = vi.fn();

    const { rerender } = renderWithI18n(
      <ShortRestHitDiceDialog
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={vi.fn()}
        classHitDice={singleClass}
        conMod={2}
        currentHp={20}
        maxHp={32}
      />,
    );

    // Spend 1 die
    const plusBtn = screen.getByRole('button', { name: 'Spend one more Wizard hit die' });
    fireEvent.click(plusBtn);
    expect(screen.getByText('1')).toBeInTheDocument();

    // Close dialog
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);

    // Reopen
    rerender(
      <I18nProvider initialLocale="en" translationsSet={{ en: defaultTranslations }}>
        <ShortRestHitDiceDialog
          open={true}
          onOpenChange={onOpenChange}
          onConfirm={vi.fn()}
          classHitDice={singleClass}
          conMod={2}
          currentHp={20}
          maxHp={32}
        />
      </I18nProvider>,
    );

    // All counts should be back to 0
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(1);
  });

  it('does not render when closed', () => {
    renderWithI18n(
      <ShortRestHitDiceDialog
        open={false}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        classHitDice={singleClass}
        conMod={2}
        currentHp={20}
        maxHp={32}
      />,
    );

    expect(screen.queryByText('Short Rest')).toBeNull();
  });

  it('shows heal estimate per class row', () => {
    renderWithI18n(
      <ShortRestHitDiceDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        classHitDice={singleClass}
        conMod={2}
        currentHp={20}
        maxHp={32}
      />,
    );

    // Spend 2 Wizard dice
    const plusBtn = screen.getByRole('button', { name: 'Spend one more Wizard hit die' });
    fireEvent.click(plusBtn);
    fireEvent.click(plusBtn);

    // Wizard: d6 fixed=4 + CON=2 = 6 per die, 2 dice = 12
    expect(screen.getByText('2d6 + 2×2 (CON) = ~12 HP')).toBeInTheDocument();
  });

  // ── Multi-class sum logic (T-206) ──

  it('shows total recovery as sum across all classes', () => {
    renderWithI18n(
      <ShortRestHitDiceDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        classHitDice={multiClass}
        conMod={2}
        currentHp={20}
        maxHp={55}
      />,
    );

    // Multiclass: Fighter d10=6+2=8, Wizard d6=4+2=6
    // Spend 1 Fighter (8) + 2 Wizard (12) = 20
    fireEvent.click(screen.getByRole('button', { name: 'Spend one more Fighter hit die' }));
    fireEvent.click(screen.getByRole('button', { name: 'Spend one more Wizard hit die' }));
    fireEvent.click(screen.getByRole('button', { name: 'Spend one more Wizard hit die' }));

    expect(screen.getByText('~20 HP')).toBeInTheDocument();
    expect(screen.getByText('20 → 40 / 55')).toBeInTheDocument();
  });

  it('shows per-class heal estimates for multi-class', () => {
    renderWithI18n(
      <ShortRestHitDiceDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        classHitDice={multiClass}
        conMod={2}
        currentHp={20}
        maxHp={55}
      />,
    );

    // Spend 1 Fighter (d10 avg=6 + CON=2 = 8) and 1 Wizard (d6 avg=4 + CON=2 = 6)
    fireEvent.click(screen.getByRole('button', { name: 'Spend one more Fighter hit die' }));
    fireEvent.click(screen.getByRole('button', { name: 'Spend one more Wizard hit die' }));

    // Per-class heal estimates
    expect(screen.getByText('1d10 + 1×2 (CON) = ~8 HP')).toBeInTheDocument();
    expect(screen.getByText('1d6 + 1×2 (CON) = ~6 HP')).toBeInTheDocument();
  });

  it('caps total HP correctly in multi-class scenario', () => {
    renderWithI18n(
      <ShortRestHitDiceDialog
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        classHitDice={multiClass}
        conMod={2}
        currentHp={45}
        maxHp={55}
      />,
    );

    // Spend 2 Fighter dice (2*(6+2)=16): 45+16=61 > 55 = capped
    fireEvent.click(screen.getByRole('button', { name: 'Spend one more Fighter hit die' }));
    fireEvent.click(screen.getByRole('button', { name: 'Spend one more Fighter hit die' }));

    expect(screen.getByText(/capped/)).toBeInTheDocument();
  });
});
