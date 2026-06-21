import type { Background, Gear } from 'open20-core';

// ── Form data type ──────────────────────────────────────────────

export interface BackgroundFormData {
  id: string;
  source: string;
  name: string;
  description: string;
  skillProficiencies: string[];
  toolProficiencies: string;
  languages: string;
  originFeatId: string;
  startingEquipment: string;
  startingGold: number;
}

// ── Component Props ─────────────────────────────────────────────

export interface BackgroundEditorProps {
  /** Controlled mode: current background data */
  value?: Partial<Background>;
  /** Uncontrolled mode: default background data */
  defaultValue?: Partial<Background>;
  /** Form value change callback */
  onChange?: (background: Partial<Background>) => void;
  /** Form submit callback */
  onSubmit?: (background: Background, intent?: 'stay' | 'new' | 'close') => void;
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

export const COMMON_SKILLS = [
  'Acrobatics',
  'Animal Handling',
  'Arcana',
  'Athletics',
  'Deception',
  'History',
  'Insight',
  'Intimidation',
  'Investigation',
  'Medicine',
  'Nature',
  'Perception',
  'Performance',
  'Persuasion',
  'Religion',
  'Sleight of Hand',
  'Stealth',
  'Survival',
] as const;

// ── Default values ──────────────────────────────────────────────

export const DEFAULT_BACKGROUND_FORM_DATA: BackgroundFormData = {
  id: '',
  source: 'Homebrew',
  name: '',
  description: '',
  skillProficiencies: [],
  toolProficiencies: '',
  languages: '',
  originFeatId: '',
  startingEquipment: '',
  startingGold: 0,
};

// ── Converter functions ─────────────────────────────────────────

/** Convert a Partial<Background> to BackgroundFormData (mutable) */
export function backgroundToFormData(background?: Partial<Background>): BackgroundFormData {
  if (!background) return { ...DEFAULT_BACKGROUND_FORM_DATA };

  return {
    id: background.id ?? DEFAULT_BACKGROUND_FORM_DATA.id,
    source: background.source ?? DEFAULT_BACKGROUND_FORM_DATA.source,
    name: background.name ?? DEFAULT_BACKGROUND_FORM_DATA.name,
    description: background.description ?? DEFAULT_BACKGROUND_FORM_DATA.description,
    skillProficiencies: [...(background.skillProficiencies ?? [])],
    toolProficiencies: (background.toolProficiencies ?? []).join(', '),
    languages: (background.languages ?? []).join(', '),
    originFeatId: background.originFeatId ?? DEFAULT_BACKGROUND_FORM_DATA.originFeatId,
    startingEquipment: (background.startingEquipment ?? [])
      .map((g) => `${g.name}${g.quantity ? ` | ${g.quantity}` : ''}`)
      .join('\n'),
    startingGold: background.startingGold ?? DEFAULT_BACKGROUND_FORM_DATA.startingGold,
  };
}

/** Convert BackgroundFormData back to Background */
export function formDataToBackground(formData: BackgroundFormData): Background {
  const toolProficiencies = formData.toolProficiencies
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const languages = formData.languages
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const startingEquipment: readonly Gear[] = formData.startingEquipment
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, qtyStr] = line.split('|').map((s) => s.trim());
      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        quantity: qtyStr ? Number(qtyStr) : 1,
      } as Gear;
    });

  return {
    id: formData.id,
    source: formData.source,
    name: formData.name || undefined,
    description: formData.description || undefined,
    skillProficiencies: formData.skillProficiencies as readonly string[],
    toolProficiencies: toolProficiencies as readonly string[],
    languages: languages as readonly string[],
    originFeatId: formData.originFeatId,
    startingEquipment: startingEquipment.length > 0 ? startingEquipment : undefined,
    startingGold: formData.startingGold,
  } as Background;
}
