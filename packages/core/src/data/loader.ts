// data/loader.ts
// DataLoader 接口 — 所有规则数据的抽象访问层
// 实现 HLD §5.3 + §7.3
// 纯接口，零实现依赖。测试时可注入 mock，运行时可替换为 JSON/API/内存实现

import type { Species, SpeciesSubtype } from '@/types/species';
import type { Background } from '@/types/background';
import type { Class, Subclass } from '@/types/class';
import type { Feat, FeatCategory } from '@/types/feat';
import type { Weapon, Armor, GearItem } from '@/types/equipment';
import type { Spell } from '@/types/spell';
import type { ContentPack, ContentPackMeta } from '@/content/types';
import type { Monster } from '@/monster/types';
import type {
  GlossaryAbbreviation,
  GlossaryEntry,
  GlossaryEntryTag,
  RulesGlossary,
} from '@/types/glossary';

// ── DataLoader 接口 ───────────────────────────────────────
// 所有读取规则数据的函数集中在此接口
// 原因是：engine 层只需依赖此接口，不依赖具体数据源
// 测试时传入 mock，运行时传入 JsonLoader 或 ApiLoader

export interface DataLoader {
  // ── 物种（Species）───
  getSpecies(id: string): Species | undefined;
  getSpeciesBySource(source: string): Species[];
  getSpeciesSubtype(speciesId: string, subtypeId: string): SpeciesSubtype | undefined;
  getAllSpecies(): Species[];

  // ── 背景（Background）───
  getBackground(id: string): Background | undefined;
  getBackgroundsBySource(source: string): Background[];
  getAllBackgrounds(): Background[];

  // ── 职业（Class）/ 子职业（Subclass）───
  getClass(id: string): Class | undefined;
  getClassesBySource(source: string): Class[];
  getAllClasses(): Class[];
  getSubclass(id: string): Subclass | undefined;
  getSubclassesBySource(source: string): Subclass[];
  getSubclassesForClass(classId: string): Subclass[];
  getAllSubclasses(): Subclass[];

  // ── 专长（Feat）───
  getFeat(id: string): Feat | undefined;
  getFeatsBySource(source: string): Feat[];
  getFeatsByCategory(category: FeatCategory): Feat[];
  getAllFeats(): Feat[];

  // ── 装备 / 武器 / 护甲 ──────────────────────────────
  getWeapon(id: string): Weapon | undefined;
  getWeaponsBySource(source: string): Weapon[];
  getAllWeapons(): Weapon[];
  getArmor(id: string): Armor | undefined;
  getArmorBySource(source: string): Armor[];
  getAllArmor(): Armor[];
  getGearItem(id: string): GearItem | undefined;
  getGearBySource(source: string): GearItem[];
  getAllGear(): GearItem[];

  // ── 法术（Spell）───
  getSpell(id: string): Spell | undefined;
  getSpellsBySource(source: string): Spell[];
  getSpellsByLevel(level: number): Spell[];
  getAllSpells(): Spell[];

  // ── 内容包管理（R26）─────────────────────
  /** 注册内容包（从目录或 ContentPack 对象） */
  registerContentPack(source: string | ContentPack): void;

  /** 注销内容包（按 ID） */
  unregisterContentPack(packId: string): void;

  /** 获取所有已注册的内容包元数据 */
  getContentPacks(): ContentPackMeta[];

  // ── 怪物（Monster）───
  getMonster(id: string): Monster | undefined;
  getMonstersBySource(source: string): Monster[];
  getAllMonsters(): Monster[];

  // ── 规则术语表（Rules Glossary）───
  getGlossaryEntry(id: string): GlossaryEntry | undefined;
  getGlossaryEntryByName(name: string): GlossaryEntry | undefined;
  resolveGlossaryTerm(term: string): GlossaryEntry | undefined;
  getGlossaryEntriesBySource(source: string): GlossaryEntry[];
  getGlossaryEntriesByTag(tag: GlossaryEntryTag): GlossaryEntry[];
  getAllGlossaryEntries(): GlossaryEntry[];
  getGlossaryAbbreviations(): readonly GlossaryAbbreviation[];
  getRulesGlossary(): RulesGlossary;
}

export type SpellLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// ── createDataLoader — 默认工厂函数 ───────────────────────
// 接收静态 JSON 数据，返回 DataLoader 实例
// 统一实现，同时支持 Node.js 和 Browser

export { createDataLoader } from './default-loader';
