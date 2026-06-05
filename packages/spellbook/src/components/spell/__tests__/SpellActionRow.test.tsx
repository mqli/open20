// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpellActionRow } from '../SpellActionRow';
import type { Spell } from 'open20-core';
import type { SpellLevel } from 'open20-core/types';

// Mock the translations
vi.mock('@/i18n', () => ({
  useTranslation: () => (key: string) => key,
}));

// Mock the icons
vi.mock('@open20/ui', async () => {
  const actual = await vi.importActual('@open20/ui');
  return {
    ...(actual as object),
    DamageIcon: () => <span data-testid="damage-icon">DamageIcon</span>,
    HealIcon: () => <span data-testid="heal-icon">HealIcon</span>,
    MagicIcon: () => <span data-testid="magic-icon">MagicIcon</span>,
    AttackIcon: () => <span data-testid="attack-icon">AttackIcon</span>,
    Button: ({ children, onClick, disabled, title }: any) => (
      <button onClick={onClick} disabled={disabled} title={title} data-testid="button">
        {children}
      </button>
    ),
    Divider: () => <span data-testid="divider">|</span>,
  };
});

// Mock CastLevelSelect
vi.mock('../CastLevelSelect', () => ({
  CastLevelSelect: () => <div data-testid="cast-level-select">CastLevelSelect</div>,
}));

describe('SpellActionRow', () => {
  const mockSpell: Spell = {
    id: 'fireball',
    name: 'Fireball',
    level: 3,
    school: 'Evocation',
    classes: ['Wizard'],
    components: ['V', 'S', 'M'],
    castingTime: 'Action',
    range: '150 feet',
    duration: 'Instantaneous',
    description: ['A bright streak flashes from your pointing finger...'],
    ritual: false,
    concentration: false,
    source: 'SRD',
    attack: true,
    damage: { dice: '8d6', type: 'fire' },
  } as unknown as Spell;

  const defaultProps = {
    spell: mockSpell,
    isIconStyle: false,
    showCastAction: true,
    showAttackAction: true,
    showDamageActions: true,
    hasDamageEntries: true,
    hasHealEntry: false,
    isPrepared: true,
    effectiveDamageEntries: [{ dice: '8d6', type: 'fire' }],
    healDice: undefined,
    availableCastLevels: [3, 4, 5] as SpellLevel[],
    effectiveCastLevel: 3 as SpellLevel,
    selectedCastLevel: 3 as SpellLevel,
    onCastLevelChange: vi.fn(),
    spellAttackBonus: 6,
    spellSlots: {
      0: { total: 0, used: 0 },
      1: { total: 0, used: 0 },
      2: { total: 0, used: 0 },
      3: { total: 3, used: 1 },
      4: { total: 1, used: 0 },
      5: { total: 0, used: 0 },
      6: { total: 0, used: 0 },
      7: { total: 0, used: 0 },
      8: { total: 0, used: 0 },
      9: { total: 0, used: 0 },
    },
    onCast: vi.fn(),
    onAttackRoll: vi.fn(),
    onDamageRoll: vi.fn(),
    onHealRoll: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render cast button when showCastAction is true', () => {
    render(<SpellActionRow {...defaultProps} />);

    const castButtons = screen.getAllByTitle(/cast/);
    expect(castButtons.length).toBeGreaterThan(0);
  });

  it('should call onCast when cast button is clicked', () => {
    const props = { ...defaultProps, onCast: vi.fn() };
    render(<SpellActionRow {...props} />);

    const castButtons = screen.getAllByTitle(/cast/);
    fireEvent.click(castButtons[0]);

    expect(props.onCast).toHaveBeenCalled();
  });

  it('should render attack button when showAttackAction and spell.attack are true', () => {
    render(<SpellActionRow {...defaultProps} />);

    const attackButtons = screen.getAllByTitle('rollAttack');
    expect(attackButtons.length).toBeGreaterThan(0);
  });

  it('should call onAttackRoll when attack button is clicked', () => {
    const props = { ...defaultProps, onAttackRoll: vi.fn() };
    render(<SpellActionRow {...props} />);

    const attackButtons = screen.getAllByTitle('rollAttack');
    fireEvent.click(attackButtons[0]);

    expect(props.onAttackRoll).toHaveBeenCalled();
  });

  it('should render damage button when showDamageActions and hasDamageEntries are true', () => {
    render(<SpellActionRow {...defaultProps} />);

    const damageButtons = screen.getAllByTitle('rollDamage');
    expect(damageButtons.length).toBeGreaterThan(0);
  });

  it('should call onDamageRoll when damage button is clicked', () => {
    const props = { ...defaultProps, onDamageRoll: vi.fn() };
    render(<SpellActionRow {...props} />);

    const damageButtons = screen.getAllByTitle('rollDamage');
    fireEvent.click(damageButtons[0]);

    expect(props.onDamageRoll).toHaveBeenCalled();
  });

  it('should display spell attack bonus on attack button', () => {
    render(<SpellActionRow {...defaultProps} spellAttackBonus={6} />);

    // Look for "+6" text (attack bonus display format)
    const attackButtons = screen.getAllByTitle('rollAttack');
    expect(attackButtons[0]).toBeInTheDocument();
    expect(screen.getByText(/\+6/)).toBeInTheDocument();
  });

  it('should display damage dice expression', () => {
    render(<SpellActionRow {...defaultProps} />);

    expect(screen.getByText(/8d6/)).toBeInTheDocument();
  });

  it('should disable cast button when spell is not prepared', () => {
    render(<SpellActionRow {...defaultProps} isPrepared={false} />);

    const castButtons = screen.getAllByTitle(/cast/);
    expect(castButtons[0]).toBeDisabled();
  });

  it('should disable cast button when no available cast levels', () => {
    render(<SpellActionRow {...defaultProps} availableCastLevels={[]} />);

    const castButtons = screen.getAllByTitle(/cast/);
    expect(castButtons[0]).toBeDisabled();
  });

  it('should show CastLevelSelect when showsUpcastSelect is true', () => {
    render(<SpellActionRow {...defaultProps} />);

    expect(screen.getByTestId('cast-level-select')).toBeInTheDocument();
  });

  it('should not render attack button when showAttackAction is false', () => {
    render(<SpellActionRow {...defaultProps} showAttackAction={false} />);

    const attackButtons = screen.queryAllByTitle('rollAttack');
    expect(attackButtons).toHaveLength(0);
  });

  it('should not render damage button when showDamageActions is false', () => {
    render(<SpellActionRow {...defaultProps} showDamageActions={false} />);

    const damageButtons = screen.queryAllByTitle('rollDamage');
    expect(damageButtons).toHaveLength(0);
  });

  it('should not render damage button when hasDamageEntries is false', () => {
    render(<SpellActionRow {...defaultProps} hasDamageEntries={false} />);

    const damageButtons = screen.queryAllByTitle('rollDamage');
    expect(damageButtons).toHaveLength(0);
  });

  it('should render in icon style when isIconStyle is true', () => {
    const { container } = render(<SpellActionRow {...defaultProps} isIconStyle={true} />);

    // Icon style should still render buttons
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render heal button when hasHealEntry is true', () => {
    render(
      <SpellActionRow
        {...defaultProps}
        hasHealEntry={true}
        healDice="1d4+3"
        showDamageActions={true}
      />,
    );

    // With mock translation returning keys, title will be "rollDamageOfType 1d4+3"
    const healButtons = screen.getAllByTitle(/rollDamageOfType/i);
    expect(healButtons.length).toBeGreaterThan(0);
  });

  it('should call onHealRoll when heal button is clicked', () => {
    const props = {
      ...defaultProps,
      hasHealEntry: true,
      healDice: '1d4+3',
      showDamageActions: true,
      onHealRoll: vi.fn(),
    };
    render(<SpellActionRow {...props} />);

    // With mock translation returning keys, title will be "rollDamageOfType 1d4+3"
    const healButtons = screen.getAllByTitle(/rollDamageOfType/i);
    fireEvent.click(healButtons[0]);

    expect(props.onHealRoll).toHaveBeenCalled();
  });
});
