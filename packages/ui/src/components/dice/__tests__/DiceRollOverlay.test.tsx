import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DiceRollOverlay } from '../DiceRollOverlay';
import { useRollStore, type RollResult } from '@/stores/rollStore';

// Mock the roll store so we can drive `latestRoll` directly.
vi.mock('@/stores/rollStore', () => ({
  useRollStore: vi.fn(),
}));

const mockedUseRollStore = vi.mocked(useRollStore);

function setLatestRoll(latestRoll: RollResult | null) {
  // The component only reads `latestRoll`; cast keeps the mock shape minimal.
  mockedUseRollStore.mockReturnValue({ latestRoll } as unknown as ReturnType<typeof useRollStore>);
}

const baseRoll: RollResult = {
  id: 'roll-1',
  label: 'Spell Attack Roll',
  expression: 'd20(15) + 6',
  total: 21,
  timestamp: 0,
};

describe('DiceRollOverlay', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when there is no latest roll', () => {
    setLatestRoll(null);
    const { container } = render(<DiceRollOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it('renders label, total, and expression for a single roll', () => {
    setLatestRoll(baseRoll);
    render(<DiceRollOverlay />);
    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByText('d20(15) + 6')).toBeInTheDocument();
    expect(screen.getByText('Spell Attack Roll')).toBeInTheDocument();
  });

  it('uses default label when none is provided', () => {
    setLatestRoll({ ...baseRoll, label: '' });
    render(<DiceRollOverlay />);
    expect(screen.getByText('Roll Result')).toBeInTheDocument();
  });

  it('renders a dismiss button and status role for accessibility', () => {
    setLatestRoll(baseRoll);
    render(<DiceRollOverlay />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /dismiss roll result/i })).toBeInTheDocument();
  });

  describe('modifier breakdown (components)', () => {
    it('renders the components breakdown line', () => {
      setLatestRoll({
        ...baseRoll,
        label: 'Skill: Perception',
        expression: 'd20 + 5',
        total: 22,
        components: [
          { source: 'WIS', value: 3 },
          { source: 'PB', value: 2 },
        ],
      });
      render(<DiceRollOverlay />);
      expect(screen.getByText('WIS +3 | PB +2')).toBeInTheDocument();
    });

    it('renders negative modifiers with a minus sign', () => {
      setLatestRoll({
        ...baseRoll,
        components: [{ source: 'STR', value: -1 }],
      });
      render(<DiceRollOverlay />);
      expect(screen.getByText('STR -1')).toBeInTheDocument();
    });
  });

  describe('weapon-attack mode', () => {
    const weaponRoll: RollResult = {
      ...baseRoll,
      label: 'Attack: Longsword',
      mode: 'weapon-attack',
      rows: [
        {
          label: 'Attack (Hit!)',
          expression: 'd20 + 6',
          total: 22,
          components: [
            { source: 'STR', value: 3 },
            { source: 'PB', value: 3 },
          ],
        },
        {
          label: 'Damage: Slashing',
          expression: '1d8 + 3',
          total: 8,
        },
      ],
    };

    it('renders both the attack row and the damage row', () => {
      setLatestRoll(weaponRoll);
      render(<DiceRollOverlay />);
      // Attack row
      expect(screen.getByText('Attack (Hit!)')).toBeInTheDocument();
      expect(screen.getByText('22')).toBeInTheDocument();
      expect(screen.getByText('STR +3 | PB +3')).toBeInTheDocument();
      // Damage row
      expect(screen.getByText('Damage: Slashing')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('1d8 + 3')).toBeInTheDocument();
    });
  });

  describe('critical states (non-color glyph, NFR-01)', () => {
    it('shows the 🎯 glyph on a critical hit', () => {
      setLatestRoll({ ...baseRoll, isCritical: true });
      render(<DiceRollOverlay />);
      expect(screen.getAllByText('🎯').length).toBeGreaterThan(0);
    });

    it('shows the 💥 glyph on a critical miss', () => {
      setLatestRoll({ ...baseRoll, isCriticalMiss: true });
      render(<DiceRollOverlay />);
      expect(screen.getAllByText('💥').length).toBeGreaterThan(0);
    });

    it('applies the success color class to a critical total', () => {
      setLatestRoll({ ...baseRoll, total: 30, isCritical: true });
      render(<DiceRollOverlay />);
      expect(screen.getByText('30').className).toContain('text-success');
    });
  });
});
