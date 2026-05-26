import { Sparkles, BookOpen } from 'lucide-react';
import { Button, Surface, Text } from '@open20/ui';
import type { Spell } from 'open20-core';
import { useSpellCapabilities } from '@/hooks/useSpellCapabilities';

interface SpellActionPanelProps {
  spell: Spell;
  onCast: () => void;
  onAttackRoll: () => void;
  onDamageRoll: (index: number, label: string) => void;
  onPrepareToggle: () => void;
}

export function SpellActionPanel({
  spell,
  onCast,
  onAttackRoll,
  onDamageRoll,
  onPrepareToggle,
}: SpellActionPanelProps) {
  const caps = useSpellCapabilities(spell);
  const { isPrepared, canCast, showPrepareButton, spellAttackBonus, preparedCount, maxPrepared } = caps;

  return (
    <Surface variant="tint" padding="lg" className="mb-8 flex flex-wrap gap-4 items-center">
      <Text size="sm" weight="black" className="uppercase tracking-widest mr-2 text-primary-700">Quick Actions</Text>

      {showPrepareButton && (
        <Button
          variant={isPrepared ? 'primary' : 'outline'}
          size="sm"
          onClick={onPrepareToggle}
        >
          <BookOpen className="w-3.5 h-3.5 mr-2" />
          {isPrepared ? 'Prepared ✓' : 'Prepare'}
          {maxPrepared > 0 && (
            <Text size="xs" className="opacity-80 ml-1.5">({preparedCount}/{maxPrepared})</Text>
          )}
        </Button>
      )}

      <Button
        variant="primary"
        size="sm"
        onClick={onCast}
        disabled={!canCast}
      >
        <Sparkles className="w-3.5 h-3.5 mr-2" />
        Cast Spell {spell.level > 0 && `(Level ${spell.level})`}
      </Button>

      {spell.attack && (
        <Button
          variant="primary"
          size="sm"
          className="shadow-lg shadow-primary-500/20"
          onClick={onAttackRoll}
        >
          Roll Attack (+{spellAttackBonus})
        </Button>
      )}

      {spell.damage?.entries.map((entry, i) => (
        <Button
          key={`${entry.dice}-${entry.type}`}
          variant="outline"
          size="sm"
          onClick={() => onDamageRoll(i, `${entry.type} Damage`)}
        >
          Roll {entry.dice} {entry.type}
        </Button>
      ))}
    </Surface>
  );
}
