import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import { DiceRollOverlay } from '../DiceRollOverlay';
import { useRollStore, type RollResult } from '@/stores/rollStore';

/**
 * The overlay reads the latest roll from `useRollStore` internally, so each
 * story seeds the store with a fixed roll (bypassing the auto-clear timer) and
 * clears it on unmount.
 */
function seedRoll(roll: RollResult) {
  function Seeder() {
    useEffect(() => {
      useRollStore.setState({ latestRoll: roll, recentRolls: [roll] });
      return () => useRollStore.setState({ latestRoll: null, recentRolls: [] });
    }, []);
    return <DiceRollOverlay />;
  }
  return Seeder;
}

const meta = {
  title: 'Components/DiceRollOverlay',
  component: DiceRollOverlay,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof DiceRollOverlay>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: seedRoll({
    id: 'story-single',
    label: 'Skill: Perception',
    expression: 'd20 + 5',
    total: 22,
    timestamp: Date.now(),
    components: [
      { source: 'WIS', value: 3 },
      { source: 'PB', value: 2 },
    ],
  }),
};

export const CriticalHit: Story = {
  render: seedRoll({
    id: 'story-crit',
    label: 'Attack: Longsword',
    expression: 'd20 + 6',
    total: 26,
    timestamp: Date.now(),
    isCritical: true,
    components: [
      { source: 'STR', value: 3 },
      { source: 'PB', value: 3 },
    ],
  }),
};

export const CriticalMiss: Story = {
  render: seedRoll({
    id: 'story-crit-miss',
    label: 'Attack: Longsword',
    expression: 'd20 + 6',
    total: 7,
    timestamp: Date.now(),
    isCriticalMiss: true,
  }),
};

export const WeaponAttack: Story = {
  render: seedRoll({
    id: 'story-weapon',
    label: 'Attack: Longsword',
    expression: 'd20 + 6',
    total: 22,
    timestamp: Date.now(),
    mode: 'weapon-attack',
    isCritical: true,
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
  }),
};
