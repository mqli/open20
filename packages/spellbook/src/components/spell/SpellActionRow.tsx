import type { Spell } from 'open20-core';
import { DamageIcon, HealIcon, MagicIcon, AttackIcon } from '@open20/ui';
import type { SpellLevel, SpellSlotEntry } from 'open20-core/types';
import { Button } from '@open20/ui';
import { CastLevelSelect } from './CastLevelSelect';
import { useTranslation } from '@open20/ui';
import { Divider } from '@open20/ui';

const SPELL_LEVEL_LABELS = [
  'cantripLevel',
  'firstLevel',
  'secondLevel',
  'thirdLevel',
  'fourthLevel',
  'fifthLevel',
  'sixthLevel',
  'seventhLevel',
  'eighthLevel',
  'ninthLevel',
];

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
  isPrepared: boolean;
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
  onDamageRoll: () => void;
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
  isPrepared,
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
  const t = useTranslation();
  const showsUpcastSelect =
    spell.level > 0 && availableCastLevels.length > 1 && (showCastAction || showDamageActions);
  const staticLevelSlot = spellSlots?.[effectiveCastLevel];
  const staticLevelRemaining = staticLevelSlot ? staticLevelSlot.total - staticLevelSlot.used : 0;
  const buttonVariant = isIconStyle ? 'ghost' : 'primary';
  const buttonClass = isIconStyle ? 'p-1.5' : undefined;
  const iconClass = isIconStyle ? undefined : 'mr-1';
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {showCastAction && (
        <Button
          variant={buttonVariant}
          size="sm"
          onClick={onCast}
          title={`${t('cast')} ${t(SPELL_LEVEL_LABELS[effectiveCastLevel])}`}
          disabled={!isPrepared || !availableCastLevels.includes(effectiveCastLevel)}
          className={buttonClass}
        >
          <MagicIcon size="xs" className={iconClass} />
          {!isIconStyle && (
            <>
              {t('cast')}
              {!showsUpcastSelect && (
                <>
                  {t(SPELL_LEVEL_LABELS[effectiveCastLevel])} ({staticLevelRemaining})
                </>
              )}
            </>
          )}
        </Button>
      )}
      {showsUpcastSelect ? (
        <CastLevelSelect
          selectedCastLevel={selectedCastLevel}
          onCastLevelChange={onCastLevelChange}
          availableCastLevels={availableCastLevels}
          spellSlots={spellSlots}
          className={
            isIconStyle
              ? 'h-5 px-1 text-[10px] border-0 bg-transparent hover:bg-bg-secondary w-auto'
              : 'h-auto py-1 px-2 border-input bg-background hover:bg-accent text-sm w-auto'
          }
        />
      ) : null}

      {showAttackAction && spell.attack && (
        <Button
          variant={buttonVariant}
          size="sm"
          onClick={onAttackRoll}
          title={t('rollAttack')}
          className={buttonClass}
        >
          <AttackIcon size="xs" className={iconClass} />
          <>
            {t('attack')}
            {!isIconStyle && (spellAttackBonus >= 0 ? `+${spellAttackBonus}` : spellAttackBonus)}
          </>
        </Button>
      )}

      {showDamageActions && hasDamageEntries && (
        <>
          <Button
            variant={buttonVariant}
            size="sm"
            onClick={onDamageRoll}
            title={t('rollDamage')}
            className={buttonClass}
          >
            <DamageIcon size="xs" className={iconClass} />
            <>
              {!isIconStyle &&
                effectiveDamageEntries.map((entry, index) => (
                  <>
                    {index !== 0 && <Divider orientation="vertical" size="sm" className="m-1" />}
                    <span key={`${entry.dice}-${entry.type ?? 'none'}-${index}`}>
                      {entry.dice} {entry.type}
                    </span>
                  </>
                ))}
            </>
          </Button>
        </>
      )}
      {showDamageActions && hasHealEntry && (
        <Button
          variant={buttonVariant}
          size="sm"
          onClick={onHealRoll}
          title={
            healDice
              ? `${t('rollDamageOfType', { type: t('healingRoll') })} ${healDice}`
              : t('rollHealing')
          }
          className={buttonClass}
        >
          <HealIcon size="xs" className={iconClass} />
          {!isIconStyle && <>{healDice ? `${healDice} ${t('healing')}` : t('healing')}</>}
        </Button>
      )}
    </div>
  );
}
