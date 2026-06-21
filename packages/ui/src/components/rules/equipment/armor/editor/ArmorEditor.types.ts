import type { Armor } from 'open20-core';

// ── Form data type ──────────────────────────────────────────────

export interface ArmorFormData {
  id: string;
  source: string;
  name: string;
  category: 'Light' | 'Medium' | 'Heavy' | 'Shield';
  ac: number;
  dexBonus: boolean;
  maxDexBonus: number | '';
  strengthRequirement: number | '';
  stealthDisadvantage: boolean;
  costQuantity: number | '';
  costUnit: string;
  weight: number;
  description: string;
}

// ── Component Props ─────────────────────────────────────────────

export interface ArmorEditorProps {
  value?: Partial<Armor>;
  defaultValue?: Partial<Armor>;
  onChange?: (armor: Partial<Armor>) => void;
  onSubmit?: (armor: Armor, intent?: 'stay' | 'new' | 'close') => void;
  onCancel?: () => void;
  disabled?: boolean;
  className?: string;
  renderActions?: (props: {
    onSave: (intent: 'stay' | 'new' | 'close') => void;
    isDirty: boolean;
    isValid: boolean;
    isSubmitting: boolean;
  }) => React.ReactNode;
}

// ── Constants ───────────────────────────────────────────────────

export const ARMOR_CATEGORIES = ['Light', 'Medium', 'Heavy', 'Shield'] as const;

// ── Default values ──────────────────────────────────────────────

export const DEFAULT_ARMOR_FORM_DATA: ArmorFormData = {
  id: '',
  source: 'Homebrew',
  name: '',
  category: 'Light',
  ac: 11,
  dexBonus: true,
  maxDexBonus: '',
  strengthRequirement: '',
  stealthDisadvantage: false,
  costQuantity: '',
  costUnit: 'gp',
  weight: 0,
  description: '',
};

// ── Converter functions ─────────────────────────────────────────

export function armorToFormData(armor?: Partial<Armor>): ArmorFormData {
  if (!armor) return { ...DEFAULT_ARMOR_FORM_DATA };

  return {
    id: armor.id ?? '',
    source: armor.source ?? DEFAULT_ARMOR_FORM_DATA.source,
    name: armor.name ?? '',
    category: armor.category ?? DEFAULT_ARMOR_FORM_DATA.category,
    ac: armor.ac ?? DEFAULT_ARMOR_FORM_DATA.ac,
    dexBonus: armor.dexBonus ?? true,
    maxDexBonus: armor.maxDexBonus ?? '',
    strengthRequirement: armor.strengthRequirement ?? '',
    stealthDisadvantage: armor.stealthDisadvantage ?? false,
    costQuantity: armor.cost?.quantity ?? '',
    costUnit: armor.cost?.unit ?? 'gp',
    weight: armor.weight ?? 0,
    description: ((armor as Record<string, unknown>).description as string) ?? '',
  };
}

export function formDataToArmor(formData: ArmorFormData): Armor {
  const cost =
    typeof formData.costQuantity === 'number' && formData.costQuantity > 0
      ? { quantity: formData.costQuantity, unit: formData.costUnit || 'gp' }
      : undefined;

  return {
    id: formData.id,
    name: formData.name,
    source: formData.source,
    category: formData.category,
    ac: formData.ac,
    dexBonus: formData.dexBonus,
    maxDexBonus: typeof formData.maxDexBonus === 'number' ? formData.maxDexBonus : undefined,
    strengthRequirement:
      typeof formData.strengthRequirement === 'number' ? formData.strengthRequirement : undefined,
    stealthDisadvantage: formData.stealthDisadvantage || undefined,
    weight: formData.weight,
    cost,
  } as Armor;
}
