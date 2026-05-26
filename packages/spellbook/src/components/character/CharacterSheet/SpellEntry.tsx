import { Activity, BookOpen, Flame, Shield, Zap } from 'lucide-react';
import { Badge, Button, SpellCard as SpellCardUI } from '@open20/ui';
import { useCharacterStore } from '@/stores/character-store';
import { useRollStore } from '@/stores/roll-store';
import { useSpellStore } from '@/stores/spell-store';
import { characterService } from '@/core/character-service';
import type { Spell } from '@/core/types';

interface SpellEntryProps {
  spell: Spell;
  alwaysPrepared: string[];
}

interface ConcentrationCondition {
  id: string;
  source?: string;
}

export function SpellEntry({
  spell, alwaysPrepared,
}: SpellEntryProps) {
  const isAlwaysPrepared = alwaysPrepared.includes(spell.id);

  const selectSpell = useSpellStore(s => s.selectSpell);
  const activeCharacter = useCharacterStore(s => s.activeCharacter);
  const castSpell = useCharacterStore(s => s.castSpell);
  const startConcentration = useCharacterStore(s => s.startConcentration);
  const endConcentration = useCharacterStore(s => s.endConcentration);
  const addRoll = useRollStore(s => s.addRoll);

  const handleOpenSpell = () => {
    selectSpell(spell);
  };

  const handleCast = () => {
    castSpell(spell.id, spell.level);
  };

  const hasDamage = spell.damage?.entries && spell.damage.entries.length > 0;
  const isConcentratingOnThis =
    activeCharacter?.conditions.some((condition) => {
      if (condition.id !== 'Concentrating') return false;
      return (condition as ConcentrationCondition).source === spell.id;
    }) ?? false;

  const surfaceVariant = isConcentratingOnThis
    ? 'warning'
    : isAlwaysPrepared
      ? 'info'
      : 'default';

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
    <SpellCardUI
      spell={spell}
      density="compact"
      showDescription={false}
      surfaceVariant={surfaceVariant}
      glow={isAlwaysPrepared}
      renderBadges={() => (
        <>
          {isAlwaysPrepared && (
            <Badge variant="info" size="sm">
              <Shield className="w-3 h-3 mr-1" />
              Always
            </Badge>
          )}
        </>
      )}
      renderActions={() => (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenSpell}
            title="Open Spell Details"
            className="p-1.5"
          >
            <BookOpen className="w-3 h-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCast}
            title="Cast Spell"
            className="p-1.5"
          >
            <Zap className="w-3 h-3" />
          </Button>

          {hasDamage && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRollDamage()}
              title="Roll Damage"
              className="p-1.5"
            >
              <Flame className="w-3 h-3" />
            </Button>
          )}

          {hasDamage && spell.damage.entries.slice(1).map((entry, i) => (
            <Button
              key={`alt-damage-${i}-${entry.dice}-${entry.type ?? 'none'}`}
              variant="ghost"
              size="sm"
              onClick={() => handleRollDamage(i + 1)}
              title={`Roll ${entry.dice} ${entry.type} Damage`}
              className="p-1.5 text-[10px] font-bold"
            >
              {entry.dice}
            </Button>
          ))}

          {spell.concentration && activeCharacter && (
            <Button
              variant={isConcentratingOnThis ? 'warning' : 'ghost'}
              size="sm"
              onClick={() => {
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
          )}
        </>
      )}
    />
  );
}
