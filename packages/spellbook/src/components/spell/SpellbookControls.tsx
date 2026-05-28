import { IconButton } from '@open20/ui';
import { PrepareSpellIcon, KnownSpellIcon } from '@open20/ui';
import { ClassActionDropdown } from './ClassActionDropdown';
import { useSpellbookTranslation } from '@/i18n';

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
  const t = useSpellbookTranslation();
  return (
    <>
      {showCantripButton &&
        (matchingClassIds.length > 1 ? (
          <ClassActionDropdown
            matchingClassIds={matchingClassIds}
            activeClassIds={cantripKnownClassIds}
            label={t('cantrip')}
            onToggle={onCantripMultiToggle}
          />
        ) : (
          <IconButton
            variant="info"
            active={isCantripKnown}
            onClick={onCantripSingleClick}
            title={isCantripKnown ? t('unlearnCantripAction') : t('learnCantripAction')}
          >
            <PrepareSpellIcon />
          </IconButton>
        ))}

      {showLearnButton && (
        <IconButton
          variant="info"
          active={isKnown}
          onClick={onLearnToggle}
          title={isKnown ? t('unlearnSpell') : t('learnSpell')}
        >
          <PrepareSpellIcon />
        </IconButton>
      )}

      {showPrepareButton &&
        (matchingClassIds.length > 1 ? (
          <ClassActionDropdown
            matchingClassIds={matchingClassIds}
            activeClassIds={preparedClassIds}
            disabledActiveClassIds={alwaysPreparedClassIds}
            label={t('spells')}
            onToggle={onPrepareMultiToggle}
            variant="primary"
            active={isPrepared}
          />
        ) : (
          <IconButton
            variant="primary"
            active={isPrepared}
            disabled={
              matchingClassIds.length === 1 &&
              alwaysPreparedClassIds.includes(matchingClassIds[0] ?? '')
            }
            onClick={onPrepareSingleClick}
            title={
              matchingClassIds.length === 1 &&
              alwaysPreparedClassIds.includes(matchingClassIds[0] ?? '')
                ? t('alwaysPreparedLabel')
                : isPrepared
                  ? t('unprepareSpell')
                  : t('prepareSpell')
            }
          >
            <KnownSpellIcon className={isPrepared ? 'fill-current' : ''} />
          </IconButton>
        ))}
    </>
  );
}
