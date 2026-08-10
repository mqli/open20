// EquipmentCard.tsx — T-201
// Presentational item row: name, key stat (damage/AC), equipped toggle,
// and remove button. Handles Weapon, Armor, and Gear/Consumable types.

import { Trash2, Check, Circle } from 'lucide-react';
import type { EquipmentItem, Weapon, Armor } from 'open20-core';
import { Text, Badge, cn } from '@open20/ui';

export interface EquipmentCardProps {
  item: EquipmentItem;
  onToggleEquip: () => void;
  onRemove: () => void;
  className?: string;
}

/** Extract a human-readable key stat from the item. */
function keyStat(item: EquipmentItem): string | null {
  switch (item.type) {
    case 'weapon': {
      const w = item as Weapon;
      const dice = w.damage?.entries[0]?.dice;
      if (dice) {
        const ability = w.damage.ability.slice(0, 3).toUpperCase();
        return `${dice} ${ability}`;
      }
      return null;
    }
    case 'armor': {
      const a = item as Armor;
      return `AC ${a.ac}`;
    }
    default:
      return item.weight > 0 ? `${item.weight} lb` : null;
  }
}

function typeLabel(type: EquipmentItem['type']): string {
  switch (type) {
    case 'weapon':
      return 'Weapon';
    case 'armor':
      return 'Armor';
    case 'gears':
      return 'Gear';
    case 'consumable':
      return 'Consumable';
  }
}

export function EquipmentCard({ item, onToggleEquip, onRemove, className }: EquipmentCardProps) {
  const stat = keyStat(item);

  return (
    <div className={cn('flex items-center gap-3 rounded-lg bg-bg-tertiary p-2.5', className)}>
      {/* Equipped toggle — visual check/empty circle */}
      <button
        type="button"
        onClick={onToggleEquip}
        aria-label={item.equipped ? `Unequip ${item.name}` : `Equip ${item.name}`}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
          item.equipped
            ? 'bg-success/20 text-success'
            : 'bg-bg-secondary text-text-tertiary hover:text-text-secondary',
          'focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:outline-none',
        )}
      >
        {item.equipped ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Circle className="h-4 w-4" aria-hidden="true" />
        )}
      </button>

      {/* Item info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Text variant="bodySm" weight="medium" className="truncate">
            {item.name}
          </Text>
          <Badge variant="secondary" className="shrink-0 text-[10px] uppercase">
            {typeLabel(item.type)}
          </Badge>
        </div>
        {stat && (
          <Text variant="bodySm" color="secondary">
            {stat}
          </Text>
        )}
      </div>

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${item.name}`}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
          'text-text-tertiary hover:text-danger hover:bg-danger/10',
          'focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:outline-none',
        )}
      >
        <Trash2 className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
