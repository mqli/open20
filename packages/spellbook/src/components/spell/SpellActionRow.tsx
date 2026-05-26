import type { Spell } from 'open20-core';
import {
  DamageIcon,
  HealIcon,
  MagicIcon,
  AttackIcon,
  CastSpellIcon,
} from '@open20/ui';
import type { SpellLevel, SpellSlotEntry } from 'open20-core/types';
import { Button } from '@open20/ui';
import { CastLevelSelect } from './CastLevelSelect';

const SPELL_LEVEL_LABELS = ['Cantrip', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];

interface DamageEntry {
  readonly dice: string;
  readonly type?: string;
}

interface SpellActionRowProps {
  spell: Spell;
  isIconStyle: boolean;
  showCastAction: boolean;
  showAttackAction: boolean;
  showDamageActions: boolean;
  hasDamageEntries: boolean;
  hasHealEntry: boolean;
  effectiveDamageEntries: readonly DamageEntry[];
  healDice?: string;
  availableCastLevels: SpellLevel[];
  effectiveCastLevel: SpellLevel;
  selectedCastLevel: SpellLevel;
  onCastLevelChange: (level: SpellLevel) => void;
  spellAttackBonus: number;
  spellSlots: Record<SpellLevel, SpellSlotEntry> | undefined;
  onCast: () => void;
  onAttackRoll: () => void;
  onDamageRoll: (index: number) => void;
  onHealRoll: () => void;
}

export function SpellActionRow({
  spell,
  isIconStyle,
  showCastAction,
  showAttackAction,
  showDamageActions,
  hasDamageEntries,
  hasHealEntry,
  effectiveDamageEntries,
  healDice,
  availableCastLevels,
  effectiveCastLevel,
  selectedCastLevel,
  onCastLevelChange,
  spellAttackBonus,
  spellSlots,
  onCast,
  onAttackRoll,
  onDamageRoll,
  onHealRoll,
}: SpellActionRowProps) {
  const showsUpcastSelect = spell.level > 0 && availableCastLevels.length > 1 && (showCastAction || showDamageActions);
  const showsStaticLevel = spell.level > 0 && availableCastLevels.length === 1 && (showCastAction || showDamageActions);
  const staticLevelSlot = spellSlots?.[effectiveCastLevel];
  const staticLevelRemaining = staticLevelSlot ? staticLevelSlot.total - staticLevelSlot.used : 0;

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {showCastAction && (
        isIconStyle ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCast}
            title={`Cast at ${SPELL_LEVEL_LABELS[effectiveCastLevel]}`}
            disabled={!availableCastLevels.includes(effectiveCastLevel)}
            className="p-1.5"
          >
            <CastSpellIcon size="xs" />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={onCast}
            disabled={!availableCastLevels.includes(effectiveCastLevel)}
          >
            <MagicIcon size="xs" className="mr-1" />
            Cast
          </Button>
        )
      )}

      {showsUpcastSelect ? (
        <CastLevelSelect
          selectedCastLevel={selectedCastLevel}
          onCastLevelChange={onCastLevelChange}
          availableCastLevels={availableCastLevels}
          spellSlots={spellSlots}
          className={isIconStyle
            ? 'h-5 px-1 text-[10px] border-0 bg-transparent hover:bg-bg-secondary w-auto'
            : 'h-auto py-1 px-2 border-input bg-background hover:bg-accent text-sm w-auto'
          }
        />
      ) : showsStaticLevel ? (
        <span className={isIconStyle
          ? 'h-5 px-1 text-[10px] w-auto inline-flex items-center text-text-muted'
          : 'h-auto py-1 px-2 text-sm w-auto inline-flex items-center text-text-muted'
        }>
          {SPELL_LEVEL_LABELS[effectiveCastLevel]} ({staticLevelRemaining})
        </span>
      ) : null}

      {showAttackAction && spell.attack && (
        isIconStyle ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAttackRoll}
            title="Roll Attack"
            className="p-1.5"
          >
            <AttackIcon size="xs" />
          </Button>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            onClick={onAttackRoll}
          >
            <AttackIcon size="sm" className="mr-1.5" />
            Attack {spellAttackBonus >= 0 ? `+${spellAttackBonus}` : spellAttackBonus}
          </Button>
        )
      )}

      {showDamageActions && (hasDamageEntries || hasHealEntry) && (
        isIconStyle ? (
          <>
            {hasDamageEntries && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDamageRoll(0)}
                  title="Roll Damage"
                  className="p-1.5"
                >
                  <DamageIcon size="xs" />
                </Button>
                {effectiveDamageEntries.slice(1).map((entry, index) => (
                  <Button
                    key={`alt-damage-${index}-${entry.dice}-${entry.type ?? 'none'}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => onDamageRoll(index + 1)}
                    title={`Roll ${entry.dice} ${entry.type} Damage`}
                    className="p-1.5 text-[10px] font-bold"
                  >
                    {entry.dice}
                  </Button>
                ))}
              </>
            )}
            {hasHealEntry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onHealRoll}
                title={healDice ? `Roll ${healDice} Healing` : 'Roll Healing'}
                className="p-1.5"
              >
                <HealIcon size="xs" />
              </Button>
            )}
          </>
        ) : (
          <>
            {hasDamageEntries && effectiveDamageEntries.map((entry, index) => (
              <Button
                key={`${entry.dice}-${entry.type ?? 'none'}-${index}`}
                variant="outline"
                size="sm"
                onClick={() => onDamageRoll(index)}
              >
                {entry.dice} {entry.type}
              </Button>
            ))}
            {hasHealEntry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onHealRoll}
              >
                <HealIcon size="sm" className="mr-1.5" />
                {healDice ? `${healDice} Heal` : 'Heal'}
              </Button>
            )}
          </>
        )
      )}
    </div>
  );
}
