import type {
  Character,
  DataLoader,
  CreateCharacterParams,
  ConditionName,
  LevelUpOptions,
} from '@/types/open20-core';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface ComputationProvider {
  createDataLoader(): DataLoader;
  createCharacter(params: CreateCharacterParams, loader: DataLoader): Character;
  validateCharacter(character: Character): ValidationResult;
  modifyHP(character: Character, delta: number): Character;
  setTemporaryHP(character: Character, value: number): Character;
  consumeResource(character: Character, resourceId: string): Character;
  recoverResource(character: Character, resourceId: string): Character;
  consumeSpellSlot(character: Character, level: number): Character;
  recoverSpellSlot(character: Character, level: number): Character;
  toggleCondition(character: Character, condition: ConditionName): Character;
  shortRest(character: Character, hitDiceToSpend?: number): Character;
  longRest(character: Character): Character;
  levelUp(character: Character, options: LevelUpOptions): Character;
  recompute(character: Character, loader: DataLoader): Character;
  serialize(character: Character): string;
  deserialize(json: string): Character;
}
