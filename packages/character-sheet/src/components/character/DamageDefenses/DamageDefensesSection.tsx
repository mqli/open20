// DamageDefensesSection.tsx — T-210
// Displays three groups from character.damageDefenses:
// Resistances (Shield), Immunities (ShieldCheck), Vulnerabilities (ShieldOff).
// Each group shows dismissible damage-type badges, plus an Add dropdown
// to toggle damage types on/off. NFR-01: icons provide non-colour cues.

import { useState } from 'react';
import { Shield, ShieldCheck, ShieldOff, Plus, X } from 'lucide-react';
import type { DamageDefenses, DamageType } from 'open20-core';
import { ALL_DAMAGE_TYPES } from 'open20-core';
import { Text, Badge, Button, DropdownMenu, Surface, cn } from '@open20/ui';

export interface DamageDefensesSectionProps {
  defenses: DamageDefenses;
  onToggle: (
    category: 'resistances' | 'immunities' | 'vulnerabilities',
    damageType: DamageType,
  ) => void;
  className?: string;
}

interface GroupDef {
  key: 'resistances' | 'immunities' | 'vulnerabilities';
  label: string;
  icon: typeof Shield;
  variant: 'success' | 'info' | 'danger';
}

const GROUPS: GroupDef[] = [
  { key: 'resistances', label: 'Resistances', icon: Shield, variant: 'success' },
  { key: 'immunities', label: 'Immunities', icon: ShieldCheck, variant: 'info' },
  { key: 'vulnerabilities', label: 'Vulnerabilities', icon: ShieldOff, variant: 'danger' },
];

export function DamageDefensesSection({
  defenses,
  onToggle,
  className,
}: DamageDefensesSectionProps) {
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

                {/* Add dropdown */}
                <AddDropdown
                  group={g.key}
                  activeTypes={new Set(items)}
                  onSelect={(type) => onToggle(g.key, type)}
                />
              </div>

              {hasItems ? (
                <div className="flex flex-wrap gap-1">
                  {items.map((type) => (
                    <Badge
                      key={type}
                      variant={g.variant}
                      className="cursor-pointer"
                      onClick={() => onToggle(g.key, type)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Remove ${type}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onToggle(g.key, type);
                        }
                      }}
                    >
                      {type}
                      <X className="ml-1 h-3 w-3 opacity-70" />
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

// ─── AddDropdown ────────────────────────────────────────────

function AddDropdown({
  group,
  activeTypes,
  onSelect,
}: {
  group: string;
  activeTypes: Set<DamageType>;
  onSelect: (type: DamageType) => void;
}) {
  const [open, setOpen] = useState(false);

  const available = ALL_DAMAGE_TYPES.filter((t) => !activeTypes.has(t));

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost" size="sm" className="-m-1 h-7 w-7 p-0" aria-label={`Add ${group}`}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start" className="w-44">
        {available.length === 0 ? (
          <DropdownMenu.Label>
            <Text variant="bodySm" color="secondary">
              All types active
            </Text>
          </DropdownMenu.Label>
        ) : (
          available.map((type) => (
            <DropdownMenu.Item
              key={type}
              onSelect={() => {
                onSelect(type);
                setOpen(false);
              }}
            >
              {type}
            </DropdownMenu.Item>
          ))
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
