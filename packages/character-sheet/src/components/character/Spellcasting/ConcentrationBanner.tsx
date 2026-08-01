// ConcentrationBanner.tsx (T-117)
// Amber banner showing the concentrating spell name. When damage is taken
// while concentrating, shows a CON save prompt with the correct DC.

import { Brain, X } from 'lucide-react';
import { Surface, Text, Button } from '@open20/ui';

export interface ConcentrationBannerProps {
  /** Resolved spell name (from content-resolver). */
  spellName: string;
  /** Damage amount that triggered the CON save (null = no pending save). */
  damageAmount: number | null;
  /** Pre-calculated concentration DC (null when no pending save). */
  concentrationDC: number | null;
  /** Called when user clicks "End Concentration". */
  onEndConcentration: () => void;
  /** Called when user clicks "Roll CON Save" for the damage-triggered check. */
  onRollConcentrationSave: () => void;
}

export function ConcentrationBanner({
  spellName,
  damageAmount,
  concentrationDC,
  onEndConcentration,
  onRollConcentrationSave,
}: ConcentrationBannerProps) {
  const hasDamageSave = damageAmount !== null && concentrationDC !== null;

  return (
    <Surface
      variant="tint"
      padding="md"
      className="bg-amber-500/10 border border-amber-500/25 flex items-start gap-3"
      data-testid="concentration-banner"
    >
      {/* Brain icon */}
      <Surface
        variant="ghost"
        padding="xs"
        className="bg-amber-500/15 text-amber-500 shrink-0 mt-0.5"
      >
        <Brain className="h-4 w-4" aria-hidden="true" />
      </Surface>

      {/* Content */}
      <div className="min-w-0 flex-1 flex flex-col gap-1.5">
        <div>
          <Text variant="label" className="text-amber-600">
            Concentrating
          </Text>
          <Text weight="bold" className="truncate">
            {spellName}
          </Text>
        </div>

        {/* CON save prompt (only when damage was taken while concentrating) */}
        {hasDamageSave && (
          <div className="flex items-center gap-2 flex-wrap">
            <Text variant="caption" className="text-amber-600">
              DC {concentrationDC} CON save
            </Text>
            <Button
              variant="outline"
              size="sm"
              onClick={onRollConcentrationSave}
              aria-label={`Roll DC ${concentrationDC} Constitution save for concentration`}
              className="border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
            >
              Roll CON Save
            </Button>
          </div>
        )}
      </div>

      {/* End Concentration button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onEndConcentration}
        aria-label={`End concentration on ${spellName}`}
        className="shrink-0 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
      >
        <X className="h-4 w-4" />
      </Button>
    </Surface>
  );
}
