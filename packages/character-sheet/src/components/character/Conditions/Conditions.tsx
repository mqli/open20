// Conditions.tsx — T-207
// ConditionChip (dismissible warning badge) + AddConditionMenu (dropdown of
// 14 conditions minus Exhaustion, w/ SRD glossary descriptions).

import { useMemo, useState } from 'react';
import { X, Plus } from 'lucide-react';
import type { ConditionName, ActiveCondition } from 'open20-core';
import { Text, Button, Badge, cn, DropdownMenu } from '@open20/ui';
import { srdContentPack } from '@open20/content-srd';
import { getGlossaryEntriesByTag } from '@open20/content-srd/query/glossary';

// ─── Helpers ───────────────────────────────────────────────

const EXCLUDED: ConditionName = 'Exhaustion';

const CONDITION_NAMES: ConditionName[] = [
  'Blinded',
  'Charmed',
  'Deafened',
  'Frightened',
  'Grappled',
  'Incapacitated',
  'Invisible',
  'Paralyzed',
  'Petrified',
  'Poisoned',
  'Prone',
  'Restrained',
  'Stunned',
  'Unconscious',
];

function useConditionDescriptions(): Record<ConditionName, string> {
  return useMemo(() => {
    const entries = getGlossaryEntriesByTag('Condition', srdContentPack);
    const map: Record<string, string> = {};
    for (const entry of entries) {
      // Combine one-line summary + subsection titles into a short description
      const summary = entry.content?.[0] ?? '';
      const effects = entry.subsections?.map((s) => s.title) ?? [];
      const all = [summary, ...effects].filter(Boolean);
      map[entry.name] = all.join(' ');
    }
    return map as Record<ConditionName, string>;
  }, []);
}

// ─── ConditionChip ──────────���──────────────────────────────

export interface ConditionChipProps {
  condition: ActiveCondition;
  description?: string;
  onDismiss: () => void;
  className?: string;
}

export function ConditionChip({
  condition,
  description,
  onDismiss,
  className,
}: ConditionChipProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1',
        className,
      )}
      title={description}
    >
      {/* Non-color cue: condition name as text (NFR-01) */}
      <Text variant="bodySm" weight="medium" className="text-warning">
        {condition.id}
      </Text>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label={`Remove ${condition.id}`}
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-full',
          'text-warning/70 hover:text-warning hover:bg-warning/20',
          'focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:outline-none',
        )}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

// ─── AddConditionMenu ──────────────────────────────────────

export interface AddConditionMenuProps {
  activeIds: Set<ConditionName>;
  onToggle: (id: ConditionName) => void;
  className?: string;
}

export function AddConditionMenu({ activeIds, onToggle, className }: AddConditionMenuProps) {
  const [open, setOpen] = useState(false);
  const descriptions = useConditionDescriptions();

  const available = CONDITION_NAMES.filter((name) => !activeIds.has(name));

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn('gap-1', className)}
          aria-label="Add condition"
        >
          <Plus className="h-4 w-4" />
          <Text variant="bodySm">Add</Text>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align="start" className="max-h-[320px] w-72 overflow-y-auto">
        {available.length === 0 ? (
          <DropdownMenu.Label>
            <Text variant="bodySm" color="secondary">
              All conditions active
            </Text>
          </DropdownMenu.Label>
        ) : (
          available.map((name) => {
            const desc = descriptions[name];
            return (
              <DropdownMenu.Item
                key={name}
                onSelect={() => {
                  onToggle(name);
                  setOpen(false);
                }}
              >
                <div className="flex flex-col gap-0.5 py-0.5">
                  <Text variant="bodySm" weight="medium">
                    {name}
                  </Text>
                  {desc && (
                    <Text variant="bodySm" color="secondary" className="line-clamp-2">
                      {desc}
                    </Text>
                  )}
                </div>
              </DropdownMenu.Item>
            );
          })
        )}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

// ─── ConditionsPanel (active chips + add button) ───────────

export interface ConditionsPanelProps {
  conditions: readonly ActiveCondition[];
  onToggle: (id: ConditionName) => void;
  className?: string;
}

export function ConditionsPanel({ conditions, onToggle, className }: ConditionsPanelProps) {
  const descriptions = useConditionDescriptions();
  const activeIds = useMemo(() => new Set(conditions.map((c) => c.id)), [conditions]);

  // Filter out Exhaustion (handled by T-208)
  const visible = conditions.filter((c) => c.id !== EXCLUDED);

  // Exhaustion active indicator (placeholder for T-208)
  const hasExhaustion = conditions.some((c) => c.id === EXCLUDED);

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <div className="flex flex-wrap items-center gap-2">
        {visible.map((c) => (
          <ConditionChip
            key={c.id}
            condition={c}
            description={descriptions[c.id]}
            onDismiss={() => onToggle(c.id)}
          />
        ))}

        {/* Exhaustion indicator (placeholder until T-208) */}
        {hasExhaustion && <Badge variant="warning">Exhaustion (T-208)</Badge>}

        <AddConditionMenu activeIds={activeIds} onToggle={onToggle} />
      </div>
    </div>
  );
}
