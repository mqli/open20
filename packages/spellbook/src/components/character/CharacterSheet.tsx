import { X, Pencil } from 'lucide-react';
import { Badge, Button, Dialog, SectionHeader, Sheet, SlotPips, Tabs, Text } from '@open20/ui';
import { useCharacterStore } from '@/stores/character-store';
import { ConcentrationBanner } from './CharacterSheet/ConcentrationBanner';
import { ClassSpellSection } from './CharacterSheet/ClassSpellSection';
import { useTranslation } from '@/i18n';
import { useIsLargeScreen } from '@/hooks/use-breakpoint';

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

function CharacterSheetContent({ onEdit, onClose }: { onEdit: () => void; onClose: () => void }) {
  const t = useTranslation();
  const { activeCharacter, consumePactMagicSlot, recoverPactMagicSlot } = useCharacterStore();
  if (!activeCharacter) return null;
  const { spells, classes, concentration } = activeCharacter;
  const classSpellcasting = spells.classSpellcasting ?? {};

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
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 text-text-tertiary hover:text-text-primary"
          >
            <X className="w-5 h-5" />
          </Button>
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
            <SectionHeader title={t('classSpellcastingStats')} />
            <Tabs.Root defaultValue={classTabEntries[0]?.tabValue}>
              <Tabs.List variant="pills" className="mb-3">
                {classTabEntries.map((spellcastingClass) => (
                  <Tabs.Trigger
                    key={spellcastingClass.tabValue}
                    value={spellcastingClass.tabValue}
                    variant="pills"
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
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={onEdit}
          className="w-full bg-bg-tertiary hover:bg-primary-50 text-text-secondary hover:text-primary-600 rounded-2xl py-3"
        >
          <Pencil className="w-4 h-4 mr-2" />
          {t('editCharacterStats')}
        </Button>
      </div>
    </>
  );
}

export function CharacterSheet({
  open,
  onOpenChange,
  onEdit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}) {
  const isLarge = useIsLargeScreen();

  if (!open) return null;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onOpenChange(false);
    }
  };

  // Mobile/Tablet: Use Sheet (slide-in from right)
  if (!isLarge) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <Sheet.Content side="right" className="max-w-sm flex flex-col">
          <CharacterSheetContent onEdit={onEdit} onClose={() => onOpenChange(false)} />
        </Sheet.Content>
      </Sheet>
    );
  }

  // Desktop: Use Dialog (centered modal)
  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Overlay />
      <Dialog.Content size="lg" className="max-h-[85vh] overflow-y-auto">
        <CharacterSheetContent onEdit={onEdit} onClose={() => onOpenChange(false)} />
      </Dialog.Content>
    </Dialog.Root>
  );
}
