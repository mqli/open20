import {
  Badge,
  Surface,
  Text,
  DefenseIcon,
  ConcentrationIcon,
  AttackIcon,
  SlotPips,
  Divider,
} from '@open20/ui';
import { spellService } from '@/core/spell-service';
import { RulesService } from '@/core/rules-service';
import { getCasterTypeForClass, sortSpells } from 'open20-core/spells';
import { rollSpellAttack, defaultRandom } from 'open20-core';
import type { Character } from 'open20-core/types';
import { resolveDeps } from '@/core/content-resolver';
import { useCharacterStore } from '@/stores/characterStore';
import { useSpellStore } from '@/stores/spellStore';
import { useSpellCapabilities } from '@/hooks/useSpellCapabilities';
import { useRollStore } from '@/stores/rollStore';
import type { SpellLevel, Spell, SpellSlotEntry } from 'open20-core/types';
import { useTranslation } from '@/i18n';

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

interface ClassSpellSectionProps {
  classId: string;
}

export function ClassSpellSection({ classId }: ClassSpellSectionProps) {
  const { activeCharacter, consumeSpellSlot, recoverSpellSlot } = useCharacterStore();
  const { selectSpell } = useSpellStore();
  // All hooks must be called before any early returns
  const classData = activeCharacter?.spells.classSpellcasting[classId];

  // Early returns after all hooks
  if (!activeCharacter) return null;
  if (!classData) return null;

  const casterType = getCasterTypeForClass(classId, resolveDeps(activeCharacter));
  const ability = classData.spellcastingAbility;
  const stats = RulesService.getProjectedStats(activeCharacter);
  const abilityMod = stats.abilityModifiers[ability] ?? 0;
  const spellSaveDC = classData.spellSaveDC;
  const spellAttack = classData.spellAttackBonus;

  const known = [...classData.knownSpells];
  const prepared = [...classData.preparedSpells];
  const alwaysPrepared = [...(classData.alwaysPreparedSpells ?? [])];
  const allPrepared = [...prepared, ...alwaysPrepared];
  const allPreparedIds = new Set(allPrepared);
  const maxPrepared = classData.maxPrepared;

  // Only show prepared (or always-prepared) spells
  const inventorySpells = sortSpells(
    known
      .map((id) => spellService.getSpell(id))
      .filter((s): s is NonNullable<typeof s> => !!s && allPreparedIds.has(s.id)),
  );

  const spellsByLevel = inventorySpells.reduce(
    (acc, spell) => {
      const level = spell.level;
      if (!acc[level]) acc[level] = [];
      acc[level].push(spell);
      return acc;
    },
    {} as Record<number, Spell[]>,
  );

  // Merge cantrips (level 0) into spellsByLevel
  const cantripSpells = sortSpells(
    classData.knownCantrips
      .map((id) => spellService.getSpell(id))
      .filter((s): s is NonNullable<typeof s> => !!s),
    { sortBy: 'name' },
  );
  if (cantripSpells.length > 0) {
    spellsByLevel[0] = cantripSpells;
  }

  // Get spell slots for this class (for multiclass, slots are combined in activeCharacter.spells.spellSlots)
  const spellSlots =
    activeCharacter.spells.spellSlots ?? ({} as Record<SpellLevel, SpellSlotEntry>);

  const availableSpellSlots = Object.entries(spellSlots).filter(([_, { total }]) => total > 0);

  return (
    <Surface variant="default" padding="none" className="overflow-hidden">
      <div className="p-3 space-y-3">
        {/* Class Stats */}
        <SpellCastingStats
          character={activeCharacter}
          spellSaveDC={spellSaveDC}
          spellAttack={spellAttack}
          ability={ability}
          abilityMod={abilityMod}
        />
        <Divider />
        {/* Preparation Progress */}
        {casterType.canPrepare && maxPrepared != null && (
          <SpellPreparationProgress prepared={prepared} maxPrepared={maxPrepared} />
        )}
        {/* Always Prepared Spells */}
        {alwaysPrepared.length > 0 && (
          <AlwaysPreparedSpells alwaysPrepared={alwaysPrepared} selectSpell={selectSpell} />
        )}
        {/* Spell List with Inline Spell Slots (includes cantrips at level 0) */}
        <div className="space-y-4">
          {/* Cantrips (level 0) */}
          <SpellSectionByLevel
            level={0}
            total={0}
            used={0}
            alwaysPrepared={alwaysPrepared}
            spellsAtLevel={spellsByLevel[0] ?? []}
            recoverSpellSlot={recoverSpellSlot}
            consumeSpellSlot={consumeSpellSlot}
            selectSpell={selectSpell}
            maxKnown={classData.maxCantripsKnown}
          />
          {availableSpellSlots.map(([level, { total, used }]) => {
            const lvl = parseInt(level, 10) as SpellLevel;
            const spellsAtLevel = spellsByLevel[lvl] ?? [];
            return (
              <SpellSectionByLevel
                key={lvl}
                level={lvl}
                total={total}
                used={used}
                alwaysPrepared={alwaysPrepared}
                spellsAtLevel={spellsAtLevel}
                recoverSpellSlot={recoverSpellSlot}
                consumeSpellSlot={consumeSpellSlot}
                selectSpell={selectSpell}
              />
            );
          })}
        </div>
      </div>
    </Surface>
  );
}
interface SpellCastingStatsProps {
  character: Character;
  spellSaveDC: number;
  spellAttack: number;
  ability: string;
  abilityMod: number;
}
function SpellCastingStats({
  character,
  spellSaveDC,
  spellAttack,
  ability,
  abilityMod,
}: SpellCastingStatsProps) {
  const t = useTranslation();
  const { addRoll } = useRollStore();

  const handleAttackRoll = () => {
    const result = rollSpellAttack({
      character,
      spellcastingAbility: ability as
        | 'Strength'
        | 'Dexterity'
        | 'Constitution'
        | 'Intelligence'
        | 'Wisdom'
        | 'Charisma',
      rng: defaultRandom,
    });
    addRoll({
      label: t('spellAttack'),
      expression: `d20 (${result.rawRoll}) + ${result.bonus}`,
      total: result.total,
    });
  };

  return (
    <div className="grid grid-cols-3 text-xs">
      <div className="text-center">
        <span className="inline-flex items-baseline gap-1">
          <Text as="span" variant="label">
            {ability.substring(0, 3)}
          </Text>
          <Text as="span" weight="bold" color="accent">
            {abilityMod >= 0 ? '+' : ''}
            {abilityMod}
          </Text>
        </span>
      </div>
      <div className="text-center">
        <span className="inline-flex items-baseline gap-1">
          <Text as="span" variant="label">
            {t('saveDC')}
          </Text>
          <Text as="span" weight="bold" color="accent">
            {spellSaveDC}
          </Text>
        </span>
      </div>
      <div className="text-center">
        <button
          onClick={handleAttackRoll}
          title={t('rollAttack')}
          className="inline-flex items-baseline gap-1 cursor-pointer hover:opacity-80"
        >
          <AttackIcon size="xs" />
          <Text as="span" weight="bold" color="accent">
            +{spellAttack}
          </Text>
        </button>
      </div>
    </div>
  );
}

interface SpellPreparationProgressProps {
  prepared: string[];
  maxPrepared: number;
}
function SpellPreparationProgress({ prepared, maxPrepared }: SpellPreparationProgressProps) {
  const t = useTranslation();
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Text variant="label">{t('preparationSlots')}</Text>
        <Text weight="bold" size="sm" color="accent">
          {prepared.length}/{maxPrepared}
        </Text>
      </div>
      <div className="h-2.5 bg-bg-tertiary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary-400 transition-all duration-500 rounded-full"
          style={{
            width: `${Math.min(100, (prepared.length / maxPrepared) * 100)}%`,
          }}
        />
      </div>
    </div>
  );
}
interface AlwaysPreparedSpellsProps {
  alwaysPrepared: string[];
  selectSpell: (spell: Spell) => void;
}
function AlwaysPreparedSpells({ alwaysPrepared, selectSpell }: AlwaysPreparedSpellsProps) {
  const t = useTranslation();
  return (
    <div>
      <Text as="div" variant="label" className="mb-2 flex items-center gap-1">
        <DefenseIcon className="w-2.5 h-2.5 text-info" />
        {t('alwaysPreparedSpells')}
      </Text>
      <div className="flex flex-wrap gap-1">
        {alwaysPrepared.map((spellId) => {
          const spell = spellService.getSpell(spellId);
          if (!spell) return null;
          return (
            <Badge
              key={spellId}
              variant="info"
              size="sm"
              className="cursor-pointer hover:bg-info/30"
              onClick={() => selectSpell(spell)}
            >
              {spell.name}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

interface SpellPillProps {
  spell: Spell;
  alwaysPrepared: string[];
  selectSpell: (spell: Spell) => void;
}

function SpellPill({ spell, alwaysPrepared, selectSpell }: SpellPillProps) {
  const { isConcentratingOnThis } = useSpellCapabilities(spell);
  const isAlwaysPrepared = alwaysPrepared.includes(spell.id);

  const variant = isConcentratingOnThis ? 'warning' : isAlwaysPrepared ? 'info' : 'secondary';

  return (
    <Badge
      variant={variant}
      size="sm"
      className="cursor-pointer hover:opacity-80 flex items-center gap-1"
      onClick={() => selectSpell(spell)}
    >
      {isConcentratingOnThis && <ConcentrationIcon size="xs" />}
      {isAlwaysPrepared && <DefenseIcon size="xs" />}
      {spell.name}
    </Badge>
  );
}

interface SpellSectionByLevelProps {
  level: SpellLevel;
  total: number;
  used: number;
  alwaysPrepared: string[];
  spellsAtLevel: Spell[];
  recoverSpellSlot: (level: SpellLevel) => void;
  consumeSpellSlot: (level: SpellLevel) => void;
  selectSpell: (spell: Spell) => void;
  /** When provided (cantrips), shows "name (n/max)" label and hides slot pips */
  maxKnown?: number;
}

function SpellSectionByLevel({
  level,
  total,
  used,
  alwaysPrepared,
  spellsAtLevel,
  recoverSpellSlot,
  consumeSpellSlot,
  selectSpell,
  maxKnown,
}: SpellSectionByLevelProps) {
  const t = useTranslation();
  const isCantrip = maxKnown != null;
  const levelLabel = t(SPELL_LEVEL_LABELS[level] as keyof typeof t);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-1">
        <Text as="div" variant="label" className="text-[8px]">
          {levelLabel}
        </Text>
        <div className="flex items-center gap-2">
          {!isCantrip && (
            <SlotPips
              total={total}
              used={used}
              onPipClick={(_index, isUsed) =>
                isUsed ? recoverSpellSlot(level) : consumeSpellSlot(level)
              }
              size="sm"
            />
          )}
          <Text variant="caption" weight="bold" className="text-right text-[10px] w-8">
            {isCantrip ? `(${spellsAtLevel.length}/${maxKnown})` : `${total - used}/${total}`}
          </Text>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {spellsAtLevel.map((spell) => (
          <SpellPill
            key={spell.id}
            spell={spell}
            alwaysPrepared={alwaysPrepared}
            selectSpell={selectSpell}
          />
        ))}
      </div>
    </div>
  );
}
