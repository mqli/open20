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
  const showsStaticLevel =
    spell.level > 0 && availableCastLevels.length === 1 && (showCastAction || showDamageActions);
  const staticLevelSlot = spellSlots?.[effectiveCastLevel];
  const staticLevelRemaining = staticLevelSlot ? staticLevelSlot.total - staticLevelSlot.used : 0;

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {showCastAction &&
        (isIconStyle ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCast}
            title={`${t('cast')} ${t(SPELL_LEVEL_LABELS[effectiveCastLevel] as keyof typeof t)}`}
            disabled={!availableCastLevels.includes(effectiveCastLevel)}
            className="p-1.5"
          >
            <MagicIcon size="xs" />
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={onCast}
            disabled={!availableCastLevels.includes(effectiveCastLevel)}
          >
            <MagicIcon size="xs" className="mr-1" />
            {t('cast')}
          </Button>
        ))}

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
      ) : showsStaticLevel ? (
        <span
          className={
            isIconStyle
              ? 'h-5 px-1 text-[10px] w-auto inline-flex items-center text-text-muted'
              : 'h-auto py-1 px-2 text-sm w-auto inline-flex items-center text-text-muted'
          }
        >
          {t(SPELL_LEVEL_LABELS[effectiveCastLevel] as keyof typeof t)} ({staticLevelRemaining})
        </span>
      ) : null}

      {showAttackAction &&
        spell.attack &&
        (isIconStyle ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAttackRoll}
            title={t('rollAttack')}
            className="p-1.5"
          >
            <AttackIcon size="xs" />
          </Button>
        ) : (
          <Button variant="secondary" size="sm" onClick={onAttackRoll}>
            <AttackIcon size="sm" className="mr-1.5" />
            {t('attack')} {spellAttackBonus >= 0 ? `+${spellAttackBonus}` : spellAttackBonus}
          </Button>
        ))}

      {showDamageActions &&
        (hasDamageEntries || hasHealEntry) &&
        (isIconStyle ? (
          <>
            {hasDamageEntries && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDamageRoll}
                  title={t('rollDamage')}
                  className="p-1.5"
                >
                  <DamageIcon size="xs" />
                </Button>
              </>
            )}
            {hasHealEntry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onHealRoll}
                title={
                  healDice
                    ? `${t('rollDamageOfType', { type: t('healingRoll') })} ${healDice}`
                    : t('rollHealing')
                }
                className="p-1.5"
              >
                <HealIcon size="xs" />
              </Button>
            )}
          </>
        ) : (
          <>
            {hasDamageEntries && (
              <Button variant="outline" size="sm" onClick={onDamageRoll}>
                <DamageIcon size="xs" className="mr-1.5" />
                {effectiveDamageEntries.map((entry, index) => (
                  <>
                    {index !== 0 && <Divider orientation="vertical" size="sm" className="m-1" />}
                    <span key={`${entry.dice}-${entry.type ?? 'none'}-${index}`}>
                      {entry.dice} {entry.type}
                    </span>
                  </>
                ))}
              </Button>
            )}
            {hasHealEntry && (
              <Button variant="outline" size="sm" onClick={onHealRoll}>
                <HealIcon size="sm" className="mr-1.5" />
                {healDice ? `${healDice} ${t('healing')}` : t('healing')}
              </Button>
            )}
          </>
        ))}
    </div>
  );
}
