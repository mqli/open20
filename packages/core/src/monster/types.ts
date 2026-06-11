// monsters/types.ts
// Re-exports monster types from @/types/monster for backward compatibility

export type {
  MonsterSize,
  MonsterType,
  ChallengeRating,
  InitiativeInfo,
  SensesInfo,
  ChallengeRatingInfo,
  AttackNotation,
  SavingThrowEffect,
  MonsterAttack,
  MonsterSpellcasting,
  ArmorClassEntry,
  HPInfo,
  SpeedInfo,
  MonsterFeature,
  MonsterAction,
  MonsterReaction,
  MonsterLegendaryAction,
  Monster,
} from '@/types/monster';

export type { AbilityScores } from '@/types/ability';
export type { DamageType, DamageDefenses } from '@/types/damage';
