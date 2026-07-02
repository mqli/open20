export interface AdditionalClassEntry {
  id: string;
  classId: string;
  level: number;
  subclassId?: string;
}

/** Inline Magic Initiate form entry — no SRD feat data required. */
export interface FeatFormEntry {
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
  /** Inline Magic Initiate feat selection. Undefined = not enabled. */
  magicInitiate?: FeatFormEntry;
}
