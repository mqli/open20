// EquipmentList.test.tsx — T-202

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EquipmentList } from '../EquipmentList';
import type { EquipmentItem } from 'open20-core';

function weapon(id: string, name: string, equipped = false): EquipmentItem {
  return {
    id,
    name,
    type: 'weapon',
    weight: 3,
    equipped,
    damage: { entries: [{ dice: '1d8', type: 'Slashing' }], ability: 'Strength', bonus: 0 },
  } as EquipmentItem;
}

function armor(id: string, name: string, equipped = false): EquipmentItem {
  return { id, name, type: 'armor', weight: 20, equipped, ac: 16 } as EquipmentItem;
}

function gear(id: string, name: string): EquipmentItem {
  return { id, name, type: 'gears', weight: 2, equipped: false } as EquipmentItem;
}

describe('EquipmentList', () => {
  // --- rendering ---

  it('shows empty state when no items', () => {
    render(<EquipmentList items={[]} onToggleEquip={() => {}} onRemove={() => {}} />);
    expect(screen.getByText(/No equipment/)).toBeInTheDocument();
  });

  it('groups items by type with section headers', () => {
    const items = [weapon('w1', 'Sword'), armor('a1', 'Shield')];
    render(<EquipmentList items={items} onToggleEquip={() => {}} onRemove={() => {}} />);

    expect(screen.getByText('Weapons')).toBeInTheDocument();
    expect(screen.getByText('Armor & Shields')).toBeInTheDocument();
    // Each item rendered
    expect(screen.getByText('Sword')).toBeInTheDocument();
    expect(screen.getByText('Shield')).toBeInTheDocument();
  });

  it('splits gear into "Gear" section', () => {
    const items = [gear('g1', 'Backpack')];
    render(<EquipmentList items={items} onToggleEquip={() => {}} onRemove={() => {}} />);

    // Section header renders "Gear"
    const headers = screen.getAllByText('Gear');
    expect(headers.length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Backpack')).toBeInTheDocument();
  });

  it('omits empty group sections', () => {
    const items = [weapon('w1', 'Sword')];
    render(<EquipmentList items={items} onToggleEquip={() => {}} onRemove={() => {}} />);
    expect(screen.getByText('Weapons')).toBeInTheDocument();
    expect(screen.queryByText('Armor & Shields')).not.toBeInTheDocument();
    expect(screen.queryByText('Gear')).not.toBeInTheDocument();
  });

  // --- callbacks ---

  it('calls onToggleEquip with item id when equip clicked', () => {
    const onToggleEquip = vi.fn();
    const items = [weapon('longsword', 'Longsword')];
    render(<EquipmentList items={items} onToggleEquip={onToggleEquip} onRemove={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: 'Equip Longsword' }));
    expect(onToggleEquip).toHaveBeenCalledWith('longsword');
  });

  it('calls onToggleEquip with unequip for equipped items', () => {
    const onToggleEquip = vi.fn();
    const items = [weapon('longsword', 'Longsword', true)];
    render(<EquipmentList items={items} onToggleEquip={onToggleEquip} onRemove={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: 'Unequip Longsword' }));
    expect(onToggleEquip).toHaveBeenCalledWith('longsword');
  });

  it('calls onRemove with item id when trash clicked', () => {
    const onRemove = vi.fn();
    const items = [armor('chain-mail', 'Chain Mail')];
    render(<EquipmentList items={items} onToggleEquip={() => {}} onRemove={onRemove} />);

    fireEvent.click(screen.getByRole('button', { name: 'Remove Chain Mail' }));
    expect(onRemove).toHaveBeenCalledWith('chain-mail');
  });

  it('renders multiple items of the same type', () => {
    const items = [weapon('w1', 'Sword'), weapon('w2', 'Dagger')];
    render(<EquipmentList items={items} onToggleEquip={() => {}} onRemove={() => {}} />);

    expect(screen.getByText('Sword')).toBeInTheDocument();
    expect(screen.getByText('Dagger')).toBeInTheDocument();
    // Weapons header shows once
    expect(screen.getByText('Weapons')).toBeInTheDocument();
  });
});
