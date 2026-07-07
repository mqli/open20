import { useState, useMemo } from 'react';
import { useCharacterStore } from '@/stores/characterStore';
import { useSpellStore } from '@/stores/spellStore';
import { resolveDeps } from '@/core/content-resolver';
import { getCasterType } from 'open20-core/spells';
import { Surface } from '@open20/ui';
import { CharacterSelector } from '@/components/layout/CharacterSelector';
import { CharacterBottomControls } from '@/components/layout/CharacterBottomControls';
import { CharacterSheetContent } from '@/components/character/CharacterSheet/CharacterSheet';
import { CharacterModal } from '@/components/character/CharacterModal';

export function CharacterPanel() {
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
          <CharacterBottomControls
            canPrepare={casterType.canPrepare}
            canLearn={casterType.canLearn}
            showPreparedOnly={showPreparedOnly}
            showKnownOnly={showKnownOnly}
            onShowPreparedOnlyChange={setShowPreparedOnly}
            onShowKnownOnlyChange={setShowKnownOnly}
            onShortRest={shortRest}
            onLongRest={longRest}
          />
        </>
      ) : (
        <div className="flex-1" />
      )}

      <CharacterModal open={isModalOpen} onOpenChange={setIsModalOpen} characterId={editingId} />
    </Surface>
  );
}
