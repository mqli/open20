// EquipmentList.tsx — T-202
// Groups equipment by type (Weapons / Armor / Gear) and renders
// EquipmentCard rows with equip/unequip/remove callbacks.

import { Swords, Shield, Package } from 'lucide-react';
import type { EquipmentItem } from 'open20-core';
import { Text, Surface, cn } from '@open20/ui';
import { EquipmentCard } from './EquipmentCard';

export interface EquipmentListProps {
  items: readonly EquipmentItem[];
  onToggleEquip: (itemId: string) => void;
  onRemove: (itemId: string) => void;
  className?: string;
}

interface GroupDef {
  key: string;
  label: string;
  icon: typeof Swords;
  types: EquipmentItem['type'][];
}

const GROUPS: GroupDef[] = [
  { key: 'weapons', label: 'Weapons', icon: Swords, types: ['weapon'] },
  { key: 'armor', label: 'Armor & Shields', icon: Shield, types: ['armor'] },
  { key: 'gear', label: 'Gear', icon: Package, types: ['gears', 'consumable'] },
];

function groupItems(items: readonly EquipmentItem[]) {
  return GROUPS.map((g) => ({
    ...g,
    items: items.filter((i) => g.types.includes(i.type)),
  }));
}

export function EquipmentList({ items, onToggleEquip, onRemove, className }: EquipmentListProps) {
  const groups = groupItems(items);
  const hasAny = groups.some((g) => g.items.length > 0);

  if (!hasAny) {
    return (
      <Surface variant="default" padding="sm" className={cn(className)}>
        <Text variant="bodySm" color="secondary">
          No equipment. Add items to get started.
        </Text>
      </Surface>
    );
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {groups.map((g) => {
        if (g.items.length === 0) return null;
        const Icon = g.icon;
        return (
          <div key={g.key}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Icon className="h-3.5 w-3.5 text-text-tertiary" aria-hidden />
              <Text variant="labelSm" color="secondary">
                {g.label}
              </Text>
            </div>
            <div className="flex flex-col gap-1">
              {g.items.map((item) => (
                <EquipmentCard
                  key={item.id}
                  item={item}
                  onToggleEquip={() => onToggleEquip(item.id)}
                  onRemove={() => onRemove(item.id)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
