import { Shield, Zap, Flame, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Surface } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { useCharacterStore } from '@/stores/character-store';
import { useRollStore } from '@/stores/roll-store';
import { characterService } from '@/core/character-service';
import type { Spell } from '@/core/types';

interface SpellEntryProps {
  spell: Spell;
  classId: string;
  alwaysPrepared: string[];
  onSelectSpell: (spell: Spell) => void;
  onCloseSheet: (open: boolean) => void;
}

export function SpellEntry({
  spell, alwaysPrepared, onSelectSpell, onCloseSheet,
}: SpellEntryProps) {
  const isAlwaysPrepared = alwaysPrepared.includes(spell.id);

  const activeCharacter = useCharacterStore(s => s.activeCharacter);
  const castSpell = useCharacterStore(s => s.castSpell);
  const startConcentration = useCharacterStore(s => s.startConcentration);
  const endConcentration = useCharacterStore(s => s.endConcentration);
  const addRoll = useRollStore(s => s.addRoll);

  const handleCast = () => {
    castSpell(spell.id, spell.level);
  };

  const hasDamage = spell.damage?.entries && spell.damage.entries.length > 0;

  const handleRollDamage = (index: number = 0) => {
    if (!activeCharacter || !hasDamage) return;
    const result = characterService.rollSpellDamage(activeCharacter, spell.id, index);
    const expression = result.entries
      .map(e => `${e.count}${e.die}${e.type ? ` (${e.type})` : ''}`)
      .join(' + ');
    const modExpr = result.modifiers.length > 0
      ? ` + ${result.modifiers.reduce((s, m) => s + m.value, 0)}`
      : '';
    addRoll({
      label: `Damage: ${spell.name}`,
      expression: `${expression}${modExpr}`,
      total: result.total,
    });
  };

  return (
    <Surface
      variant="default"
      className={`
        group flex items-center justify-between p-2 pl-3 rounded-lg border transition-all cursor-pointer
        ${isAlwaysPrepared
          ? 'bg-primary-50 border-primary-100 shadow-sm'
          : 'bg-bg-secondary border-border hover:border-primary-200'}
        ${isAlwaysPrepared ? 'ring-1 ring-info/30 bg-info/5' : ''}
      `}
      onClick={() => {
        onSelectSpell(spell);
        onCloseSheet(false);
      }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <Text as="div" weight="bold" className={`truncate ${isAlwaysPrepared ? 'text-primary-700' : 'text-text-primary'}`}>
            {spell.name}
          </Text>
          {isAlwaysPrepared && (
            <Shield className="w-2.5 h-2.5 text-info fill-current opacity-60" />
          )}
        </div>
        <Text as="div" variant="caption" className="uppercase tracking-tight">
          {spell.school} • {spell.castingTime}
        </Text>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleCast();
          }}
          title="Cast Spell"
          className="p-1.5"
        >
          <Zap className="w-3 h-3" />
        </Button>

        {hasDamage && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleRollDamage();
          }}
          title="Roll Damage"
          className="p-1.5"
        >
          <Flame className="w-3 h-3" />
        </Button>
        )}
        {hasDamage && spell.damage.entries.slice(1).map((entry, i) => (
          <Button
            key={entry.dice + entry.type}
            variant="ghost"
            size="sm"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              handleRollDamage(i + 1);
            }}
            title={`Roll ${entry.dice} ${entry.type} Damage`}
            className="p-1.5 text-[10px] font-bold"
          >
            {entry.dice}
          </Button>
        ))}

        {/* Concentration toggle — only if spell requires it */}
        {spell.concentration && activeCharacter && (() => {
          const isConcentratingOnThis = activeCharacter.conditions.some(
            c => c.id === 'Concentrating' && (c as any).source === spell.id
          );
          return (
            <Button
              variant={isConcentratingOnThis ? "warning" : "ghost"}
              size="sm"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                if (isConcentratingOnThis) {
                  endConcentration();
                } else {
                  startConcentration(spell.id);
                }
              }}
              title={isConcentratingOnThis ? 'End Concentration' : 'Start Concentration'}
              className="p-1.5"
            >
              <Activity className="w-3 h-3" />
            </Button>
          );
        })()}
      </div>
    </Surface>
  );
}
