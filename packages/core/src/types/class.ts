// types/class.ts
// 职业与子职业相关类型（零依赖）

import type { ResetType } from './resource';
import type { AbilityName } from './ability';
import type { AlwaysPreparedSpells } from './spell';
import type { DieType } from './dice';

// 法术施法方式（SRD 5.2）
// 所有施法者都有准备法术（Prepared Spells）
// 区别仅在于：如何知道法术 + 何时可以更换 + 法术位系统
export interface Spellcasting {
  readonly ability: AbilityName;

  // 如何"知道"法术：
  // - 'class_list' → 大多数职业：自动知道职业法术列表
  // - 'spellbook'   → Wizard: 必须学习/抄写才能知道
  // 注意：只有 type=preparation 时此字段才有意义
  readonly knownSource?: 'class_list' | 'spellbook';

  // 何时可以更换准备的法术：
  // - 'long_rest'  → Cleric, Druid, Wizard: 每次长休可更换
  // - 'level_up'   → Bard, Sorcerer, Warlock: 仅在升级时可更换
  readonly preparationTiming: 'long_rest' | 'level_up';

  // 每次准备时可以更换多少个法术：
  // - 'all'   → 大多数职业：可以更换任意数量
  // - number  → Paladin, Ranger: 每次只能更换1个（SRD: "One"）
  readonly changesPerPreparation: 'all' | number;

  // Warlock 专用：使用 Pact Magic 而非常规法术位
  readonly pactMagic?: true;

  // Warlock Pact Magic 法术位表（按等级）
  // 仅当 pactMagic=true 时有效
  readonly pactMagicSlots?: Record<number, { slots: number; slotLevel: number }>;
}

// 职业特性条目
// Discriminated union based on featureType
export type FeatureType = 'generic' | 'acFormula';

// Requirement enums for AC formulas
export type ACRequirement = 'noArmor' | 'noShield' | 'noHeavyArmor';

// Data-driven AC formula (e.g., Unarmored Defense)
export interface ACFormula {
  readonly baseAC: number;
  readonly addModifiers?: readonly AbilityName[];
  readonly requires?: readonly ACRequirement[];
}

// Base fields shared by all Feature variants
interface FeatureBase {
  readonly name: string;
  readonly description: string;
  readonly level?: number;
}

// Variant: generic (most features, may carry resource info)
export type FeatureGeneric = FeatureBase & {
  readonly featureType?: 'generic';
  // Resource properties (optional, only relevant for resource-granting features)
  readonly resourceId?: string;
  readonly resourceMax?: number;
  readonly resourceMaxByLevel?: Record<number, number>;
  readonly resourceResetOn?: ResetType;
  readonly resourceScaleWithPB?: boolean;
};

// Variant: carries an AC formula (e.g., Unarmored Defense)
export type FeatureACFormula = FeatureBase & {
  readonly featureType: 'acFormula';
  readonly acFormula: ACFormula;
};

// Feature discriminated union
export type Feature = FeatureGeneric | FeatureACFormula;

// 职业类型
export interface Class {
  readonly id: string;
  readonly name: string;
  readonly source: string; // '2024 PHB' | '2014 PHB' | 'SRD 5.2' | ...
  readonly hitDie: DieType;
  readonly savingThrowProficiencies: readonly AbilityName[];
  readonly armorTraining: readonly string[]; // 许可的护甲类型
  readonly weaponProficiencies?: readonly string[]; // 武器熟练项（如 "Simple", "Martial", "Longsword"）
  readonly weaponMastery: boolean; // 是否有Weapon Mastery
  // JSON 原生格式：按等级分组的特性列表
  readonly featuresByLevel: readonly {
    readonly level: number;
    // 准备施法者每级可准备的法术数量（从职业特性表中读取）
    // 仅准备施法职业（Cleric, Druid, Wizard, Paladin, Ranger）有此字段
    readonly preparedSpells?: number;
    // 每级知道的戏法数量（从职业特性表中读取）
    // 所有施法职业都有此字段
    readonly cantripsKnown?: number;
    readonly features: readonly Feature[];
  }[];
  readonly spellcasting: Spellcasting | null;
  // 职业法术位表：classLevel → [1环, 2环, ... 9环]
  // 仅使用常规法术位体系的职业有此字段；Warlock 使用 pactMagic，不在此表内。
  readonly spellSlotsByLevel?: Readonly<Record<number, ReadonlyArray<number>>>;
}

// 子职业类型
export interface Subclass {
  readonly id: string;
  readonly parentClass: string; // 父职业ID
  readonly grantedAtLevel: number;
  // JSON 原生格式：按等级分组的特性列表
  readonly featuresByLevel: readonly {
    readonly level: number;
    // 准备施法者每级可准备的法术数量（从职业特性表中读取）
    // 仅准备施法职业（Cleric, Druid, Wizard, Paladin, Ranger）有此字段
    readonly preparedSpells?: number;
    // 每级知道的戏法数量（从职业特性表中读取）
    // 所有施法职业都有此字段
    readonly cantripsKnown?: number;
    readonly features: readonly Feature[];
  }[];
  // 始终准备的法术（领域法术、誓言法术等）
  // JSON 原生格式：按获得等级分组，这些法术不计入准备法术数量上限
  readonly alwaysPreparedSpells?: readonly {
    readonly level: number;
    readonly spells: AlwaysPreparedSpells;
  }[];
  // 来源（如 'SRD 5.2', '2024 PHB' 等）
  readonly source?: string;
}
