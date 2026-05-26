import { Shield, Plus, X } from 'lucide-react';
import {
  Badge,
  Button,
  DialogClose,
  DialogContent,
  DialogRoot,
  DialogTitle,
  Surface,
  Text,
} from '@open20/ui';
import { spellService } from '@/core/spell-service';
import { RulesService } from '@/core/rules-service';
import { getCasterTypeForClass } from '@/core/character-service';
import { useCharacterStore } from '@/stores/character-store';
import { useSpellStore } from '@/stores/spell-store';
import type { Spell } from '@/core/types';
import { SpellEntry } from './SpellEntry';
import { useState } from 'react';


const SPELL_LEVEL_LABELS = ['Cantrip', '1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'];

interface ClassSpellSectionProps {
  classId: string;
}

export function ClassSpellSection({ classId }: ClassSpellSectionProps) {
  const { activeCharacter } = useCharacterStore();
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
    .map(id => spellService.getSpell(id))
    .filter((s): s is NonNullable<typeof s> => !!s && allPreparedIds.has(s.id))
    .sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

  const spellsByLevel = inventorySpells.reduce((acc, spell) => {
    const level = spell.level;
    if (!acc[level]) acc[level] = [];
    acc[level].push(spell);
    return acc;
  }, {} as Record<number, Spell[]>);

  const getAvailableCantrips = () => {
    return spellService.searchSpells({ classes: [classId], level: 0 })
      .filter(s => !classData.knownCantrips.includes(s.id));
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

  return (
    <Surface variant="default" padding="none" className="overflow-hidden">
      <div className="p-4 space-y-4">
          {/* Class Stats */}
          <div className="grid grid-cols-3 gap-2">
            <Surface variant="default" padding="sm" className="text-center">
              <Text variant="label" className="mb-1">Ability</Text>
              <Text weight="black" color="accent">{ability.substring(0, 3)}</Text>
              <Text variant="caption" weight="bold" className="mt-0.5">
                {abilityMod >= 0 ? '+' : ''}{abilityMod}
              </Text>
            </Surface>
            <Surface variant="default" padding="sm" className="text-center">
              <Text variant="label" className="mb-1">Save DC</Text>
              <Text weight="black" color="accent">{spellSaveDC}</Text>
            </Surface>
            <Surface variant="default" padding="sm" className="text-center">
              <Text variant="label" className="mb-1">Attack</Text>
              <Text weight="black" color="accent">+{spellAttack}</Text>
            </Surface>
          </div>

          {/* Preparation Progress */}
          {casterType.canPrepare && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Text variant="label">Preparation Slots</Text>
                <Text weight="bold" size="sm" color="accent">
                  {allPrepared.length}/{maxPrepared}
                </Text>
              </div>
              <div className="h-2.5 bg-bg-tertiary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-400 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, (allPrepared.length / Math.max(1, maxPrepared || 1)) * 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Prepared Spells Count */}
          {casterType.isSpellbookCaster && (
            <div className="text-[10px] text-text-tertiary">
              Prepared Spells: <Text weight="bold" className="text-info">
                {inventorySpells.filter(s => s.level > 0).length}
              </Text>
            </div>
          )}

          {/* Always Prepared Spells */}
          {alwaysPrepared.length > 0 && (
            <div>
              <Text as="div" variant="label" className="mb-2 flex items-center gap-1">
                <Shield className="w-2.5 h-2.5 text-info" />
                Always Prepared
              </Text>
              <div className="flex flex-wrap gap-1">
                {alwaysPrepared.map(spellId => {
                  const spell = spellService.getSpell(spellId);
                  if (!spell) return null;
                  return (
                    <Badge key={spellId} variant="info" size="sm" className="cursor-pointer hover:bg-info/30"
                      onClick={() => selectSpell(spell)}
                    >
                      {spell.name}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Known Cantrips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Text as="div" variant="label">
                Cantrips ({classData.knownCantrips.length}/{classData.maxCantripsKnown})
              </Text>
              {classData.knownCantrips.length < classData.maxCantripsKnown && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLearnCantrip}
                  className="h-5 px-1 text-[10px]"
                >
                  <Plus className="w-3 h-3 mr-0.5" />
                  Add
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {classData.knownCantrips.map(spellId => {
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

          {/* Cantrip Selection Modal */}
          <DialogRoot open={isCantripModalOpen} onOpenChange={setIsCantripModalOpen}>
            <DialogContent className="w-[calc(100%-2rem)] max-w-md">
              <div className="flex justify-between items-center mb-4">
                <DialogTitle className="text-lg font-bold">
                  {cantripToReplace ? 'Replace Cantrip' : 'Learn Cantrip'}
                </DialogTitle>
                <DialogClose asChild>
                  <Button variant="ghost" size="sm" className="p-1">
                    <X className="w-4 h-4" />
                  </Button>
                </DialogClose>
              </div>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {getAvailableCantrips().map((spell: Spell) => (
                  <button
                    key={spell.id}
                    onClick={() => handleCantripSelect(spell.id)}
                    className="w-full text-left px-3 py-2 rounded hover:bg-bg-tertiary transition-colors"
                  >
                    <Text size="sm" weight="medium">{spell.name}</Text>
                  </button>
                ))}
                {getAvailableCantrips().length === 0 && (
                  <Text variant="caption" className="text-text-tertiary">
                    No more cantrips available to learn.
                  </Text>
                )}
              </div>
            </DialogContent>
          </DialogRoot>

          {/* Spell List */}
          <div className="space-y-4">
            {Object.entries(spellsByLevel).map(([level, spellsAtLevel]) => (
              <div key={level} className="space-y-1">
                <Text as="div" variant="label" className="text-[8px] px-1">
                  {SPELL_LEVEL_LABELS[parseInt(level, 10)]}
                </Text>
                <div className="grid gap-1">
                  {spellsAtLevel.map(spell => (
                    <SpellEntry
                      key={spell.id}
                      spell={spell}
                      alwaysPrepared={alwaysPrepared}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
      </div>
    </Surface>
  );
}
