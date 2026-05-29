import { Plus, X } from 'lucide-react';
import {
  Badge,
  Button,
  DialogClose,
  DialogContent,
  DialogRoot,
  DialogTitle,
  Surface,
  Text,
  DefenseIcon,
  SlotPips,
  Divider,
} from '@open20/ui';
import { spellService } from '@/core/spell-service';
import { RulesService } from '@/core/rules-service';
import { getCasterTypeForClass } from '@/core/character-service';
import { useCharacterStore } from '@/stores/character-store';
import { useSpellStore } from '@/stores/spell-store';
import type { SpellLevel, Spell, SpellSlotEntry } from 'open20-core/types';
import { SpellEntry } from './SpellEntry';
import { useState, type ReactNode } from 'react';
import { useTranslation } from '@open20/ui';

function StatTile({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <Surface variant="default" padding="sm" className="text-center">
      <Text variant="label" className="mb-1">
        {label}
      </Text>
      <Text weight="black" color="accent">
        {value}
      </Text>
      {sub && (
        <Text variant="caption" weight="bold" className="mt-0.5">
          {sub}
        </Text>
      )}
    </Surface>
  );
}

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
  const t = useTranslation();
  const { activeCharacter, consumeSpellSlot, recoverSpellSlot } = useCharacterStore();
  const { selectSpell } = useSpellStore();
  const [isCantripModalOpen, setIsCantripModalOpen] = useState(false);
  const [cantripToReplace, setCantripToReplace] = useState<string | null>(null);

  if (!activeCharacter) return null;

  const classData = activeCharacter.spells.classSpellcasting[classId];
  if (!classData) return null;

  const casterType = getCasterTypeForClass(classId);
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
  const inventorySpells = known
    .map((id) => spellService.getSpell(id))
    .filter((s): s is NonNullable<typeof s> => !!s && allPreparedIds.has(s.id))
    .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

  const spellsByLevel = inventorySpells.reduce(
    (acc, spell) => {
      const level = spell.level;
      if (!acc[level]) acc[level] = [];
      acc[level].push(spell);
      return acc;
    },
    {} as Record<number, Spell[]>,
  );

  const getAvailableCantrips = () => {
    return spellService
      .searchSpells({ classes: [classId], level: 0 })
      .filter((s) => !classData.knownCantrips.includes(s.id));
  };

  const handleLearnCantrip = () => {
    setCantripToReplace(null);
    setIsCantripModalOpen(true);
  };

  const handleReplaceCantrip = (spellId: string) => {
    setCantripToReplace(spellId);
    setIsCantripModalOpen(true);
  };

  const handleCantripSelect = (spellId: string) => {
    if (cantripToReplace) {
      useCharacterStore.getState().replaceCantrip(classId, cantripToReplace, spellId);
    } else {
      useCharacterStore.getState().learnCantrip(classId, spellId);
    }
    setIsCantripModalOpen(false);
    setCantripToReplace(null);
  };

  // Get spell slots for this class (for multiclass, slots are combined in activeCharacter.spells.spellSlots)
  const spellSlots =
    activeCharacter.spells.spellSlots ?? ({} as Record<SpellLevel, SpellSlotEntry>);

  const availableSpellSlots = Object.entries(spellSlots).filter(([_, { total }]) => total > 0);

  return (
    <Surface variant="default" padding="none" className="overflow-hidden">
      <div className="p-4 space-y-4">
        {/* Class Stats */}
        <SpellCastingStats
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
        {/* Known Cantrips */}
        <KnownCantrips
          knownCantrips={classData.knownCantrips}
          maxCantripsKnown={classData.maxCantripsKnown}
          handleLearnCantrip={handleLearnCantrip}
          handleReplaceCantrip={handleReplaceCantrip}
        />
        {/* Cantrip Selection Modal */}
        <CantripSelectionModal
          isOpen={isCantripModalOpen}
          onClose={() => setIsCantripModalOpen(false)}
          onSelect={handleCantripSelect}
          cantripToReplace={cantripToReplace}
          availableCantrips={getAvailableCantrips()}
        />

        {/* Spell List with Inline Spell Slots */}
        <div className="space-y-4">
          {availableSpellSlots.map(([level, { total, used }]) => {
            const lvl = parseInt(level, 10) as SpellLevel;
            const spellsAtLevel = spellsByLevel[lvl] ?? [];
            return (
              <SpellSectionByLevel
                level={lvl}
                total={total}
                used={used}
                alwaysPrepared={alwaysPrepared}
                spellsAtLevel={spellsAtLevel}
                recoverSpellSlot={recoverSpellSlot}
                consumeSpellSlot={consumeSpellSlot}
              />
            );
          })}
        </div>
      </div>
    </Surface>
  );
}
interface SpellCastingStatsProps {
  spellSaveDC: number;
  spellAttack: number;
  ability: string;
  abilityMod: number;
}
function SpellCastingStats({
  spellSaveDC,
  spellAttack,
  ability,
  abilityMod,
}: SpellCastingStatsProps) {
  const t = useTranslation();
  return (
    <div className="grid grid-cols-3 gap-2">
      <StatTile
        label={t('ability')}
        value={ability.substring(0, 3)}
        sub={`${abilityMod >= 0 ? '+' : ''}${abilityMod}`}
      />
      <StatTile label={t('saveDC')} value={spellSaveDC} />
      <StatTile label={t('attackBonus')} value={`+${spellAttack}`} />
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
interface KnownCantripsProps {
  knownCantrips: readonly string[];
  maxCantripsKnown: number;
  handleLearnCantrip: () => void;
  handleReplaceCantrip: (spellId: string) => void;
}
function KnownCantrips({
  knownCantrips,
  maxCantripsKnown,
  handleLearnCantrip,
  handleReplaceCantrip,
}: KnownCantripsProps) {
  const t = useTranslation();
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Text as="div" variant="label">
          {t('knownCantripsCount')} ({knownCantrips.length}/{maxCantripsKnown})
        </Text>
        {knownCantrips.length < maxCantripsKnown && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLearnCantrip}
            className="h-5 px-1 text-[10px]"
          >
            <Plus className="w-3 h-3 mr-0.5" />
            {t('add')}
          </Button>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {knownCantrips.map((spellId) => {
          const spell = spellService.getSpell(spellId);
          if (!spell) return null;
          return (
            <Badge
              key={spellId}
              variant="secondary"
              size="sm"
              className="cursor-pointer hover:bg-bg-tertiary flex items-center gap-1"
              onClick={() => handleReplaceCantrip(spellId)}
            >
              {spell.name}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

interface CantripSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (spellId: string) => void;
  cantripToReplace?: string;
  availableCantrips: readonly Spell[];
}

function CantripSelectionModal({
  isOpen,
  onClose,
  onSelect,
  cantripToReplace,
  availableCantrips,
}: CantripSelectionModalProps) {
  const t = useTranslation();
  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <DialogContent size="sm">
        <div className="flex justify-between items-center mb-4">
          <DialogTitle className="text-lg font-bold">
            {cantripToReplace ? t('replaceCantrip') : t('learnCantrip')}
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="sm" className="p-1">
              <X className="w-4 h-4" />
            </Button>
          </DialogClose>
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {availableCantrips.map((spell: Spell) => (
            <Button
              variant="ghost"
              size="sm"
              key={spell.id}
              onClick={() => onSelect(spell.id)}
              className="w-full text-left px-3 py-2 rounded hover:bg-bg-tertiary transition-colors"
            >
              <Text size="sm" weight="medium">
                {spell.name}
              </Text>
            </Button>
          ))}
          {availableCantrips.length === 0 && (
            <Text variant="caption" className="text-text-tertiary">
              {t('noCantripsAvailable')}
            </Text>
          )}
        </div>
      </DialogContent>
    </DialogRoot>
  );
}

interface SpellSectionByLevelProps {
  level: number;
  total: number;
  used: number;
  alwaysPrepared: string[];
  spellsAtLevel: Spell[];
  recoverSpellSlot: (level: number) => void;
  consumeSpellSlot: (level: number) => void;
}

function SpellSectionByLevel({
  level,
  total,
  used,
  alwaysPrepared,
  spellsAtLevel,
  recoverSpellSlot,
  consumeSpellSlot,
}: SpellSectionByLevelProps) {
  const t = useTranslation();
  return (
    <div key={level} className="space-y-1">
      <div className="flex items-center justify-between px-1">
        <Text as="div" variant="label" className="text-[8px]">
          {t(SPELL_LEVEL_LABELS[level] as keyof typeof t)}
        </Text>
        <div className="flex items-center gap-2">
          {total}
          <SlotPips
            total={total}
            used={used}
            onPipClick={(_index, isUsed) =>
              isUsed ? recoverSpellSlot(level) : consumeSpellSlot(level)
            }
            size="sm"
          />
          <Text variant="caption" weight="bold" className="text-right text-[10px] w-8">
            {total - used}/{total}
          </Text>
        </div>
      </div>
      <div className="grid gap-1">
        {spellsAtLevel.map((spell) => (
          <SpellEntry key={spell.id} spell={spell} alwaysPrepared={alwaysPrepared} />
        ))}
      </div>
    </div>
  );
}
