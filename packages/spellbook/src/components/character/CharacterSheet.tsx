import { X, Pencil } from 'lucide-react';
import {
  Badge,
  Button,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetRoot,
  SheetTitle,
  Tabs,
  Text,
} from '@open20/ui';
import { useCharacterStore } from '@/stores/character-store';
import { ConcentrationBanner } from './CharacterSheet/ConcentrationBanner';
import { ClassSpellSection } from './CharacterSheet/ClassSpellSection';
import { SpellSlots } from '@/components/spell-slots/SpellSlots';


interface ConcentrationCondition {
  id: string;
  source?: string;
}

export function CharacterSheet({ open, onOpenChange, onEdit }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}) {
  const {
    activeCharacter,
    consumeSpellSlot,
    recoverSpellSlot,
    consumePactMagicSlot,
    recoverPactMagicSlot,
  } = useCharacterStore();

  if (!activeCharacter) return null;

 
  const { spells, classes, conditions } = activeCharacter;
  const classSpellcasting = spells.classSpellcasting ?? {};

  const isMulticlass = (classes?.length ?? 0) > 1;

  const concentratingSpellId = (conditions?.find(c => c.id === 'Concentrating') as ConcentrationCondition | undefined)?.source;

  const spellcastingClasses = classes?.filter(c => classSpellcasting[c.classId]) ?? [];
  const classTabEntries = spellcastingClasses.map((spellcastingClass, index) => ({
    ...spellcastingClass,
    tabValue: `${spellcastingClass.classId}-${index}`,
  }));

  return (
    <SheetRoot open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="max-w-sm flex flex-col">
        {/* Header */}
        <SheetHeader>
          <div>
            <SheetTitle>{activeCharacter.name}</SheetTitle>
            <div className="flex gap-2 mt-2 flex-wrap">
              {classes?.map((c, i) => (
                <Badge key={i} variant={i === 0 ? "primary" : "secondary"} size="sm">
                  {c.classId} {c.level}
                </Badge>
              ))}
              <Badge variant="secondary" size="sm">{activeCharacter.species}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
              className="p-2 text-text-tertiary hover:text-primary-600"
              title="Edit character"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <SheetClose asChild>
              <Button variant="ghost" size="sm" className="p-2 text-text-tertiary hover:text-text-primary">
                <X className="w-5 h-5" />
              </Button>
            </SheetClose>
          </div>
        </SheetHeader>

        <SheetBody className="space-y-6">
          {/* Concentration */}
          {concentratingSpellId && (
            <ConcentrationBanner concentratingSpellId={concentratingSpellId} />
          )}

          {/* Combined Spell Slots */}
          {(spells.spellSlots || spells.pactMagicSlots) && (
            <SpellSlots
              slots={spells.spellSlots ?? {}}
              pactMagicSlots={spells.pactMagicSlots}
              onConsumeSlot={consumeSpellSlot}
              onRecoverSlot={recoverSpellSlot}
              onConsumePactSlot={consumePactMagicSlot}
              onRecoverPactSlot={recoverPactMagicSlot}
              isMulticlass={isMulticlass}
            />
          )}

          {/* Per-Class Spellcasting Sections */}
          {spellcastingClasses.length > 0 && (
            <section>
              <Text as="h3" variant="labelSm" weight="black" className="tracking-[0.2em] mb-4 flex items-center gap-2">
                Class Spellcasting
              </Text>
              <Tabs.Root defaultValue={classTabEntries[0]?.tabValue}>
                <Tabs.List variant="pills" className="mb-3">
                  {classTabEntries.map(spellcastingClass => (
                    <Tabs.Trigger
                      key={spellcastingClass.tabValue}
                      value={spellcastingClass.tabValue}
                      variant="pills"
                    >
                      {spellcastingClass.classId} {spellcastingClass.level}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>

                {classTabEntries.map(spellcastingClass => (
                  <Tabs.Content
                    key={spellcastingClass.tabValue}
                    value={spellcastingClass.tabValue}
                    className="mt-0"
                  >
                    <ClassSpellSection
                      classId={spellcastingClass.classId}
                    />
                  </Tabs.Content>
                ))}
              </Tabs.Root>
            </section>
          )}
        </SheetBody>

        {/* Footer */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <Button
            variant="ghost"
            onClick={onEdit}
            className="w-full bg-bg-tertiary hover:bg-primary-50 text-text-secondary hover:text-primary-600 rounded-2xl py-3"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit Character Stats
          </Button>
        </div>
      </SheetContent>
    </SheetRoot>
  );
}
