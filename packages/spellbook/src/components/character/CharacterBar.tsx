import { useState, Fragment, useMemo } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { useUIStore } from '@/stores/uiStore';
import type { AppCharacter } from '@/core/types';
import { getAllClasses } from '@/core/content-resolver';
import {
  Button,
  Divider,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  Surface,
  Text,
  ThemeToggle,
} from '@open20/ui';
import { SpellSlots } from '@/components/spell-slots/SpellSlots';
import { CharacterModal } from './CharacterModal';
import { CharacterSheet } from './CharacterSheet';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { Plus, User, Moon, Sun, FileText, Users, ChevronRight } from 'lucide-react';
import { useTranslation } from '@/i18n';

function formatClassInfo(
  classes: readonly { classId: string; level: number }[] | undefined,
  classNameMap: { [k: string]: string },
): string {
  if (!classes || classes.length === 0) return 'Lvl 1';
  return classes.map((c) => `${classNameMap[c.classId] ?? c.classId} ${c.level}`).join(' / ');
}

export function CharacterBar() {
  const t = useTranslation();
  const {
    characters,
    activeCharacter,
    setActiveCharacter,
    longRest,
    shortRest,
    consumeSpellSlot,
    recoverSpellSlot,
    consumePactMagicSlot,
    recoverPactMagicSlot,
  } = useCharacterStore();
  const { theme, setTheme } = useUIStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [isSwitchOpen, setIsSwitchOpen] = useState(false);
  const classNameMap = useMemo(
    () => Object.fromEntries(getAllClasses().map((c) => [c.id, c.name || c.id])),
    [],
  );
  const handleToggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

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

  const classInfo = formatClassInfo(activeCharacter?.classes, classNameMap);

  // Get per-class spellcasting stats
  const classSpellcasting = activeCharacter?.spells?.classSpellcasting ?? {};
  const spellcastingEntries = Object.entries(classSpellcasting).filter(
    ([, cs]) => cs.spellSaveDC > 0 || cs.spellAttackBonus > 0,
  );
  const isMulticlassSpellcaster = spellcastingEntries.length > 1;
  const hasSpellcasting = spellcastingEntries.length > 0;

  return (
    <Surface
      variant="default"
      className="border-b rounded-none px-3 py-1.5 flex items-center justify-between gap-2"
    >
      {/* Left: character info + spellcasting info grouped together */}
      {activeCharacter && (
        <div className="flex items-center gap-3 min-w-0">
          {/* Character identity — click to open sheet */}
          <Button
            onClick={() => setIsSheetOpen(true)}
            variant="ghost"
            className="character-button flex items-center gap-1.5 shrink-0 hover:bg-bg-tertiary rounded-md px-1.5 py-0.5 transition-colors cursor-pointer"
            title={t('openCharacterSheet')}
          >
            <User className="w-3 h-3 text-primary-500" />
            <Text weight="bold" size="sm" color="primary" className="whitespace-nowrap">
              {activeCharacter.name}
            </Text>
            <Text variant="label" className="ml-0.5">
              {classInfo}
            </Text>
            <ChevronRight className="w-3 h-3 text-text-tertiary opacity-60" />
          </Button>

          {/* Spellcasting stats + slots */}
          {hasSpellcasting && (
            <>
              <Divider orientation="vertical" className="hidden sm:block" />
              {/* Per-class spellcasting stats */}
              <div className="hidden sm:flex items-center gap-2">
                {spellcastingEntries.map(([classId, cs], i) => (
                  <Fragment key={classId}>
                    {i > 0 && <Divider orientation="vertical" size="sm" />}
                    <div className="flex items-center gap-1.5 text-center">
                      {isMulticlassSpellcaster && (
                        <Text variant="label" className="text-text-tertiary">
                          {(classNameMap[classId] ?? classId).slice(0, 3)}
                        </Text>
                      )}
                      <div>
                        <Text variant="label" className="mb-0.5">
                          DC
                        </Text>
                        <Text weight="bold" size="sm" color="accent">
                          {cs.spellSaveDC}
                        </Text>
                      </div>
                      {cs.spellAttackBonus > 0 && (
                        <div>
                          <Text variant="label" className="mb-0.5">
                            ATK
                          </Text>
                          <Text weight="bold" size="sm" color="accent">
                            +{cs.spellAttackBonus}
                          </Text>
                        </div>
                      )}
                    </div>
                  </Fragment>
                ))}
              </div>

              {/* Spell Slots — hidden on mobile */}
              {activeCharacter.spells?.spellSlots && (
                <div className="hidden sm:flex items-center gap-1.5">
                  <SpellSlots
                    slots={activeCharacter.spells.spellSlots}
                    pactMagicSlots={activeCharacter.spells.pactMagicSlots}
                    onConsumeSlot={consumeSpellSlot}
                    onRecoverSlot={recoverSpellSlot}
                    onConsumePactSlot={consumePactMagicSlot}
                    onRecoverPactSlot={recoverPactMagicSlot}
                    density="compact"
                    showLabels={false}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Right: less common actions */}
      <div className="ml-auto flex items-center gap-2 shrink-0">
        {/* Language Switcher */}
        <LanguageSwitcher />

        {/* Theme Toggle */}
        <ThemeToggle theme={theme} onToggle={handleToggleTheme} />

        {/* Switch / create character — less prominent */}
        <DropdownMenuRoot open={isSwitchOpen} onOpenChange={setIsSwitchOpen}>
          <DropdownMenuTrigger asChild>
            <IconButton
              size="sm"
              title={characters.length > 0 ? t('switchCharacter') : t('createCharacterAction')}
              className="text-text-tertiary hover:text-primary-600"
            >
              <Users />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48">
            {characters.length > 0 && (
              <>
                {characters.map((char) => (
                  <DropdownMenuItem
                    key={char.id}
                    onSelect={() => handleSelect(char)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm"
                  >
                    <User className="w-3 h-3 shrink-0" />
                    <span className="flex-1 truncate">{char.name}</span>
                    <Text variant="label">{formatClassInfo(char.classes, classNameMap)}</Text>
                    <IconButton
                      variant="secondary"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleEdit(char.id);
                      }}
                      className="hover:text-primary-600 ml-1"
                    >
                      <FileText className="w-2.5 h-2.5" />
                    </IconButton>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onSelect={handleCreate}>
              <Plus className="w-3 h-3 mr-2" />
              {t('addCharacter')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuRoot>

        {/* Short Rest */}
        <Button
          variant="ghost"
          size="sm"
          onClick={shortRest}
          className="text-text-secondary hover:text-primary-600 h-7 px-1.5"
        >
          <Sun className="w-3.5 h-3.5 md:mr-1" />
          <Text size="sm" className="hidden md:inline">
            {t('shortRest')}
          </Text>
        </Button>

        {/* Long Rest */}
        <Button
          variant="ghost"
          size="sm"
          onClick={longRest}
          className="text-text-secondary hover:text-primary-600 h-7 px-1.5"
        >
          <Moon className="w-3.5 h-3.5 md:mr-1" />
          <Text size="sm" className="hidden md:inline">
            {t('longRest')}
          </Text>
        </Button>
      </div>

      <CharacterModal open={isModalOpen} onOpenChange={setIsModalOpen} characterId={editingId} />

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
