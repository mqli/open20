// CharacterSelector.tsx (T-119)
// Modal dialog listing all saved characters. Self-contained: reads from
// useCharacterStore directly. Active character highlighted with primary left border.
// Supports switch, create new, and delete with confirmation.

import { useState } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import type { AppCharacter } from '@/types';
import { useCharacterStore } from '@/stores/characterStore';
import { getClassName } from '@/core/content-resolver';
import { Button, Text, Surface, Dialog, cn } from '@open20/ui';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

export interface CharacterSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Ask the host to open the create wizard (T-120) — rendered as a sibling dialog. */
  onRequestCreate: () => void;
}

function CharacterCard({
  char,
  isActive,
  onSelect,
  onDelete,
}: {
  char: AppCharacter;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const classes = char.classes ?? [];
  const totalLevel = classes.reduce((sum, c) => sum + c.level, 0);
  const classLabel = classes.map((c) => getClassName(c.classId)).join(' / ') || 'Unknown';
  const hitPoints = char.hitPoints ?? {
    current: 0,
    max: 0,
    temporary: 0,
    deathSaves: { successes: 0, failures: 0, isStable: false },
  };
  const combatStats = char.combatStats ?? {
    AC: 0,
    initiative: 0,
    speed: 0,
    passivePerception: 0,
    proficiencyBonus: 0,
    attacks: [],
  };

  return (
    <Surface
      variant="default"
      padding="md"
      className={cn(
        'cursor-pointer border-l-[3px] transition-colors',
        isActive
          ? 'border-l-primary-600 bg-primary-50 dark:bg-primary-900/10'
          : 'border-l-transparent hover:bg-bg-tertiary',
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      aria-label={`Select ${char.name}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Text variant="body" weight="bold" className="truncate">
            {char.name}
          </Text>
          <Text variant="bodySm" color="secondary" className="truncate">
            Lv.{totalLevel} {classLabel}
          </Text>

          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
            <Text variant="bodySm" color="secondary" className="tabular-nums">
              HP {hitPoints.current}/{hitPoints.max}
            </Text>
            <Text variant="bodySm" color="secondary" className="tabular-nums">
              AC {combatStats.AC}
            </Text>
            <Text variant="bodySm" color="secondary" className="tabular-nums">
              PP {combatStats.passivePerception}
            </Text>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {isActive && (
            <Text variant="labelSm" className="text-primary-600">
              Active
            </Text>
          )}
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Delete ${char.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Surface>
  );
}

export function CharacterSelector({ open, onOpenChange, onRequestCreate }: CharacterSelectorProps) {
  const characters = useCharacterStore((s) => s.characters);
  const activeId = useCharacterStore((s) => s.activeCharacterId);
  const setActiveCharacter = useCharacterStore((s) => s.setActiveCharacter);
  const deleteCharacter = useCharacterStore((s) => s.deleteCharacter);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const charList = Object.values(characters);
  const deleteTarget = deleteTargetId ? characters[deleteTargetId] : null;

  const handleSelect = (id: string) => {
    setActiveCharacter(id);
    onOpenChange(false);
  };

  // Close first: the wizard is a sibling dialog, never nested (stacked Radix
  // focus traps misbehave).
  const handleNew = () => {
    onOpenChange(false);
    onRequestCreate();
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteTargetId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      deleteCharacter(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Content size="sm">
          <Dialog.Header>
            <Dialog.Title>Characters</Dialog.Title>
            <Dialog.Description>Select a character or create a new one.</Dialog.Description>
          </Dialog.Header>

          <div className="mb-4 flex justify-end">
            <Button variant="primary" size="sm" onClick={handleNew}>
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>

          {charList.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <User className="h-10 w-10 text-text-tertiary" aria-hidden="true" />
              <Text variant="body" color="secondary">
                No characters yet. Create one to get started.
              </Text>
            </div>
          ) : (
            <div className="flex flex-col gap-2 mb-4 max-h-[60vh] overflow-y-auto">
              {charList.map((char) => (
                <CharacterCard
                  key={char.id}
                  char={char}
                  isActive={char.id === activeId}
                  onSelect={() => handleSelect(char.id)}
                  onDelete={() => handleDeleteRequest(char.id)}
                />
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Dialog.Close asChild>
              <Button variant="ghost">Done</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Root>

      {deleteTarget && (
        <DeleteConfirmDialog
          open
          onOpenChange={(isOpen) => {
            if (!isOpen) setDeleteTargetId(null);
          }}
          onConfirm={handleDeleteConfirm}
          characterName={deleteTarget.name}
        />
      )}
    </>
  );
}
