import { Button, FilterChip } from '@open20/ui';
import { Moon, Sun } from 'lucide-react';
import { useTranslation } from '@/i18n';

interface CharacterBottomControlsProps {
  canPrepare: boolean;
  canLearn: boolean;
  showPreparedOnly: boolean;
  showKnownOnly: boolean;
  onShowPreparedOnlyChange: (value: boolean) => void;
  onShowKnownOnlyChange: (value: boolean) => void;
  onShortRest: () => void;
  onLongRest: () => void;
}

export function CharacterBottomControls({
  canPrepare,
  canLearn,
  showPreparedOnly,
  showKnownOnly,
  onShowPreparedOnlyChange,
  onShowKnownOnlyChange,
  onShortRest,
  onLongRest,
}: CharacterBottomControlsProps) {
  const t = useTranslation();

  return (
    <div
      className="shrink-0 border-t border-border bg-bg-secondary px-3 py-2 space-y-1.5"
      data-testid="character-bottom-controls"
    >
      {(canLearn || canPrepare) && (
        <div className="flex gap-1.5">
          {canPrepare && (
            <FilterChip
              variant="primary"
              size="sm"
              active={showPreparedOnly}
              onPressedChange={onShowPreparedOnlyChange}
              className="prepared-toggle flex-1 justify-center"
            >
              {t('prepared')}
            </FilterChip>
          )}
          {canLearn && (
            <FilterChip
              variant="secondary"
              size="sm"
              active={showKnownOnly}
              onPressedChange={onShowKnownOnlyChange}
              className="known-toggle flex-1 justify-center"
            >
              {t('known')}
            </FilterChip>
          )}
        </div>
      )}
      <div className="flex gap-1.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onShortRest}
          className="flex-1 justify-center text-text-secondary hover:text-primary-600"
        >
          <Sun className="w-3.5 h-3.5 mr-1" />
          {t('shortRest')}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onLongRest}
          className="flex-1 justify-center text-text-secondary hover:text-primary-600"
        >
          <Moon className="w-3.5 h-3.5 mr-1" />
          {t('longRest')}
        </Button>
      </div>
    </div>
  );
}
