// engine/ac-calculator.ts
// AC(Armor Class)计算 — 纯函数
// 对应 HLD §6.1 + PRD v4.0 §10 附录D
// 这是所有计算中最容易出错的，必须100%准确

import type { AbilityScores } from '@/types/ability';
import type { Armor, EquipmentItem } from '@/types/equipment';
import type { Feature, FeatureACFormula } from '@/types/class';
import type { DataLoader } from '@/data/loader';
import type { FeatACBonus } from '@/types/feat';
import { getModifier, getTotalScore } from './ability-modifier';

type ACBreakdown = {
  ac: number;
  source: {
    type: string;
    value: string;
  };
};

type ACResult = {
  ac: number;
  breakdown: readonly ACBreakdown[];
};

/**
 * 计算AC(Armor Class)
 *
 * 规则（2024 PHB）：
 * - 无甲(无特性): 10 + Dex调整值
 * - Mage Armor: 13 + Dex调整值（通过法术或条件触发）
 * - Data-driven Unarmored Defense via Feature.acFormula
 * - 轻甲: 护甲AC + Dex
 * - 中甲: 护甲AC + min(Dex, +2)
 * - 重甲: 护甲AC
 * - 盾牌: +2（与以上任何叠加）
 * - 多个AC来源时取最高值（不叠加）
 * - 战斗风格专长：Defense +1 AC（当穿着护甲时）
 *
 * @param scores - 属性值对象
 * @param equipment - 装备列表
 * @param features - 角色拥有的特性列表
 * @param data - DataLoader（查护甲数据）
 * @param conditions - 角色当前状态列表（用于检测Mage Armor等，可选，默认空）
 * @param featACBonuses - 专长给予的AC加值（可选，用于战斗风格）
 * @returns AC值及其来源的详细分解
 */
export function calculateAC(
  scores: AbilityScores,
  equipment: readonly EquipmentItem[],
  features: readonly Feature[],
  data: DataLoader,
  conditions: readonly { source?: string; id?: string }[] = [],
  featACBonuses?: readonly FeatACBonus[],
): ACResult {
  const dexMod = getModifier(getTotalScore(scores, 'Dexterity'));

  // 1. 收集所有装备的护甲和盾牌
  const equippedArmor = getEquippedArmor(equipment, data);
  const equippedShields = getEquippedShields(equipment, data);
  const hasShield = equippedShields.length > 0;
  const hasArmor = equippedArmor.length > 0;

  // 2. 计算所有可能的AC来源
  const acOptions: ACBreakdown[] = [];

  // 无甲选项
  const unarmored = {
    source: { type: 'Unarmored', value: '10 + Dex' },
    ac: 10 + dexMod,
  };

  // Mage Armor（13 + Dex，通过法术或状态触发）
  const hasMageArmor = conditions.some((c) => c.source === 'Mage Armor' || c.id === 'mage-armor');
  if (hasMageArmor && !hasArmor) {
    acOptions.push({
      source: { type: 'Spell', value: 'Mage Armor: 13 + Dex' },
      ac: 13 + dexMod,
    });
  }

  // Data-driven AC formulas from features (e.g., Unarmored Defense)
  acOptions.push(...calculateFeatureACs(features, scores, hasArmor, hasShield, equippedArmor));

  // 护甲选项
  for (const armor of equippedArmor) {
    acOptions.push(calculateArmorAC(armor, dexMod));
  }

  // 3. 取最高AC
  const baseAC = acOptions.reduce((max, option) => {
    return option.ac > max.ac ? option : max;
  }, unarmored);

  // 4. 叠加盾牌
  const shieldAC = calculateShieldAC(equippedShields);

  // 5. 应用专长AC加值（如 Defense 战斗风格 +1）
  const acBonuses = calculateFeatACBonuses(featACBonuses, equippedArmor);
  const breakdown = [baseAC, ...shieldAC, ...acBonuses] as const;
  return { ac: breakdown.reduce((sum, option) => sum + option.ac, 0), breakdown };
}

/**
 * Compute AC values from features with featureType === 'acFormula'.
 * Uses filter/map to replace the imperative for-loop.
 */
function calculateFeatureACs(
  features: readonly Feature[],
  scores: AbilityScores,
  hasArmor: boolean,
  hasShield: boolean,
  equippedArmor: readonly Armor[],
): ACBreakdown[] {
  return features
    .filter((f): f is FeatureACFormula => f.featureType === 'acFormula' && !!f.acFormula)
    .filter((f) => {
      const { requires } = f.acFormula;
      if (!requires) return true;
      if (requires.includes('noArmor') && hasArmor) return false;
      if (requires.includes('noShield') && hasShield) return false;
      if (requires.includes('noHeavyArmor') && equippedArmor.some((a) => a.category === 'Heavy'))
        return false;
      return true;
    })
    .map((f) => {
      const { baseAC, addModifiers } = f.acFormula;
      let ac = baseAC;
      if (addModifiers) {
        for (const ability of addModifiers) {
          ac += getModifier(getTotalScore(scores, ability));
        }
      }
      return {
        ac,
        source: { type: 'Feature', value: f.name },
      };
    });
}

/**
 * 应用专长AC加值（如 Defense 战斗风格 +1）
 * 检查装备的护甲是否匹配专长要求的护甲类型，并应用对应的加值
 */
function calculateFeatACBonuses(
  featACBonuses: readonly FeatACBonus[] | undefined,
  equippedArmor: readonly Armor[],
): ACBreakdown[] {
  if (!featACBonuses || featACBonuses.length === 0 || equippedArmor.length === 0) {
    return [];
  }

  let totalBonus = 0;
  let matchedFeat: FeatACBonus | undefined;

  for (const bonus of featACBonuses) {
    const armorTypes = bonus.whileWearing ?? [];

    // 检查是否穿着符合条件的护甲
    const hasMatchingArmor = equippedArmor.some((a) => {
      if (armorTypes.includes('Light') && a.category === 'Light') return true;
      if (armorTypes.includes('Medium') && a.category === 'Medium') return true;
      if (armorTypes.includes('Heavy') && a.category === 'Heavy') return true;
      return false;
    });

    if (!hasMatchingArmor) continue;

    // 应用对应的加值
    if (bonus.lightArmor && equippedArmor.some((a) => a.category === 'Light')) {
      totalBonus += bonus.lightArmor;
      matchedFeat = bonus;
    } else if (bonus.mediumArmor && equippedArmor.some((a) => a.category === 'Medium')) {
      totalBonus += bonus.mediumArmor;
      matchedFeat = bonus;
    } else if (bonus.heavyArmor && equippedArmor.some((a) => a.category === 'Heavy')) {
      totalBonus += bonus.heavyArmor;
      matchedFeat = bonus;
    } else if (bonus.lightArmor || bonus.mediumArmor || bonus.heavyArmor) {
      // 如果只指定了一个通用加值，应用它
      totalBonus += bonus.lightArmor ?? bonus.mediumArmor ?? bonus.heavyArmor ?? 0;
    }
  }

  return matchedFeat
    ? [
        {
          ac: totalBonus,
          source: { type: 'Feat', value: matchedFeat.whileWearing![0] ?? '' },
        },
      ]
    : [];
}

/**
 * 计算单件护甲提供的AC
 */
function calculateArmorAC(armor: Armor, dexMod: number): ACBreakdown {
  if (!armor.dexBonus) {
    // 重甲：不加Dex
    return {
      ac: armor.ac,
      source: { type: 'armor', value: armor.id },
    };
  }

  if (armor.maxDexBonus != null) {
    // 中甲：护甲AC + min(Dex, cap)
    return {
      ac: armor.ac + Math.min(dexMod, armor.maxDexBonus),
      source: { type: 'armor', value: armor.id },
    };
  }

  // 轻甲：护甲AC + Dex
  return {
    ac: armor.ac + dexMod,
    source: { type: 'armor', value: armor.id },
  };
}

/**
 * 获取所有已装备的护甲（非盾牌）
 */
function getEquippedArmor(equipment: readonly EquipmentItem[], data: DataLoader): Armor[] {
  return equipment
    .filter((e) => e.equipped && e.type === 'armor')
    .map((e) => data.getArmor(e.id))
    .filter((a): a is Armor => a != null && a.category !== 'Shield');
}

/**
 * 获取所有已装备的盾牌
 */
function getEquippedShields(equipment: readonly EquipmentItem[], data: DataLoader): Armor[] {
  return equipment
    .filter((e) => e.equipped && e.type === 'armor')
    .map((e) => data.getArmor(e.id))
    .filter((a): a is Armor => a != null && a.category === 'Shield');
}

/**
 * 计算盾牌提供的AC（多个盾牌取最高值，不叠加）
 */
function calculateShieldAC(equippedShields: readonly Armor[]): ACBreakdown[] {
  if (equippedShields.length === 0) return [];

  const bestShield = equippedShields.reduce((best, shield) => {
    return shield.ac > best.ac ? shield : best;
  });

  return [{ ac: bestShield.ac, source: { type: 'shield', value: bestShield.id } }];
}
