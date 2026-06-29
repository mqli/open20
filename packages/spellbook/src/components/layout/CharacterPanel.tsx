import { useState, useMemo, Fragment } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { useSpellStore } from '@/stores/spellStore';
import { getAllClasses, resolveDeps } from '@/core/content-resolver';
import { spellService } from '@/core/spell-service';
import { getCasterType } from 'open20-core/spells';
import { Button, Divider, Surface, Text, Toggle } from '@open20/ui';
import { CharacterSelector } from '@/components/layout/CharacterSelector';
import { CharacterSheetContent } from '@/components/character/CharacterSheet/CharacterSheet';
import { CharacterModal } from '@/components/character/CharacterModal';
import { SpellSlots } from '@/components/spell-slots/SpellSlots';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from '@/i18n';

export function CharacterPanel() {
  const t = useTranslation();
  const {
    activeCharacter,
    longRest,
    shortRest,
    consumeSpellSlot,
    recoverSpellSlot,
    consumePactMagicSlot,
    recoverPactMagicSlot,
  } = useCharacterStore();
  const { showPreparedOnly, setShowPreparedOnly, showKnownOnly, setShowKnownOnly } =
    useSpellStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();

  const classNameMap = useMemo(
    () =>
      spellService.isReady()
        ? Object.fromEntries(getAllClasses().map((c) => [c.id, c.name || c.id]))
        : ({} as Record<string, string>),
    [],
  );

  const casterType = useMemo(() => {
    if (!activeCharacter) return { canLearn: false, canPrepare: false, isSpellbookCaster: false };
    return getCasterType(activeCharacter, resolveDeps(activeCharacter));
  }, [activeCharacter]);

  const handleEdit = (id: string) => {
    setEditingId(id);
    requestAnimationFrame(() => setIsModalOpen(true));
  };

  const handleEditActive = () => {
    if (activeCharacter) handleEdit(activeCharacter.id);
  };

  // Spellcasting stats
  const classSpellcasting = activeCharacter?.spells?.classSpellcasting ?? {};
  const spellcastingEntries = Object.entries(classSpellcasting).filter(
    ([, cs]) => cs.spellSaveDC > 0 || cs.spellAttackBonus > 0,
  );
  const isMulticlassSpellcaster = spellcastingEntries.length > 1;
  const hasSpellcasting = spellcastingEntries.length > 0;

  return (
    <Surface
      variant="default"
      className="flex flex-col h-full rounded-none border-r overflow-y-auto"
      data-testid="character-panel"
    >
      {/* Character Selector */}
      <div className="px-3 py-2 border-b border-border">
        <CharacterSelector />
      </div>

      {/* Active Character Content */}
      {activeCharacter ? (
        <div className="flex-1 overflow-y-auto">
          {/* Compact Character Info */}
          <div className="px-3 py-3">
            <CharacterSheetContent onEdit={handleEditActive} />
          </div>

          {/* Spellcasting Stats */}
          {hasSpellcasting && (
            <div className="px-3 pb-3">
              <Divider className="mb-3" />
              <div className="space-y-2">
                {spellcastingEntries.map(([classId, cs], i) => (
                  <Fragment key={classId}>
                    {i > 0 && <Divider size="sm" />}
                    <div className="flex items-center gap-3">
                      {isMulticlassSpellcaster && (
                        <Text
                          variant="label"
                          className="text-text-tertiary w-7 shrink-0 text-right"
                        >
                          {(classNameMap[classId] ?? classId).slice(0, 3)}
                        </Text>
                      )}
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <Text variant="label">DC</Text>
                          <Text weight="bold" size="sm" color="accent">
                            {cs.spellSaveDC}
                          </Text>
                        </div>
                        {cs.spellAttackBonus > 0 && (
                          <div className="text-center">
                            <Text variant="label">ATK</Text>
                            <Text weight="bold" size="sm" color="accent">
                              +{cs.spellAttackBonus}
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Spell Slots */}
          {activeCharacter.spells?.spellSlots && (
            <div className="px-3 pb-3">
              <SpellSlots
                slots={activeCharacter.spells.spellSlots}
                pactMagicSlots={activeCharacter.spells.pactMagicSlots}
                onConsumeSlot={consumeSpellSlot}
                onRecoverSlot={recoverSpellSlot}
                onConsumePactSlot={consumePactMagicSlot}
                onRecoverPactSlot={recoverPactMagicSlot}
                density="default"
                showLabels={false}
                isMulticlass={isMulticlassSpellcaster}
              />
            </div>
          )}

          {/* Known/Prepared Toggles */}
          {(casterType.canLearn || casterType.canPrepare) && (
            <div className="px-3 pb-3">
              <Divider className="mb-3" />
              <div className="flex flex-col gap-2">
                {casterType.canPrepare && (
                  <Toggle
                    variant="primary"
                    size="sm"
                    pressed={showPreparedOnly}
                    onPressedChange={() => setShowPreparedOnly(!showPreparedOnly)}
                    className="prepared-toggle w-full justify-center"
                  >
                    {t('prepared')}
                  </Toggle>
                )}
                {casterType.canLearn && (
                  <Toggle
                    variant="secondary"
                    size="sm"
                    pressed={showKnownOnly}
                    onPressedChange={() => setShowKnownOnly(!showKnownOnly)}
                    className="known-toggle w-full justify-center"
                  >
                    {t('known')}
                  </Toggle>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="px-3 pb-3">
            <Divider className="mb-3" />
            <div className="flex gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={shortRest}
                className="flex-1 justify-center text-text-secondary hover:text-primary-600"
              >
                <Sun className="w-3.5 h-3.5 mr-1" />
                {t('shortRest')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={longRest}
                className="flex-1 justify-center text-text-secondary hover:text-primary-600"
              >
                <Moon className="w-3.5 h-3.5 mr-1" />
                {t('longRest')}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      <CharacterModal open={isModalOpen} onOpenChange={setIsModalOpen} characterId={editingId} />
    </Surface>
  );
}
