import type { Feat, FeatCategory, FeatPrerequisite, FeatGrant } from 'open20-core';

// ── Mutable subtypes ─────────────────────────────────────────────

export interface MutableFeatPrerequisite {
  level?: number;
  classId?: string;
  species?: string;
}

// ── Form data type ──────────────────────────────────────────────

export interface FeatFormData {
  id: string;
  source: string;
  name: string;
  description: string;
  category: FeatCategory;
  prerequisites: MutableFeatPrerequisite;
  grants: readonly FeatGrant[];
  repeatable: boolean;
}

// ── Component Props ─────────────────────────────────────────────

export interface FeatEditorProps {
  /** Controlled mode: current feat data */
  value?: Partial<Feat>;
  /** Uncontrolled mode: default feat data */
  defaultValue?: Partial<Feat>;
  /** Form value change callback */
  onChange?: (feat: Partial<Feat>) => void;
  /** Form submit callback */
  onSubmit?: (feat: Feat, intent?: 'stay' | 'new' | 'close') => void;
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

export const FEAT_CATEGORIES: FeatCategory[] = ['Origin', 'General', 'Fighting Style', 'Epic Boon'];

// ── Default values ──────────────────────────────────────────────

export const DEFAULT_FEAT_FORM_DATA: FeatFormData = {
  id: '',
  source: 'Homebrew',
  name: '',
  description: '',
  category: 'General',
  prerequisites: {},
  grants: [],
  repeatable: false,
};

// ── Converter functions ─────────────────────────────────────────

/** Convert a Partial<Feat> to FeatFormData (mutable) */
export function featToFormData(feat?: Partial<Feat>): FeatFormData {
  if (!feat) return { ...DEFAULT_FEAT_FORM_DATA };

  const prereq = feat.prerequisites;
  return {
    id: feat.id ?? DEFAULT_FEAT_FORM_DATA.id,
    source: feat.source ?? DEFAULT_FEAT_FORM_DATA.source,
    name: feat.name ?? DEFAULT_FEAT_FORM_DATA.name,
    description: feat.description ?? DEFAULT_FEAT_FORM_DATA.description,
    category: feat.category ?? DEFAULT_FEAT_FORM_DATA.category,
    prerequisites: {
      level: prereq?.level,
      classId: prereq?.classId,
      species: prereq?.species,
    },
    grants: feat.grants ?? DEFAULT_FEAT_FORM_DATA.grants,
    repeatable: feat.repeatable ?? DEFAULT_FEAT_FORM_DATA.repeatable,
  };
}

/** Convert FeatFormData back to Feat */
export function formDataToFeat(formData: FeatFormData): Feat {
  const prereq = formData.prerequisites;
  const hasPrereq = prereq.level || prereq.classId || prereq.species;

  const prerequisites: FeatPrerequisite | undefined = hasPrereq
    ? ({
        level: prereq.level || undefined,
        classId: prereq.classId || undefined,
        species: prereq.species || undefined,
      } as FeatPrerequisite)
    : undefined;

  return {
    id: formData.id,
    source: formData.source,
    name: formData.name || undefined,
    description: formData.description,
    category: formData.category,
    prerequisites,
    grants: formData.grants.length > 0 ? formData.grants : undefined,
    repeatable: formData.repeatable || undefined,
  } as Feat;
}
