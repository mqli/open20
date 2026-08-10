// AddEquipmentDialog.test.tsx — T-203

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddEquipmentDialog } from '../AddEquipmentDialog';
import type { EquipmentItem } from 'open20-core';
import { initContent } from '@/core/content-resolver';

describe('AddEquipmentDialog', () => {
  const onAdd = vi.fn();
  const onOpenChange = vi.fn();

  beforeEach(() => {
    initContent();
    onAdd.mockClear();
    onOpenChange.mockClear();
  });

  function renderOpen() {
    return render(<AddEquipmentDialog open onOpenChange={onOpenChange} onAdd={onAdd} />);
  }

  // --- rendering ---

  it('renders dialog title', () => {
    renderOpen();
    expect(screen.getByText('Add Equipment')).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderOpen();
    expect(screen.getByPlaceholderText('Search equipment...')).toBeInTheDocument();
  });

  it('renders category tabs', () => {
    renderOpen();
    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('Weapons')).toBeInTheDocument();
    expect(screen.getByText('Armor')).toBeInTheDocument();
    expect(screen.getByText('Gear')).toBeInTheDocument();
  });

  it('renders custom item button', () => {
    renderOpen();
    expect(screen.getByText('Custom Item')).toBeInTheDocument();
  });

  // --- filtering ---

  it('shows SRD items in the list', async () => {
    renderOpen();
    // At least one weapon should be visible (e.g., Longsword)
    expect(screen.getByText('Longsword')).toBeInTheDocument();
  });

  it('filters by weapon category', () => {
    renderOpen();
    fireEvent.click(screen.getByText('Weapons'));

    // Should see Longsword
    expect(screen.getByText('Longsword')).toBeInTheDocument();
    // Should not see Chain Shirt (armor)
    expect(screen.queryByText('Chain Shirt')).not.toBeInTheDocument();
  });

  it('filters by armor category', () => {
    renderOpen();
    fireEvent.click(screen.getByText('Armor'));

    expect(screen.getByText('Chain Shirt')).toBeInTheDocument();
    expect(screen.queryByText('Longsword')).not.toBeInTheDocument();
  });

  it('filters by search text', () => {
    renderOpen();
    const searchInput = screen.getByPlaceholderText('Search equipment...');
    fireEvent.change(searchInput, { target: { value: 'chain' } });

    expect(screen.getByText('Chain Shirt')).toBeInTheDocument();
    expect(screen.queryByText('Longsword')).not.toBeInTheDocument();
  });

  it('shows "No items found" when filter matches nothing', () => {
    renderOpen();
    const searchInput = screen.getByPlaceholderText('Search equipment...');
    fireEvent.change(searchInput, { target: { value: 'zzzxxxnonexistent' } });

    expect(screen.getByText(/No items found/)).toBeInTheDocument();
  });

  // --- adding SRD items ---

  it('calls onAdd when [+] button clicked for SRD item', () => {
    renderOpen();
    // Longsword should have an Add button
    fireEvent.click(screen.getByRole('button', { name: 'Add Longsword' }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    const added = onAdd.mock.calls[0][0] as EquipmentItem;
    expect(added.name).toBe('Longsword');
    expect(added.type).toBe('weapon');
    expect(added.equipped).toBe(false);
  });

  // --- custom items ---

  it('shows custom form when "Custom Item" is clicked', () => {
    renderOpen();
    fireEvent.click(screen.getByText('Custom Item'));

    expect(screen.getByPlaceholderText('Item name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add Item' })).toBeInTheDocument();
  });

  it('adds custom item with entered values', () => {
    renderOpen();
    fireEvent.click(screen.getByText('Custom Item'));

    fireEvent.change(screen.getByPlaceholderText('Item name'), {
      target: { value: 'Magic Amulet' },
    });
    fireEvent.change(screen.getByPlaceholderText('Weight (lb)'), {
      target: { value: '0.5' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add Item' }));

    expect(onAdd).toHaveBeenCalledTimes(1);
    const added = onAdd.mock.calls[0][0] as EquipmentItem;
    expect(added.name).toBe('Magic Amulet');
    expect(added.weight).toBe(0.5);
    expect(added.type).toBe('gears');
    expect(added.equipped).toBe(false);
  });

  it('disables Add Item when name is empty', () => {
    renderOpen();
    fireEvent.click(screen.getByText('Custom Item'));

    expect(screen.getByRole('button', { name: 'Add Item' })).toBeDisabled();
  });
});
