import type { Gear } from 'open20-core';

// ── Form data type ──────────────────────────────────────────────

export interface GearFormData {
  id: string;
  source: string;
  name: string;
  type: 'gears' | 'consumable';
  weight: number;
  cost: string;
  equipped: boolean;
  quantity: number | '';
  description: string;
}

// ── Component Props ─────────────────────────────────────────────

export interface GearEditorProps {
  value?: Partial<Gear>;
  defaultValue?: Partial<Gear>;
  onChange?: (gear: Partial<Gear>) => void;
  onSubmit?: (gear: Gear, intent?: 'stay' | 'new' | 'close') => void;
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

export const GEAR_TYPES = ['gears', 'consumable'] as const;

// ── Default values ──────────────────────────────────────────────

export const DEFAULT_GEAR_FORM_DATA: GearFormData = {
  id: '',
  source: 'Homebrew',
  name: '',
  type: 'gears',
  weight: 0,
  cost: '',
  equipped: false,
  quantity: '',
  description: '',
};

// ── Converter functions ─────────────────────────────────────────

export function gearToFormData(gear?: Partial<Gear>): GearFormData {
  if (!gear) return { ...DEFAULT_GEAR_FORM_DATA };

  return {
    id: gear.id ?? '',
    source: gear.source ?? DEFAULT_GEAR_FORM_DATA.source,
    name: gear.name ?? '',
    type: gear.type ?? DEFAULT_GEAR_FORM_DATA.type,
    weight: gear.weight ?? 0,
    cost: gear.cost ?? '',
    equipped: gear.equipped ?? false,
    quantity: gear.quantity ?? '',
    description: ((gear as Record<string, unknown>).description as string) ?? '',
  };
}

export function formDataToGear(formData: GearFormData): Gear {
  return {
    id: formData.id,
    name: formData.name,
    source: formData.source,
    type: formData.type,
    weight: formData.weight,
    cost: formData.cost || undefined,
    equipped: formData.equipped,
    quantity:
      typeof formData.quantity === 'number' && formData.quantity > 0
        ? formData.quantity
        : undefined,
  } as Gear;
}
