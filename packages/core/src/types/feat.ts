// types/feat.ts
// 专长相关类型（零依赖）

import type { AbilityName } from './ability';

// 专长类别 — 字符串字面量联合类型
export type FeatCategory = 'Origin' | 'General' | 'Fighting Style' | 'Epic Boon';

// 专长条目
export interface Feat {
  readonly id: string;
  readonly source: string; // '2024 PHB' | '2014 PHB' | 'SRD 5.2' | ...
  readonly name?: string; // 显示名称（无则用id）
  readonly description: string;
  readonly category: FeatCategory;
  readonly prerequisites?: FeatPrerequisite; // 前提条件
  readonly grants?: readonly FeatGrant[]; // 给予的能力（判别联合类型数组）
  readonly repeatable?: boolean; // 是否可重复选择
}

// 专长前提
export interface FeatPrerequisite {
  readonly ability?: Partial<Record<AbilityName, number>>;
  readonly level?: number;
  readonly classId?: string;
  readonly subclassId?: string;
  readonly species?: string;
  readonly feature?: string; // 需要特定特性（如 "Fighting Style Feature"）
}

// 专长给予的能力（判别联合类型）
// 使用 type 字段作为判别式，每个变体有必需的对应字段
export type FeatGrant =
  | { readonly type: 'abilityBonus'; readonly bonus: Partial<Record<AbilityName, number>> }
  | { readonly type: 'abilityBonusChoice'; readonly choice: FeatAbilityBonusChoice }
  | { readonly type: 'skillProficiencies'; readonly skills: readonly string[] }
  | { readonly type: 'skillProficiencyChoice'; readonly choice: FeatProficiencyChoice }
  | { readonly type: 'toolProficiencies'; readonly tools: readonly string[] }
  | { readonly type: 'toolProficiencyChoice'; readonly choice: FeatProficiencyChoice }
  | { readonly type: 'languages'; readonly languages: readonly string[] }
  | { readonly type: 'armorTraining'; readonly armors: readonly string[] }
  | { readonly type: 'weaponMastery'; readonly weapons: readonly string[] }
  | { readonly type: 'attackBonus'; readonly bonus: FeatAttackBonus }
  | { readonly type: 'acBonus'; readonly bonus: FeatACBonus }
  | { readonly type: 'specialAbilities'; readonly abilities: readonly string[] }
  | { readonly type: 'spellChoices'; readonly choices: readonly FeatSpellChoice[] };

// 能力加值选择定义
export interface FeatAbilityBonusChoice {
  // 可以选择的能力列表（空 = 所有能力）
  readonly options: readonly AbilityName[];
  // 每个选择增加的数值（如 2 表示 +2）
  readonly valuePerChoice: number;
  // 可以选择的次数
  // 例如 ASI: { options: all, valuePerChoice: 2, count: 1 }
  //   → 选择1个能力+2
  // 或 ASI: { options: all, valuePerChoice: 1, count: 2 }
  //   → 选择2个能力各+1
  readonly count: number;
}

// 熟练选择定义
export interface FeatProficiencyChoice {
  // 可以选择的项目列表（空 = 任意）
  readonly options: readonly string[];
  // 需要选择的个数
  readonly count: number;
}

// ── 法术选择（用于 Magic Initiate 等专长）─────────────────

// 专长法术选择定义
export interface FeatSpellChoice {
  // 唯一标识符（如 "cantrips", "level1Spell"）
  readonly id: string;
  // 可选择法术列表的职业来源
  readonly classOptions: readonly string[];
  // 可选择法术等级（0 = 戏法）
  readonly spellLevel: number;
  // 需选择的数量
  readonly count: number;
  // 选择的法术是否总是已准备
  readonly alwaysPrepared?: boolean;
  // 法术是否每日长休后恢复一次（无法术位施法）
  readonly oncePerLongRest?: boolean;
}

// 专长法术选择结果（存储在角色的 featSpellChoices 中）
export interface FeatSpellSelection {
  // 选择的职业（法术列表来源）
  readonly classId: string;
  // 选择的法术，按 FeatSpellChoice.id 分组
  readonly spells: Record<string, readonly string[]>;
}

// 攻击加值配置（用于战斗风格）
export interface FeatAttackBonus {
  readonly ranged?: number; // 远程武器攻击加值
  readonly melee?: number; // 近战武器攻击加值
  readonly weaponProperties?: readonly string[]; // 特定武器属性加值
}

// AC加值配置（用于战斗风格）
export interface FeatACBonus {
  readonly lightArmor?: number;
  readonly mediumArmor?: number;
  readonly heavyArmor?: number;
  readonly whileWearing?: readonly string[]; // 特定护甲类型
}

// ── Character Feat Entry (Consolidated) ─────────────────

// A feat entry on a character, carrying all its choices in one place.
export interface CharacterFeatEntry {
  readonly featId: string;
  // Skill/tool proficiency choices (e.g., Skilled: ["Athletics", "Stealth"])
  readonly skillChoices?: readonly string[];
  // Ability bonus choices (e.g., ASI: { "Strength": 2 } or { "Str": 1, "Dex": 1 })
  readonly abilityChoices?: Partial<Record<AbilityName, number>>;
  // Spell choices (e.g., Magic Initiate)
  readonly spellChoices?: FeatSpellSelection;
}
