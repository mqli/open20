import {
  IconButton,
  UnLearnSpellIcon,
  LearnSpellIcon,
  PrepareSpellIcon,
  PreparedSpellIcon,
} from '@open20/ui';
import { ClassActionDropdown } from './ClassActionDropdown';
import { useTranslation } from '@/i18n';

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
  const t = useTranslation();
  const prepareIcon = isPrepared || isCantripKnown ? <PreparedSpellIcon /> : <PrepareSpellIcon />;
  if (showCantripButton) {
    return matchingClassIds.length > 1 && !isPrepared ? (
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
        {prepareIcon}
      </IconButton>
    );
  }

  return (
    <>
      {showLearnButton && (
        <IconButton
          variant="info"
          active={isKnown}
          onClick={onLearnToggle}
          title={isKnown ? t('unlearnSpell') : t('learnSpell')}
        >
          {isKnown ? <UnLearnSpellIcon /> : <LearnSpellIcon />}
        </IconButton>
      )}
      {showPrepareButton &&
        (matchingClassIds.length > 1 && !isPrepared ? (
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
            {prepareIcon}
          </IconButton>
        ))}
    </>
  );
}
