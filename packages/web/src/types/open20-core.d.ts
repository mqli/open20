// Stub types for open20-core
// Replace with actual package when available

export type AbilityName = 'Strength' | 'Dexterity' | 'Constitution' | 'Intelligence' | 'Wisdom' | 'Charisma';
export type DieType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
export type ConditionName = 'Blinded' | 'Charmed' | 'Deafened' | 'Exhaustion' | 'Frightened' | 'Grappled' | 'Incapacitated' | 'Invisible' | 'Paralyzed' | 'Petrified' | 'Poisoned' | 'Prone' | 'Restrained' | 'Stunned' | 'Unconscious';

export interface AbilityScores {
  Strength: number;
  Dexterity: number;
  Constitution: number;
  Intelligence: number;
  Wisdom: number;
  Charisma: number;
}

export interface DeathSaves {
  successes: number;
  failures: number;
  isStable: boolean;
}

export interface HitPoints {
  max: number;
  current: number;
  temporary: number;
  deathSaves: DeathSaves;
}

export interface Attack {
  name: string;
  attackBonus: number;
  damage: string;
  damageType: string;
  mastery?: string;
}

export interface CombatStats {
  AC: number;
  initiative: number;
  speed: number;
  passivePerception: number;
  proficiencyBonus: number;
  attacks: readonly Attack[];
}

export interface Resource {
  id: string;
  max: number;
  used: number;
  resetOn: 'Short Rest' | 'Long Rest' | 'Per Turn' | 'Daily' | 'Never';
  description: string;
}

export interface SpellSlotEntry {
  total: number;
  used: number;
}

export interface ActiveCondition {
  name: ConditionName;
  source: string;
  duration: number | null;
}

export interface CharacterSpells {
  prepared: readonly string[];
  known: readonly string[];
  slots: Record<number, SpellSlotEntry>;
}

export interface Currency {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface CharacterClass {
  classId: string;
  level: number;
  subclassId: string | null;
  subclassLevel: number | null;
  hitDice: { die: DieType; used: number };
}

export interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  equipped: boolean;
}

export interface SkillEntry {
  proficient: boolean;
  expertise: boolean;
}

export interface Character {
  readonly schemaVersion: string;
  readonly id: string;
  readonly name: string;
  readonly species: string;
  readonly speciesSubtype: string | null;
  readonly background: string;
  readonly classes: readonly CharacterClass[];
  readonly abilityScores: AbilityScores;
  readonly skills: Record<string, SkillEntry>;
  readonly feats: readonly string[];
  readonly equipment: readonly EquipmentItem[];
  readonly spells: CharacterSpells;
  readonly resources: readonly Resource[];
  readonly hitPoints: HitPoints;
  readonly combatStats: CombatStats;
  readonly currency: Currency;
  readonly conditions: readonly ActiveCondition[];
  readonly notes: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateCharacterParams {
  name?: string;
  speciesId: string;
  classId: string;
  backgroundId?: string;
  abilityScores?: AbilityScores;
}

export interface LevelUpOptions {
  classId: string;
  hpChoice: 'fixed' | 'roll';
  asiOrFeat?: { type: 'asi'; abilities?: Partial<AbilityScores> } | { type: 'feat'; featId: string };
}

export interface Species {
  id: string;
  name: Record<string, string>;
  description: Record<string, string>;
}

export interface Background {
  id: string;
  name: Record<string, string>;
}

export interface Class {
  id: string;
  name: Record<string, string>;
}

export interface Subclass {
  id: string;
  name: Record<string, string>;
  classId: string;
}

export interface Feat {
  id: string;
  name: Record<string, string>;
  category: string;
}

export interface Weapon {
  id: string;
  name: Record<string, string>;
  type: string;
}

export interface Armor {
  id: string;
  name: Record<string, string>;
  type: string;
  AC: number;
}

export interface Spell {
  id: string;
  name: Record<string, string>;
  level: number;
}

export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface DataLoader {
  getSpecies(id: string): Species | undefined;
  getAllSpecies(): Species[];
  getBackground(id: string): Background | undefined;
  getAllBackgrounds(): Background[];
  getClass(id: string): Class | undefined;
  getAllClasses(): Class[];
  getSubclass(id: string): Subclass | undefined;
  getSubclassesForClass(classId: string): Subclass[];
  getFeat(id: string): Feat | undefined;
  getAllFeats(): Feat[];
  getFeatsByCategory(category: string): Feat[];
  getWeapon(id: string): Weapon | undefined;
  getAllWeapons(): Weapon[];
  getArmor(id: string): Armor | undefined;
  getAllArmor(): Armor[];
  getSpell(id: string): Spell | undefined;
  getSpellsByLevel(level: SpellLevel): Spell[];
  getAllSpells(): Spell[];
  getProficiencyBonus(level: number): number;
  getSpellSlots(classId: string, classLevel: number): Record<number, SpellSlotEntry>;
}
