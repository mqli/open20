// EquipmentCard.test.tsx — T-201

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EquipmentCard } from '../EquipmentCard';
import type { EquipmentItem } from 'open20-core';

function weapon(overrides?: Partial<EquipmentItem>): EquipmentItem {
  return {
    id: 'longsword',
    name: 'Longsword',
    type: 'weapon',
    weight: 3,
    equipped: false,
    damage: {
      entries: [{ dice: '1d8', type: 'Slashing' }],
      ability: 'Strength',
      bonus: 0,
    },
    ...overrides,
  } as EquipmentItem;
}

function armor(overrides?: Partial<EquipmentItem>): EquipmentItem {
  return {
    id: 'chain-mail',
    name: 'Chain Mail',
    type: 'armor',
    weight: 55,
    equipped: true,
    ac: 16,
    ...overrides,
  } as EquipmentItem;
}

function gear(overrides?: Partial<EquipmentItem>): EquipmentItem {
  return {
    id: 'rope',
    name: 'Hempen Rope',
    type: 'gears',
    weight: 10,
    equipped: false,
    ...overrides,
  } as EquipmentItem;
}

describe('EquipmentCard', () => {
  // --- rendering ---

  it('renders item name', () => {
    render(<EquipmentCard item={weapon()} onToggleEquip={() => {}} onRemove={() => {}} />);
    expect(screen.getByText('Longsword')).toBeInTheDocument();
  });

  it('renders type badge', () => {
    render(<EquipmentCard item={weapon()} onToggleEquip={() => {}} onRemove={() => {}} />);
    expect(screen.getByText('Weapon')).toBeInTheDocument();
  });

  it('shows damage for weapons', () => {
    render(<EquipmentCard item={weapon()} onToggleEquip={() => {}} onRemove={() => {}} />);
    expect(screen.getByText('1d8 STR')).toBeInTheDocument();
  });

  it('shows AC for armor', () => {
    render(<EquipmentCard item={armor()} onToggleEquip={() => {}} onRemove={() => {}} />);
    expect(screen.getByText('AC 16')).toBeInTheDocument();
  });

  it('shows weight for gear', () => {
    render(<EquipmentCard item={gear()} onToggleEquip={() => {}} onRemove={() => {}} />);
    expect(screen.getByText('10 lb')).toBeInTheDocument();
  });

  it('shows nothing for zero-weight gear', () => {
    const feather = gear({ weight: 0 });
    render(<EquipmentCard item={feather} onToggleEquip={() => {}} onRemove={() => {}} />);
    // No stat line
    expect(screen.queryByText(/lb/)).not.toBeInTheDocument();
  });

  // --- equipped state ---

  it('shows Check icon when equipped', () => {
    render(
      <EquipmentCard
        item={weapon({ equipped: true })}
        onToggleEquip={() => {}}
        onRemove={() => {}}
      />,
    );
    const btn = screen.getByRole('button', { name: 'Unequip Longsword' });
    const svg = btn.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('shows Circle icon when not equipped', () => {
    render(
      <EquipmentCard
        item={weapon({ equipped: false })}
        onToggleEquip={() => {}}
        onRemove={() => {}}
      />,
    );
    const btn = screen.getByRole('button', { name: 'Equip Longsword' });
    const svg = btn.querySelector('svg');
    expect(svg).toBeTruthy();
    // Circle has a circle element inside
    expect(svg?.querySelector('circle')).toBeTruthy();
  });

  // --- callbacks ---

  it('calls onToggleEquip when equip button clicked', () => {
    const onToggleEquip = vi.fn();
    render(<EquipmentCard item={weapon()} onToggleEquip={onToggleEquip} onRemove={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Equip Longsword' }));
    expect(onToggleEquip).toHaveBeenCalledOnce();
  });

  it('calls onToggleEquip with unequip label when equipped', () => {
    const onToggleEquip = vi.fn();
    render(
      <EquipmentCard
        item={weapon({ equipped: true })}
        onToggleEquip={onToggleEquip}
        onRemove={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Unequip Longsword' }));
    expect(onToggleEquip).toHaveBeenCalledOnce();
  });

  it('calls onRemove when trash button clicked', () => {
    const onRemove = vi.fn();
    render(<EquipmentCard item={armor()} onToggleEquip={() => {}} onRemove={onRemove} />);
    fireEvent.click(screen.getByRole('button', { name: 'Remove Chain Mail' }));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  // --- edge cases ---

  it('renders different type badges', () => {
    const { rerender } = render(
      <EquipmentCard item={weapon()} onToggleEquip={() => {}} onRemove={() => {}} />,
    );
    expect(screen.getByText('Weapon')).toBeInTheDocument();

    rerender(<EquipmentCard item={armor()} onToggleEquip={() => {}} onRemove={() => {}} />);
    expect(screen.getByText('Armor')).toBeInTheDocument();

    rerender(<EquipmentCard item={gear()} onToggleEquip={() => {}} onRemove={() => {}} />);
    expect(screen.getByText('Gear')).toBeInTheDocument();
  });
});
