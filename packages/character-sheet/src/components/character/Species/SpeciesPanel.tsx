// SpeciesPanel.tsx (T-111 / T-215)
// Displays species name, subtype, senses, traits, languages, and size.
// Desktop: traits expanded by default. Mobile: collapsed.
// NFR-01: chevron + color for expand state. NFR-02: >=44px tap targets.
// T-215 added: senses (darkvision/blindsight/tremorsense/truesight), languages, size.

import { useState, useMemo } from 'react';
import { ChevronDown, Eye, Ear, Radar, Zap, Leaf } from 'lucide-react';
import { Surface, Text, Badge, Button, cn } from '@open20/ui';
import type { AppCharacter } from '@/types';
import {
  getSpeciesById,
  getSpeciesName,
  getSpeciesSenses,
  getSpeciesLanguages,
  getSpeciesSize,
} from '@/core/content-resolver';
import type { Species, SpeciesTrait, SpeciesSubtype } from 'open20-core';
import type { SenseInfo } from '@open20/content-srd/query/catalog';
import { useIsLargeScreen } from '@/hooks/useIsLargeScreen';

export interface SpeciesPanelProps {
  character: AppCharacter;
  className?: string;
}

// ─── Sense icons ─────────────────────────────────────────────

const SENSE_ICONS: Record<
  string,
  React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
> = {
  Darkvision: Eye,
  Blindsight: Ear,
  Tremorsense: Radar,
  Truesight: Zap,
};

function SenseRow({ sense }: { sense: SenseInfo }) {
  const Icon = SENSE_ICONS[sense.name] ?? Eye;

  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-text-secondary" aria-hidden />
      <Text variant="labelSm" weight="medium">
        {sense.name}
      </Text>
      {sense.range !== undefined && (
        <Text variant="labelSm" color="secondary">
          {sense.range} ft.
        </Text>
      )}
    </div>
  );
}

// ─── Trait helpers ────────────────────────────────────────────

/** Look up the matching subtype object from species data. */
function findSubtype(
  species: Species | undefined,
  subtypeId: string | null | undefined,
): SpeciesSubtype | undefined {
  if (!species?.subtypes || !subtypeId) return undefined;
  return species.subtypes.find((s) => s.id === subtypeId);
}

/** Collect all traits: base + matched subtype. */
function collectTraits(
  species: Species | undefined,
  subtype: SpeciesSubtype | undefined,
): SpeciesTrait[] {
  const base = species?.baseTraits ?? [];
  const sub = subtype?.traits ?? [];
  return [...base, ...sub];
}

interface TraitCardProps {
  trait: SpeciesTrait;
  initiallyExpanded: boolean;
}

function TraitCard({ trait, initiallyExpanded }: TraitCardProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  if (!trait.description) {
    // No description — just a plain label
    return (
      <div className="flex items-center gap-2 py-1.5">
        <div className="h-1.5 w-1.5 rounded-full bg-primary-500 shrink-0" />
        <Text variant="bodySm" weight="medium">
          {trait.name}
        </Text>
      </div>
    );
  }

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start gap-2 py-1.5 px-0 hover:bg-primary-100 dark:hover:bg-primary-900/20 focus-visible:ring-2 focus-visible:ring-primary-600 rounded-md"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-label={`${expanded ? 'Collapse' : 'Expand'} ${trait.name}`}
      >
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-text-secondary transition-transform duration-200',
            'motion-reduce:transition-none',
            expanded && 'rotate-180',
          )}
          aria-hidden
        />
        <Text variant="bodySm" weight="medium" className="text-left">
          {trait.name}
        </Text>
      </Button>

      <div
        aria-hidden={!expanded || undefined}
        className={cn(
          'grid transition-all duration-200 ease-in-out',
          'motion-reduce:transition-none',
          expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <Text variant="bodySm" color="secondary" className="pl-6 pb-2">
            {trait.description}
          </Text>
        </div>
      </div>
    </div>
  );
}

export function SpeciesPanel({ character, className }: SpeciesPanelProps) {
  const { isDesktop } = useIsLargeScreen();
  const species = useMemo(() => getSpeciesById(character.species), [character.species]);
  const subtype = useMemo(
    () => findSubtype(species, character.speciesSubtype),
    [species, character.speciesSubtype],
  );
  const traits = useMemo(() => collectTraits(species, subtype), [species, subtype]);

  // T-215: senses, languages, size from T-016 API
  const senses = useMemo(() => getSpeciesSenses(character), [character]);
  const languages = useMemo(() => getSpeciesLanguages(character), [character]);
  const sizeLabel = useMemo(() => getSpeciesSize(character), [character]);

  // Unknown species fallback
  if (!species) {
    const fallbackName = getSpeciesName(character.species);
    return (
      <Surface variant="default" padding="sm" className={className}>
        <div className="flex items-center gap-2 mb-2">
          <Leaf className="h-5 w-5 text-primary-500 shrink-0" aria-hidden />
          <Text variant="label" weight="bold">
            Species
          </Text>
          <Badge variant="warning" size="sm">
            Unknown
          </Badge>
        </div>
        <Text variant="bodySm" color="secondary">
          {fallbackName} — data not found in the SRD content pack.
        </Text>
      </Surface>
    );
  }

  // When a subtype is selected, display its name (e.g. "High Elf").
  // Otherwise display the species id which is also its display name.
  const speciesLabel = subtype ? subtype.name : species.id;

  return (
    <Surface variant="default" padding="sm" className={cn('flex flex-col gap-2', className)}>
      {/* Header */}
      <div className="flex items-center gap-2">
        <Leaf className="h-5 w-5 text-primary-500 shrink-0" aria-hidden />
        <Text variant="label" weight="bold">
          Species
        </Text>
        <Badge variant="primary" size="sm">
          {speciesLabel}
        </Badge>
        <Text variant="bodySm" color="secondary">
          {sizeLabel}, {species.speed} ft
        </Text>
      </div>

      {/* Species description */}
      {species.description && (
        <Text variant="bodySm" color="secondary">
          {species.description}
        </Text>
      )}

      {/* T-215: Senses */}
      {senses.length > 0 && (
        <div>
          <Text variant="labelSm" color="secondary" className="mb-1.5 uppercase tracking-wide">
            Senses
          </Text>
          <div className="flex flex-col gap-1">
            {senses.map((sense) => (
              <SenseRow key={sense.name} sense={sense} />
            ))}
          </div>
        </div>
      )}

      {/* Traits */}
      {traits.length > 0 && (
        <div>
          <Text variant="labelSm" color="secondary" className="mb-1 uppercase tracking-wide">
            Traits
          </Text>
          <div className="divide-y divide-border">
            {traits.map((trait) => (
              <TraitCard key={trait.name} trait={trait} initiallyExpanded={isDesktop} />
            ))}
          </div>
        </div>
      )}

      {/* T-215: Languages */}
      {languages.length > 0 && (
        <div>
          <Text variant="labelSm" color="secondary" className="mb-1.5 uppercase tracking-wide">
            Languages
          </Text>
          <div className="flex flex-wrap gap-1">
            {languages.map((lang) => (
              <Badge key={lang} variant="secondary" size="sm">
                {lang}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* T-215: Size (explicit label below traits, even though also in header) */}
      <div className="flex items-center gap-2">
        <Text variant="labelSm" color="secondary" className="uppercase tracking-wide">
          Size:
        </Text>
        <Text variant="bodySm" weight="medium">
          {sizeLabel}
        </Text>
      </div>
    </Surface>
  );
}
