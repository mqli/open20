import type { Species, SpeciesTrait, AbilityName } from 'open20-core';

// ── Mutable subtypes ─────────────────────────────────────────────

export interface MutableSpeciesTrait {
  name: string;
  description?: string;
}

// ── Form data type ──────────────────────────────────────────────

export interface SpeciesFormData {
  id: string;
  source: string;
  description: string;
  size: 'Small' | 'Medium';
  speed: number;
  languages: string;
  abilityBonuses: Partial<Record<AbilityName, number>>;
  baseTraits: MutableSpeciesTrait[];
  darkvision?: number;
}

// ── Component Props ─────────────────────────────────────────────

export interface SpeciesEditorProps {
  /** Controlled mode: current species data */
  value?: Partial<Species>;
  /** Uncontrolled mode: default species data */
  defaultValue?: Partial<Species>;
  /** Form value change callback */
  onChange?: (species: Partial<Species>) => void;
  /** Form submit callback */
  onSubmit?: (species: Species, intent?: 'stay' | 'new' | 'close') => void;
  /** Cancel button callback */
  onCancel?: () => void;
  /** Disable all inputs */
  disabled?: boolean;
  /** Custom class name */
  className?: string;
  /** Custom action buttons (replaces default save/cancel) */
  renderActions?: (props: {
    onSave: (intent: 'stay' | 'new' | 'close') => void;
    isDirty: boolean;
    isValid: boolean;
    isSubmitting: boolean;
  }) => React.ReactNode;
}

// ── Constants ───────────────────────────────────────────────────

export const SPECIES_SIZES = ['Small', 'Medium'] as const;

export const ABILITY_LABELS: { label: string; key: AbilityName }[] = [
  { label: 'STR', key: 'Strength' },
  { label: 'DEX', key: 'Dexterity' },
  { label: 'CON', key: 'Constitution' },
  { label: 'INT', key: 'Intelligence' },
  { label: 'WIS', key: 'Wisdom' },
  { label: 'CHA', key: 'Charisma' },
];

// ── Default values ──────────────────────────────────────────────

export const DEFAULT_SPECIES_FORM_DATA: SpeciesFormData = {
  id: '',
  source: 'Homebrew',
  description: '',
  size: 'Medium',
  speed: 30,
  languages: '',
  abilityBonuses: {},
  baseTraits: [],
};

// ── Converter functions ─────────────────────────────────────────

/** Convert a Partial<Species> to SpeciesFormData (mutable) */
export function speciesToFormData(species?: Partial<Species>): SpeciesFormData {
  if (!species) return { ...DEFAULT_SPECIES_FORM_DATA };

  return {
    id: species.id ?? DEFAULT_SPECIES_FORM_DATA.id,
    source: species.source ?? DEFAULT_SPECIES_FORM_DATA.source,
    description: species.description ?? DEFAULT_SPECIES_FORM_DATA.description,
    size: species.size ?? DEFAULT_SPECIES_FORM_DATA.size,
    speed: species.speed ?? DEFAULT_SPECIES_FORM_DATA.speed,
    languages: (species.languages ?? []).join(', '),
    abilityBonuses: { ...(species.abilityBonuses ?? {}) },
    baseTraits: (species.baseTraits ?? []).map((t) => ({
      name: t.name,
      description: t.description,
    })),
    darkvision: species.darkvision,
  };
}

/** Convert SpeciesFormData back to Species */
export function formDataToSpecies(formData: SpeciesFormData): Species {
  const languages = formData.languages
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  return {
    id: formData.id,
    source: formData.source,
    description: formData.description,
    size: formData.size,
    speed: formData.speed,
    languages: languages as readonly string[],
    abilityBonuses: formData.abilityBonuses as Partial<Record<AbilityName, number>>,
    baseTraits: formData.baseTraits as readonly SpeciesTrait[],
    darkvision: formData.darkvision,
  } as Species;
}
