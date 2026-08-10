// AddEquipmentDialog.tsx — T-203
// Modal dialog for adding equipment from SRD catalogs or custom entry.
// Features: text search, category tabs (All/Weapons/Armor/Gear), SRD
// item list with [+] buttons, and a custom item form.

import { useMemo, useState } from 'react';
import { Search, Plus, Swords, Shield, Package } from 'lucide-react';
import type { EquipmentItem, Weapon, Armor } from 'open20-core';
import { Text, Button, Badge, Input, Dialog, Divider } from '@open20/ui';
import { getAllWeapons, getAllArmors, getAllGearItems, initContent } from '@/core/content-resolver';

export interface AddEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (item: EquipmentItem) => void;
}

type CatTab = 'all' | 'weapon' | 'armor' | 'gear';

interface CatDef {
  key: CatTab;
  label: string;
  icon: typeof Swords;
}

const CATS: CatDef[] = [
  { key: 'all', label: 'All', icon: Package },
  { key: 'weapon', label: 'Weapons', icon: Swords },
  { key: 'armor', label: 'Armor', icon: Shield },
  { key: 'gear', label: 'Gear', icon: Package },
];

function keyStat(item: EquipmentItem): string | null {
  switch (item.type) {
    case 'weapon': {
      const w = item as Weapon;
      const dice = w.damage?.entries[0]?.dice;
      return dice ?? null;
    }
    case 'armor': {
      const a = item as Armor;
      return a.ac != null ? `AC ${a.ac}` : null;
    }
    default:
      return item.weight > 0 ? `${item.weight} lb` : null;
  }
}

export function AddEquipmentDialog({ open, onOpenChange, onAdd }: AddEquipmentDialogProps) {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<CatTab>('all');

  // Custom form state
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<EquipmentItem['type']>('gears');
  const [customWeight, setCustomWeight] = useState('');

  // Fetch catalog on open
  const allItems = useMemo(() => {
    initContent();
    return {
      weapon: getAllWeapons(),
      armor: getAllArmors(),
      gear: getAllGearItems(),
    };
  }, []);

  // Filter by search + tab
  const filtered = useMemo(() => {
    const combined = [
      ...(tab === 'all' || tab === 'weapon' ? allItems.weapon : []),
      ...(tab === 'all' || tab === 'armor' ? allItems.armor : []),
      ...(tab === 'all' || tab === 'gear' ? allItems.gear : []),
    ];

    if (!search.trim()) return combined;

    const q = search.toLowerCase();
    return combined.filter((item) => item.name.toLowerCase().includes(q));
  }, [allItems, tab, search]);

  const handleAddSrd = (item: EquipmentItem) => {
    onAdd({ ...item, equipped: false, quantity: 1 });
  };

  const handleCustomAdd = () => {
    if (!customName.trim()) return;
    const weight = parseFloat(customWeight) || 0;
    onAdd({
      id: crypto.randomUUID(),
      name: customName.trim(),
      type: customType,
      weight,
      equipped: false,
      quantity: 1,
    });
    resetCustom();
  };

  const resetCustom = () => {
    setShowCustom(false);
    setCustomName('');
    setCustomType('gears');
    setCustomWeight('');
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-h-[80vh] flex flex-col">
        <Dialog.Header>
          <Dialog.Title>Add Equipment</Dialog.Title>
          <Dialog.Description>Search SRD items or create a custom entry.</Dialog.Description>
        </Dialog.Header>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search equipment..."
            className="pl-8"
          />
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 mb-2 overflow-x-auto">
          {CATS.map((c) => (
            <Button
              key={c.key}
              variant={tab === c.key ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setTab(c.key)}
              className="gap-1 shrink-0"
            >
              <c.icon className="h-3.5 w-3.5" />
              {c.label}
            </Button>
          ))}
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto -mx-1 px-1">
          {filtered.length === 0 ? (
            <Text variant="bodySm" color="secondary" className="py-8 text-center">
              No items found.
            </Text>
          ) : (
            <div className="flex flex-col gap-0.5">
              {filtered.map((item) => {
                const stat = keyStat(item);
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 rounded-lg p-2 hover:bg-bg-tertiary"
                  >
                    <div className="min-w-0 flex-1">
                      <Text variant="bodySm" weight="medium" className="truncate">
                        {item.name}
                      </Text>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {item.type}
                        </Badge>
                        {stat && (
                          <Text variant="bodySm" color="secondary">
                            {stat}
                          </Text>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="min-h-[44px] min-w-[44px] p-0"
                      onClick={() => handleAddSrd(item)}
                      aria-label={`Add ${item.name}`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Divider className="my-3" />

        {/* Custom item */}
        {!showCustom ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full gap-1"
            onClick={() => setShowCustom(true)}
          >
            <Plus className="h-4 w-4" />
            Custom Item
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Item name"
              aria-label="Custom item name"
            />
            <div className="flex gap-2">
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value as EquipmentItem['type'])}
                className="flex-1 rounded-md border border-border bg-bg-primary px-2 py-1.5 text-sm"
                aria-label="Item type"
              >
                <option value="gears">Gear</option>
                <option value="weapon">Weapon</option>
                <option value="armor">Armor</option>
                <option value="consumable">Consumable</option>
              </select>
              <Input
                type="number"
                value={customWeight}
                onChange={(e) => setCustomWeight(e.target.value)}
                placeholder="Weight (lb)"
                aria-label="Item weight"
                className="w-28"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={handleCustomAdd}
                disabled={!customName.trim()}
              >
                Add Item
              </Button>
              <Button variant="ghost" size="sm" onClick={resetCustom}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Dialog.Content>
    </Dialog.Root>
  );
}
