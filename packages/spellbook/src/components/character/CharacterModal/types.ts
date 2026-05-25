export interface AdditionalClassEntry {
  id: string;
  classId: string;
  level: number;
  subclassId?: string;
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
}
