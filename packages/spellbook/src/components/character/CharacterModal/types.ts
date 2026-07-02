export interface AdditionalClassEntry {
  id: string;
  classId: string;
  level: number;
  subclassId?: string;
}

/** Inline feat form entry — no SRD feat data required. */
export interface FeatFormEntry {
  /** Unique key for this feat instance (allows multiple Magic Initiates). */
  key: string;
  /** 'magic-initiate' is the only supported inline feat for now. */
  featId: 'magic-initiate';
  /** Whether this feat is enabled. */
  enabled: boolean;
  /** Class source for spell list (Cleric, Druid, Wizard). */
  classId: string;
  /** Selected cantrips (2). */
  cantrips: string[];
  /** Selected level-1 spell (1). */
  level1Spell: string;
}

export interface CharacterFormData {
  name: string;
  charClass: string;
  level: number;
  species: string;
  background: string;
  abilities: Record<string, number>;
  subclassId: string;
  additionalClasses: AdditionalClassEntry[];
  /** Inline feat selections (Magic Initiate etc.) */
  featSelections?: FeatFormEntry[];
}
