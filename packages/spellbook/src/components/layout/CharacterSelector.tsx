import { useState, useMemo } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import type { AppCharacter } from '@/core/types';
import { getAllClasses } from '@/core/content-resolver';
import { spellService } from '@/core/spell-service';
import { CharacterModal } from '@/components/character/CharacterModal';
import {
  Button,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  Text,
} from '@open20/ui';
import { Plus, User, FileText, ChevronDown } from 'lucide-react';
import { useTranslation } from '@/i18n';

function formatClassInfo(
  classes: readonly { classId: string; level: number }[] | undefined,
  classNameMap: { [k: string]: string },
): string {
  if (!classes || classes.length === 0) return 'Lvl 1';
  return classes.map((c) => `${classNameMap[c.classId] ?? c.classId} ${c.level}`).join(' / ');
}

interface CharacterSelectorProps {
  compact?: boolean;
}

export function CharacterSelector({ compact }: CharacterSelectorProps) {
  const t = useTranslation();
  const { characters, activeCharacter, setActiveCharacter } = useCharacterStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();

  const classNameMap = useMemo(
    () =>
      spellService.isReady()
        ? Object.fromEntries(getAllClasses().map((c) => [c.id, c.name || c.id]))
        : ({} as Record<string, string>),
    [],
  );

  const handleCreate = () => {
    setEditingId(undefined);
    setIsOpen(false);
    requestAnimationFrame(() => setIsModalOpen(true));
  };

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsOpen(false);
    requestAnimationFrame(() => setIsModalOpen(true));
  };

  const handleSelect = (char: AppCharacter) => {
    setActiveCharacter(char);
    setIsOpen(false);
  };

  const classInfo = formatClassInfo(activeCharacter?.classes, classNameMap);

  return (
    <>
      <DropdownMenuRoot open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={`justify-between px-2 py-1.5 hover:bg-bg-tertiary rounded-md ${
              compact ? 'gap-1' : 'w-full'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <User className="w-4 h-4 text-primary-500 shrink-0" />
              {compact ? (
                <Text weight="bold" size="sm" className="truncate max-w-[80px]">
                  {activeCharacter?.name ?? t('noCharacterSelected')}
                </Text>
              ) : activeCharacter ? (
                <div className="text-left min-w-0">
                  <Text weight="bold" size="sm" className="truncate">
                    {activeCharacter.name}
                  </Text>
                  <Text variant="label" className="truncate">
                    {classInfo}
                  </Text>
                </div>
              ) : (
                <Text variant="label">{t('noCharacterSelected')}</Text>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-text-tertiary shrink-0" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
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

      <CharacterModal open={isModalOpen} onOpenChange={setIsModalOpen} characterId={editingId} />
    </>
  );
}
