import { BookMarked, Star } from 'lucide-react';
import { IconButton } from '@open20/ui';
import { ClassActionDropdown } from './ClassActionDropdown';

interface SpellbookControlsProps {
  showCantripButton: boolean;
  showLearnButton: boolean;
  showPrepareButton: boolean;
  isCantripKnown: boolean;
  isKnown: boolean;
  isPrepared: boolean;
  matchingClassIds: string[];
  cantripKnownClassIds: string[];
  preparedClassIds: string[];
  alwaysPreparedClassIds: string[];
  onLearnToggle: () => void;
  onCantripMultiToggle: (classId: string) => void;
  onCantripSingleClick: () => void;
  onPrepareMultiToggle: (classId: string) => void;
  onPrepareSingleClick: () => void;
}

export function SpellbookControls({
  showCantripButton,
  showLearnButton,
  showPrepareButton,
  isCantripKnown,
  isKnown,
  isPrepared,
  matchingClassIds,
  cantripKnownClassIds,
  preparedClassIds,
  alwaysPreparedClassIds,
  onLearnToggle,
  onCantripMultiToggle,
  onCantripSingleClick,
  onPrepareMultiToggle,
  onPrepareSingleClick,
}: SpellbookControlsProps) {
  return (
    <>
      {showCantripButton && (
        matchingClassIds.length > 1 ? (
          <ClassActionDropdown
            matchingClassIds={matchingClassIds}
            activeClassIds={cantripKnownClassIds}
            label="Cantrip"
            onToggle={onCantripMultiToggle}
          />
        ) : (
          <IconButton
            variant="info"
            active={isCantripKnown}
            onClick={onCantripSingleClick}
            title={isCantripKnown ? 'Unlearn Cantrip' : 'Learn Cantrip'}
          >
            <BookMarked className="w-3.5 h-3.5" />
          </IconButton>
        )
      )}

      {showLearnButton && (
        <IconButton
          variant="info"
          active={isKnown}
          onClick={onLearnToggle}
          title={isKnown ? 'Unlearn Spell' : 'Learn Spell'}
        >
          <BookMarked className="w-3.5 h-3.5" />
        </IconButton>
      )}

      {showPrepareButton && (
        matchingClassIds.length > 1 ? (
          <ClassActionDropdown
            matchingClassIds={matchingClassIds}
            activeClassIds={preparedClassIds}
            disabledActiveClassIds={alwaysPreparedClassIds}
            label="Spell"
            onToggle={onPrepareMultiToggle}
            variant="primary"
            active={isPrepared}
          />
        ) : (
          <IconButton
            variant="primary"
            active={isPrepared}
            disabled={
              matchingClassIds.length === 1
                && alwaysPreparedClassIds.includes(matchingClassIds[0] ?? '')
            }
            onClick={onPrepareSingleClick}
            title={
              matchingClassIds.length === 1 && alwaysPreparedClassIds.includes(matchingClassIds[0] ?? '')
                ? 'Always Prepared'
                : isPrepared
                  ? 'Unprepare Spell'
                  : 'Prepare Spell'
            }
          >
            <Star className={`w-3.5 h-3.5 ${isPrepared ? 'fill-current' : ''}`} />
          </IconButton>
        )
      )}
    </>
  );
}
