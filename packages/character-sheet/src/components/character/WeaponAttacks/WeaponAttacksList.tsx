// WeaponAttacksList.tsx (T-110)
// Renders the weapon attack list from character.combatStats.attacks.
// Each attack uses WeaponAttackCard with a RollModifierRow for dual-roll.
// Bottom "+ Add Weapon" placeholder button (wired to T-203 later).

import { Plus } from 'lucide-react';
import type { AppCharacter } from '@/types';
import { Surface, Text, EmptyState, Button } from '@open20/ui';
import { Divider } from '@open20/ui';

import { WeaponAttackCard } from './WeaponAttackCard';
import { rollWeaponAttack } from '@/core/roll-adapter';
import type { RollModifierType } from '@/core/roll-adapter';

export interface WeaponAttacksListProps {
  character: AppCharacter;
  className?: string;
}

export function WeaponAttacksList({ character, className }: WeaponAttacksListProps) {
  const attacks = character.combatStats.attacks;

  // Empty state
  if (attacks.length === 0) {
    return (
      <div className={className}>
        <Surface variant="default" padding="sm" className="flex items-center justify-center">
          <EmptyState
            title="No weapon attacks"
            description="Equip a weapon to see attack options here."
          />
        </Surface>
      </div>
    );
  }

  return (
    <div className={className}>
      <Surface variant="default" padding="sm">
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 pb-1.5">
            <Text variant="labelSm" color="secondary" className="uppercase tracking-wider">
              Weapon Attacks
            </Text>
            <Text variant="labelSm" color="tertiary">
              ({attacks.length})
            </Text>
          </div>

          <Divider className="mb-1" />

          {/* Attack rows */}
          {attacks.map((attack, i) => (
            <WeaponAttackCard
              key={`${attack.name}-${i}`}
              attack={attack}
              character={character}
              onRoll={(mod: RollModifierType) => rollWeaponAttack(character, attack, mod)}
            />
          ))}

          <Divider className="my-1" />

          {/* "+ Add Weapon" placeholder */}
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-text-secondary hover:text-text-primary"
            aria-label="Add weapon"
          >
            <Plus className="h-4 w-4" />
            <Text variant="labelSm">Add Weapon</Text>
          </Button>
        </div>
      </Surface>
    </div>
  );
}
