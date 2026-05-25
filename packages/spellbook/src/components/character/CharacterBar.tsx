import { useState, Fragment } from 'react';
import { useCharacterStore } from '@/stores/character-store';
import type { AppCharacter } from '@/core/types';
import { dataLoader } from '@/core/data-loader';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Surface } from '@/components/ui/Surface';
import { Text } from '@/components/ui/Text';
import { DropdownMenu } from '@/components/ui/DropdownMenu';
import { SlotPips } from '@/components/ui/SlotPips';
import { CharacterModal } from './CharacterModal';
import { CharacterSheet } from './CharacterSheet';
import { Plus, User, Moon, FileText, Users, ChevronRight } from 'lucide-react';

const CLASS_NAME_MAP = Object.fromEntries(
  dataLoader.getAllClasses().map(c => [c.id, c.name || c.id])
);

function formatClassInfo(
  classes: readonly { classId: string; level: number }[] | undefined
): string {
  if (!classes || classes.length === 0) return 'Lvl 1';
  return classes
    .map(c => `${CLASS_NAME_MAP[c.classId] ?? c.classId} ${c.level}`)
    .join(' / ');
}

export function CharacterBar() {
  const { characters, activeCharacter, setActiveCharacter, longRest, consumeSpellSlot, recoverSpellSlot } = useCharacterStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [isSwitchOpen, setIsSwitchOpen] = useState(false);

  const handleCreate = () => {
    setEditingId(undefined);
    setIsSwitchOpen(false);
    requestAnimationFrame(() => setIsModalOpen(true));
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsSwitchOpen(false);
    setIsSheetOpen(false);
    requestAnimationFrame(() => setIsModalOpen(true));
  };

  const handleSelect = (char: AppCharacter) => {
    setActiveCharacter(char);
    setIsSwitchOpen(false);
  };

  const classInfo = formatClassInfo(activeCharacter?.classes);

  // Get per-class spellcasting stats
  const classSpellcasting = activeCharacter?.spells?.classSpellcasting ?? {};
  const spellcastingEntries = Object.entries(classSpellcasting).filter(
    ([, cs]) => cs.spellSaveDC > 0 || cs.spellAttackBonus > 0
  );
  const isMulticlassSpellcaster = spellcastingEntries.length > 1;
  const hasSpellcasting = spellcastingEntries.length > 0;

  return (
    <Surface variant="default" className="border-b rounded-none px-3 py-1.5 flex items-center justify-between gap-2">
      {/* Left: character info + spellcasting info grouped together */}
      {activeCharacter && (
        <div className="flex items-center gap-3 min-w-0">
          {/* Character identity — click to open sheet */}
          <button
            onClick={() => setIsSheetOpen(true)}
            className="flex items-center gap-1.5 flex-shrink-0 hover:bg-bg-tertiary rounded-md px-1.5 py-0.5 transition-colors cursor-pointer"
            title="Open character sheet"
          >
            <User className="w-3 h-3 text-primary-500" />
            <Text weight="bold" size="sm" color="primary" className="whitespace-nowrap">
              {activeCharacter.name}
            </Text>
            <Text variant="label" className="ml-0.5">
              {classInfo}
            </Text>
            <ChevronRight className="w-3 h-3 text-text-tertiary opacity-60" />
          </button>

          {/* Spellcasting stats + slots */}
          {hasSpellcasting && (
            <>
              <div className="hidden sm:block w-px h-5 bg-border/60" />

              {/* Per-class spellcasting stats */}
              <div className="hidden sm:flex items-center gap-2">
                {spellcastingEntries.map(([classId, cs], i) => (
                  <Fragment key={classId}>
                    {i > 0 && <div className="w-px h-4 bg-border/60" />}
                    <div className="flex items-center gap-1.5 text-center">
                      {isMulticlassSpellcaster && (
                        <Text variant="label" className="text-text-tertiary">
                          {(CLASS_NAME_MAP[classId] ?? classId).slice(0, 3)}
                        </Text>
                      )}
                      <div>
                        <Text variant="label" className="mb-0.5">DC</Text>
                        <Text weight="bold" size="sm" color="accent">{cs.spellSaveDC}</Text>
                      </div>
                      {cs.spellAttackBonus > 0 && (
                        <div>
                          <Text variant="label" className="mb-0.5">ATK</Text>
                          <Text weight="bold" size="sm" color="accent">+{cs.spellAttackBonus}</Text>
                        </div>
                      )}
                    </div>
                  </Fragment>
                ))}
              </div>

              {/* Spell Slots — hidden on mobile, sorted by level ascending */}
              {activeCharacter.spells?.spellSlots && (
                <div className="hidden sm:flex items-center gap-1.5">
                  {Object.entries(activeCharacter.spells.spellSlots)
                    .sort(([a], [b]) => parseInt(a) - parseInt(b))
                    .map(([level, slot]) => {
                      const lvl = parseInt(level);
                      if (lvl === 0 || slot.total === 0) return null;
                      return (
                        <SlotPips
                          key={level}
                          total={slot.total}
                          used={slot.used}
                          onPipClick={(_index, isUsed) => isUsed ? recoverSpellSlot(lvl) : consumeSpellSlot(lvl)}
                        />
                      );
                    })}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Right: less common actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Switch / create character — less prominent */}
        {characters.length > 0 && (
          <DropdownMenu.Root open={isSwitchOpen} onOpenChange={setIsSwitchOpen}>
            <DropdownMenu.Trigger asChild>
              <IconButton
                size="sm"
                title="Switch character"
                className="text-text-tertiary hover:text-primary-600"
              >
                <Users className="w-3.5 h-3.5" />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content className="w-48">
              {characters.map(char => (
                <DropdownMenu.Item
                  key={char.id}
                  onSelect={() => handleSelect(char)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm"
                >
                  <User className="w-3 h-3 flex-shrink-0" />
                  <span className="flex-1 truncate">{char.name}</span>
                  <Text variant="label">
                    {formatClassInfo(char.classes)}
                  </Text>
                  <IconButton
                    variant="secondary"
                    size="sm"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(char.id); }}
                    className="hover:text-primary-600 ml-1"
                  >
                    <FileText className="w-2.5 h-2.5" />
                  </IconButton>
                </DropdownMenu.Item>
              ))}
              <DropdownMenu.Separator />
              <DropdownMenu.Item onSelect={handleCreate}>
                <Plus className="w-3 h-3 mr-2" />
                Add character
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        )}

        {/* Long Rest */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => longRest()}
          className="text-text-secondary hover:text-primary-600 h-7 px-1.5"
        >
          <Moon className="w-3.5 h-3.5 md:mr-1" />
          <Text size="sm" className="hidden md:inline">Rest</Text>
        </Button>
      </div>

      <CharacterModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        characterId={editingId}
      />

      <CharacterSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onEdit={() => {
          if (activeCharacter) handleEdit(activeCharacter.id);
        }}
      />
    </Surface>
  );
}
