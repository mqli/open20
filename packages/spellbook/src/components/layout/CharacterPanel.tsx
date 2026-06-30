import { useState, useMemo } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { useSpellStore } from '@/stores/spellStore';
import { resolveDeps } from '@/core/content-resolver';
import { getCasterType } from 'open20-core/spells';
import { Button, Surface, Toggle } from '@open20/ui';
import { CharacterSelector } from '@/components/layout/CharacterSelector';
import { CharacterSheetContent } from '@/components/character/CharacterSheet/CharacterSheet';
import { CharacterModal } from '@/components/character/CharacterModal';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from '@/i18n';

export function CharacterPanel() {
  const t = useTranslation();
  const { activeCharacter, longRest, shortRest } = useCharacterStore();
  const { showPreparedOnly, setShowPreparedOnly, showKnownOnly, setShowKnownOnly } =
    useSpellStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();

  const casterType = useMemo(() => {
    if (!activeCharacter) return { canLearn: false, canPrepare: false };
    return getCasterType(activeCharacter, resolveDeps(activeCharacter));
  }, [activeCharacter]);

  const handleEdit = (id: string) => {
    setEditingId(id);
    requestAnimationFrame(() => setIsModalOpen(true));
  };

  const handleEditActive = () => {
    if (activeCharacter) handleEdit(activeCharacter.id);
  };

  return (
    <Surface
      variant="default"
      className="flex flex-col h-full rounded-none border-r"
      data-testid="character-panel"
    >
      {/* Character Selector */}
      <div className="shrink-0 px-3 py-2 border-b border-border">
        <CharacterSelector />
      </div>

      {/* Active Character Content */}
      {activeCharacter ? (
        <>
          <div className="flex-1 overflow-y-auto px-3 py-3">
            <CharacterSheetContent onEdit={handleEditActive} />
          </div>

          {/* Fixed Bottom Controls */}
          <div className="shrink-0 border-t border-border bg-bg-secondary px-3 py-2 space-y-1.5">
            {(casterType.canLearn || casterType.canPrepare) && (
              <div className="flex gap-1.5">
                {casterType.canPrepare && (
                  <Toggle
                    variant="primary"
                    size="sm"
                    pressed={showPreparedOnly}
                    onPressedChange={() => setShowPreparedOnly(!showPreparedOnly)}
                    className="prepared-toggle flex-1 justify-center"
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
                    className="known-toggle flex-1 justify-center"
                  >
                    {t('known')}
                  </Toggle>
                )}
              </div>
            )}
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
        </>
      ) : (
        <div className="flex-1" />
      )}

      <CharacterModal open={isModalOpen} onOpenChange={setIsModalOpen} characterId={editingId} />
    </Surface>
  );
}
