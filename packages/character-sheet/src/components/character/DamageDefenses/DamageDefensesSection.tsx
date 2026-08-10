// DamageDefensesSection.tsx — T-210
// Displays three groups from character.damageDefenses:
// Resistances (Shield), Immunities (ShieldCheck), Vulnerabilities (ShieldOff).
// Each group shows damage-type badges or "(none)" when empty.
// NFR-01: icons provide non-colour cues.

import { Shield, ShieldCheck, ShieldOff } from 'lucide-react';
import type { DamageDefenses, DamageType } from 'open20-core';
import { Text, Badge, Surface, cn } from '@open20/ui';

export interface DamageDefensesSectionProps {
  defenses: DamageDefenses;
  className?: string;
}

interface GroupDef {
  key: keyof DamageDefenses;
  label: string;
  icon: typeof Shield;
  variant: 'success' | 'info' | 'danger';
}

const GROUPS: GroupDef[] = [
  { key: 'resistances', label: 'Resistances', icon: Shield, variant: 'success' },
  { key: 'immunities', label: 'Immunities', icon: ShieldCheck, variant: 'info' },
  { key: 'vulnerabilities', label: 'Vulnerabilities', icon: ShieldOff, variant: 'danger' },
];

function damageTypeBadge(type: DamageType): string {
  return type;
}

export function DamageDefensesSection({ defenses, className }: DamageDefensesSectionProps) {
  return (
    <Surface variant="default" padding="sm" className={cn(className)}>
      <div className="flex flex-col gap-3">
        {GROUPS.map((g) => {
          const items = defenses[g.key];
          const Icon = g.icon;
          const hasItems = items.length > 0;

          return (
            <div key={g.key} className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Icon
                  className={cn(
                    'h-3.5 w-3.5',
                    g.variant === 'success' && 'text-success',
                    g.variant === 'info' && 'text-info',
                    g.variant === 'danger' && 'text-danger',
                  )}
                  aria-hidden
                />
                <Text variant="labelSm" color="secondary">
                  {g.label}
                </Text>
              </div>

              {hasItems ? (
                <div className="flex flex-wrap gap-1">
                  {items.map((type) => (
                    <Badge key={type} variant={g.variant}>
                      {damageTypeBadge(type)}
                    </Badge>
                  ))}
                </div>
              ) : (
                <Text variant="bodySm" color="secondary">
                  (none)
                </Text>
              )}
            </div>
          );
        })}
      </div>
    </Surface>
  );
}
