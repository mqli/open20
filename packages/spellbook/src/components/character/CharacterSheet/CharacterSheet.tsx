import { X, Pencil } from 'lucide-react';
import { Badge, Button, SectionHeader, SlotPips, Surface, Tabs, Text } from '@open20/ui';
import { useCharacterStore } from '@/stores/characterStore';
import { spellService } from '@/core/spell-service';
import { ConcentrationBanner } from './ConcentrationBanner';
import { ClassSpellSection } from './ClassSpellSection';
import { useTranslation } from '@/i18n';
import { useSpellStore } from '@/stores/spellStore';
import type { Spell } from 'open20-core';
import { sortSpells } from 'open20-core/spells';

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

export function CharacterSheetContent({
  onEdit,
  onClose,
}: {
  onEdit: () => void;
  onClose?: () => void;
}) {
  const t = useTranslation();
  const {
    activeCharacter,
    consumePactMagicSlot,
    recoverPactMagicSlot,
    consumeSpellSlot,
    recoverSpellSlot,
  } = useCharacterStore();
  const { selectSpell } = useSpellStore();
  if (!activeCharacter) return null;
  const { spells, classes, concentration } = activeCharacter;
  const classSpellcasting = spells.classSpellcasting ?? {};
  const featSpells = spells.featSpells;

  const concentratingSpellId = concentration?.spellId ?? null;

  const spellcastingClasses = classes?.filter((c) => classSpellcasting[c.classId]) ?? [];
  const classTabEntries = spellcastingClasses.map((spellcastingClass, index) => ({
    ...spellcastingClass,
    tabValue: `${spellcastingClass.classId}-${index}`,
  }));

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Text as="h2" size="2xl" weight="bold">
            {activeCharacter.name}
          </Text>
          <div className="flex gap-2 mt-2 flex-wrap">
            {classes?.map((c, i) => (
              <Badge key={i} variant={i === 0 ? 'primary' : 'secondary'} size="sm">
                {c.classId} {c.level}
              </Badge>
            ))}
            <Badge variant="secondary" size="sm">
              {activeCharacter.species}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="p-2 text-text-tertiary hover:text-primary-600"
            title={t('editCharacterStats')}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 text-text-tertiary hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="space-y-6">
        {/* Concentration */}
        {concentratingSpellId && (
          <ConcentrationBanner concentratingSpellId={concentratingSpellId} />
        )}

        {/* Pact Magic Slots - shown separately */}
        {spells.pactMagicSlots && (
          <section>
            <SectionHeader title={t('pactMagicSlots')} />
            <div className="flex items-center gap-3">
              <Text variant="label" className="w-10 shrink-0">
                Pact {t(SPELL_LEVEL_LABELS[spells.pactMagicSlots.level] as keyof typeof t)}
              </Text>
              <SlotPips
                total={spells.pactMagicSlots.total}
                used={spells.pactMagicSlots.used}
                onPipClick={(_index, isUsed) =>
                  isUsed ? recoverPactMagicSlot() : consumePactMagicSlot()
                }
              />
              <Text variant="caption" weight="bold" className="shrink-0 w-8 text-right">
                {spells.pactMagicSlots.total - spells.pactMagicSlots.used}/
                {spells.pactMagicSlots.total}
              </Text>
            </div>
          </section>
        )}

        {/* Per-Class Spellcasting Sections */}
        {spellcastingClasses.length > 0 && (
          <section>
            <SectionHeader title={t('classSpellcastingStats')} className="mb-2" />
            <Tabs.Root defaultValue={classTabEntries[0]?.tabValue}>
              <Tabs.List variant="segmented" className="mb-3">
                {classTabEntries.map((spellcastingClass) => (
                  <Tabs.Trigger
                    key={spellcastingClass.tabValue}
                    value={spellcastingClass.tabValue}
                    variant="segmented"
                    className="px-2.5 py-1 text-xs"
                  >
                    {spellcastingClass.classId} {spellcastingClass.level}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>

              {classTabEntries.map((spellcastingClass) => (
                <Tabs.Content
                  key={spellcastingClass.tabValue}
                  value={spellcastingClass.tabValue}
                  className="mt-0"
                >
                  <ClassSpellSection classId={spellcastingClass.classId} />
                </Tabs.Content>
              ))}
            </Tabs.Root>
          </section>
        )}

        {/* Feat Spells (Magic Initiate etc.) */}
        {featSpells && Object.keys(featSpells).length > 0 && (
          <section>
            <SectionHeader title={t('feats')} className="mb-2" />
            {Object.entries(featSpells).map(([featKey, entry]) => {
              const cantripSpells = sortSpells(
                entry.cantrips
                  .map((id: string) => spellService.getSpell(id))
                  .filter((s): s is Spell => !!s),
                { sortBy: 'name' },
              );

              const level1Spells = sortSpells(
                entry.preparedSpells
                  .filter((id: string) => !entry.cantrips.includes(id))
                  .map((id: string) => spellService.getSpell(id))
                  .filter((s): s is Spell => !!s),
              );

              const slotEntry = spells.spellSlots[1] as { total: number; used: number } | undefined;

              return (
                <Surface key={featKey} variant="default" className="p-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      {t('magicInitiate')}
                    </Badge>
                    <Text variant="caption" color="secondary">
                      ({entry.classId})
                    </Text>
                  </div>

                  {/* Cantrips */}
                  {cantripSpells.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between px-1">
                        <Text variant="label" className="text-[8px]">
                          {t('cantripLevel')}
                        </Text>
                        <Text variant="caption" weight="bold" className="text-[10px]">
                          ({cantripSpells.length}/2)
                        </Text>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {cantripSpells.map((spell) => (
                          <Badge
                            key={spell.id}
                            variant="secondary"
                            size="sm"
                            className="cursor-pointer hover:opacity-80"
                            onClick={() => selectSpell(spell)}
                          >
                            {spell.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Level 1 spells */}
                  {level1Spells.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between px-1">
                        <Text variant="label" className="text-[8px]">
                          {t('firstLevel')}
                        </Text>
                        <div className="flex items-center gap-2">
                          {slotEntry && slotEntry.total > 0 && (
                            <SlotPips
                              total={slotEntry.total}
                              used={slotEntry.used}
                              onPipClick={(_index, isUsed) =>
                                isUsed ? recoverSpellSlot(1) : consumeSpellSlot(1)
                              }
                              size="sm"
                            />
                          )}
                          <Text
                            variant="caption"
                            weight="bold"
                            className="text-[10px] w-8 text-right"
                          >
                            {slotEntry
                              ? `${slotEntry.total - slotEntry.used}/${slotEntry.total}`
                              : '-'}
                          </Text>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {level1Spells.map((spell) => {
                          const isUsed =
                            spells.featSpells?.[featKey]?.usedOncePerLongRest?.[spell.id] === true;
                          return (
                            <Badge
                              key={spell.id}
                              variant={isUsed ? 'danger' : 'secondary'}
                              size="sm"
                              className="cursor-pointer hover:opacity-80"
                              onClick={() => selectSpell(spell)}
                            >
                              {spell.name}
                              {isUsed ? ' (used)' : ''}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Surface>
              );
            })}
          </section>
        )}
      </div>
    </>
  );
}
