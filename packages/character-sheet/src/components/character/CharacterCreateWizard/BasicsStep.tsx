// BasicsStep.tsx (T-120, step 1) — §7.4
// Name, species, optional lineage (subtype) and background.
//
// Alignment is intentionally omitted: neither core's `Character` nor
// `CreateCharacterParams` has an alignment field, and T-120 does not change
// core. Species subtype takes its place — real SRD data, display-only
// (RecomputeDerivedStatsDeps has no subtype slot).

import { useMemo } from 'react';
import { Input, Text } from '@open20/ui';
import { getAllBackgrounds, getAllSpecies, getSpeciesById } from '@/core/content-resolver';
import { OptionGrid, type GridOption } from './OptionGrid';

const NONE = '__none__';

export interface BasicsStepProps {
  name: string;
  speciesId: string;
  speciesSubtypeId?: string;
  backgroundId: string;
  onChange: (patch: {
    name?: string;
    speciesId?: string;
    speciesSubtypeId?: string;
    backgroundId?: string;
  }) => void;
}

function abilityBonusSummary(bonuses: Partial<Record<string, number>>): string | undefined {
  const entries = Object.entries(bonuses).filter(([, v]) => typeof v === 'number' && v !== 0);
  if (entries.length === 0) return undefined;
  return entries.map(([ability, v]) => `${ability.slice(0, 3).toUpperCase()} +${v}`).join(' ');
}

export function BasicsStep({
  name,
  speciesId,
  speciesSubtypeId,
  backgroundId,
  onChange,
}: BasicsStepProps) {
  const speciesOptions = useMemo<GridOption[]>(
    () =>
      getAllSpecies().map((species) => ({
        // Species has no `name` field — its id IS the display label.
        id: species.id,
        label: species.id,
        sublabel: abilityBonusSummary(species.abilityBonuses),
      })),
    [],
  );

  const subtypeOptions = useMemo<GridOption[]>(() => {
    const subtypes = speciesId ? (getSpeciesById(speciesId)?.subtypes ?? []) : [];
    if (subtypes.length === 0) return [];
    return [
      { id: NONE, label: 'None' },
      ...subtypes.map((subtype) => ({ id: subtype.id, label: subtype.name })),
    ];
  }, [speciesId]);

  const backgroundOptions = useMemo<GridOption[]>(
    () =>
      getAllBackgrounds().map((background) => ({
        id: background.id,
        label: background.name ?? background.id,
        sublabel: background.skillProficiencies.join(', '),
      })),
    [],
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="wizard-character-name">
          <Text as="span" variant="labelSm" color="secondary">
            Character name
          </Text>
        </label>
        <Input
          id="wizard-character-name"
          value={name}
          placeholder="e.g. Tharion"
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </div>

      <OptionGrid
        legend="Species"
        options={speciesOptions}
        value={speciesId}
        // Changing species invalidates any previously picked lineage.
        onChange={(id) => onChange({ speciesId: id, speciesSubtypeId: undefined })}
      />

      {subtypeOptions.length > 0 && (
        <OptionGrid
          legend="Lineage (optional)"
          options={subtypeOptions}
          value={speciesSubtypeId ?? NONE}
          onChange={(id) => onChange({ speciesSubtypeId: id === NONE ? undefined : id })}
        />
      )}

      <OptionGrid
        legend="Background"
        options={backgroundOptions}
        value={backgroundId}
        onChange={(id) => onChange({ backgroundId: id })}
      />
    </div>
  );
}
