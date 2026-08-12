// characterStore.ts (T-008)
// Single source of truth for character state. Every mutation calls a core
// function and REPLACES the immutable snapshot (never mutates in place),
// then persists via StorageService.

import { create } from 'zustand';
import {
  createCharacter as coreCreateCharacter,
  modifyHP as coreModifyHP,
  modifyCurrency as coreModifyCurrency,
  setTemporaryHP as coreSetTemporaryHP,
  recomputeDerivedStats,
  shortRest as coreShortRest,
  longRest as coreLongRest,
  levelUp as coreLevelUp,
  toggleInspiration as coreToggleInspiration,
  toggleCondition as coreToggleCondition,
  equipItemAndRecompute as coreEquipItemAndRecompute,
  unequipItemAndRecompute as coreUnequipItemAndRecompute,
  removeEquipment as coreRemoveEquipment,
  addEquipment as coreAddEquipment,
  isConcentrating,
  castSpell as coreCastSpell,
  startConcentration,
  endConcentration as coreEndConcentration,
  makeConcentrationCheck,
  defaultRandom,
  type AbilityName,
  type Character,
  type CharacterClass,
  type ConditionName,
  type Currency,
  type DamageType,
  type EquipmentItem,
  type LevelUpOptions,
  type RecomputeDerivedStatsDeps,
  type SpellLevel,
  prepareSpellForClass as corePrepareSpellForClass,
  unprepareSpellForClass as coreUnprepareSpellForClass,
  addKnownSpell as coreAddKnownSpell,
  removeKnownSpell as coreRemoveKnownSpell,
  learnCantripForClass as coreLearnCantripForClass,
  consumeSpellSlot as coreConsumeSpellSlot,
  recoverSpellSlot as coreRecoverSpellSlot,
  getMatchingClassIds,
  isSpellbookCaster,
} from 'open20-core';
import type { AppCharacter } from '@/types';
import {
  resolveDeps,
  getSpell,
  buildDepsForCreate,
  getClassById,
  getAllSpells,
} from '@/core/content-resolver';
import { restRng, rollSpellCast } from '@/core/roll-adapter';
import { storageService, StorageQuotaError } from '@/core/storage-service';

/**
 * Everything the create wizard collects. Mirrors core's `CreateCharacterParams`
 * — the store resolves the deps bag and mints the id.
 */
export interface CreateCharacterInput {
  name: string;
  speciesId: string;
  speciesSubtypeId?: string;
  backgroundId: string;
  classId: string;
  classLevel?: number;
  subclassId?: string;
  abilityScores: Record<AbilityName, number>;
  featIds?: string[];
  skillChoices?: string[];
  additionalClasses?: Array<{ classId: string; level: number; subclassId?: string }>;
}

/**
 * T-121: Partial character identity fields for editing. All fields are
 * optional — the edit dialog sends only what was changed.
 */
export interface UpdateCharacterInput {
  name?: string;
  species?: string;
  speciesSubtype?: string | null;
  background?: string;
  classes?: readonly CharacterClass[];
  abilityScores?: { base: Record<AbilityName, number> };
}

interface CharacterSheetState {
  character: AppCharacter | null;
  characters: Record<string, AppCharacter>;
  activeCharacterId: string | null;
  isLoaded: boolean;
  error: string | null;
  /** Signal consumed by T-117: last damage taken while concentrating (CON save prompt). */
  lastDamageForConcentration: number | null;

  load: () => void;
  loadCharacter: (id: string) => void;
  setActiveCharacter: (id: string) => void;
  deleteCharacter: (id: string) => void;
  /** Add/replace a character (e.g. from import or restore) and make it active. */
  upsertCharacter: (character: AppCharacter) => void;
  /**
   * Create a character from wizard input: resolve deps → core `createCharacter`
   * → recompute → persist → set active. Returns the new id, or null on failure
   * (the reason lands in `error`).
   */
  createCharacter: (input: CreateCharacterInput) => string | null;

  // Reference mutation pair (other feature tasks add more via applyMutation).
  modifyHP: (delta: number) => void;
  setTemporaryHP: (value: number) => void;
  /** Toggle a death save success or failure at the given index (0, 1, 2). */
  toggleDeathSave: (kind: 'success' | 'failure', index: number) => void;
  /** Short rest: spend per-class hit dice, recover HP, reset short-rest resources. */
  shortRest: (hitDiceToSpend: Record<string, number>) => void;
  /** Long rest: full HP, all HD, all spell slots, reset death saves, conditions, resources. */
  longRest: () => void;
  /** Level up: advance a class or add a new class, apply HP gain. */
  levelUp: (options: LevelUpOptions) => void;
  /** Toggle inspiration on/off. */
  toggleInspiration: () => void;
  /** Modify currency amounts (Positive = add, negative = spend; core clamps to 0). */
  modifyCurrency: (delta: Partial<Currency>) => void;
  /** Toggle a condition on/off on the active character. */
  toggleCondition: (conditionId: ConditionName) => void;
  /** Set exhaustion level (0-6). Level 0 removes exhaustion. */
  setExhaustionLevel: (level: number) => void;
  /** Equip an item and recompute derived stats (AC, attacks). */
  equipItem: (itemId: string) => void;
  /** Unequip an item and recompute derived stats (AC, attacks). */
  unequipItem: (itemId: string) => void;
  /** Remove an item from equipment entirely. */
  removeEquipment: (itemId: string) => void;
  /** Add a new item to equipment (SRD picker or custom entry). */
  addEquipment: (item: EquipmentItem) => void;
  /** Toggle a damage type defense (resist/immune/vuln) on/off. */
  toggleDamageDefense: (
    category: 'resistances' | 'immunities' | 'vulnerabilities',
    damageType: DamageType,
  ) => void;
  /** Cast a spell: resolve spell, call core castSpell, push roll to overlay, handle concentration, persist. */
  castSpell: (spellId: string, slotLevel: SpellLevel) => void;
  /** End concentration on the active character (persists + clears lastDamageForConcentration). */
  endConcentration: () => void;
  /** Roll a CON save for concentration and auto-end on failure (via core makeConcentrationCheck). */
  makeConcentrationSave: (damageAmount: number) => void;

  // ── Spell Management ────────────────────────────────
  /** Prepare a spell for the best-matching spellcasting class. */
  prepareSpell: (spellId: string) => void;
  /** Unprepare a spell (finds which class has it prepared). */
  unprepareSpell: (spellId: string) => void;
  /** Prepare a spell for a specific class. */
  prepareSpellForClass: (classId: string, spellId: string) => void;
  /** Unprepare a spell from a specific class. */
  unprepareSpellForClass: (classId: string, spellId: string) => void;
  /** Learn a spell (for spellbook casters: Wizard). */
  learnSpell: (spellId: string) => void;
  /** Unlearn a known spell (cascading: also unprepares). */
  unlearnSpell: (spellId: string) => void;
  /** Learn a cantrip for a specific class. */
  learnCantrip: (classId: string, spellId: string) => void;
  /** Unlearn a cantrip from a specific class. */
  unlearnCantrip: (classId: string, spellId: string) => void;
  /** Manually consume one spell slot (regular level or 'pact'). */
  consumeSpellSlot: (level: number | 'pact') => void;
  /** Manually recover one spell slot (regular level or 'pact'). */
  recoverSpellSlot: (level: number | 'pact') => void;

  /** T-121: Merge identity patches, recompute derived stats, and persist. */
  updateCharacter: (input: UpdateCharacterInput) => void;
}

export const useCharacterStore = create<CharacterSheetState>((set, get) => {
  /** Run a core mutation on the active character and persist the result. */
  function applyMutation(
    fn: (char: Character, deps: RecomputeDerivedStatsDeps) => Character,
  ): void {
    const active = get().character;
    if (!active) return;
    const deps = resolveDeps(active);
    const next: AppCharacter = { ...fn(active, deps), id: active.id };
    persist(next);
  }

  function persist(next: AppCharacter): void {
    try {
      storageService.saveCharacter(next);
      set((s) => ({
        character: next,
        characters: { ...s.characters, [next.id]: next },
        error: null,
      }));
    } catch (e) {
      // Keep the in-memory update but surface the persistence failure.
      set((s) => ({
        character: next,
        characters: { ...s.characters, [next.id]: next },
        error:
          e instanceof StorageQuotaError
            ? 'Storage is full. Export or delete characters to free space.'
            : 'Could not save character.',
      }));
    }
  }

  return {
    character: null,
    characters: {},
    activeCharacterId: null,
    isLoaded: false,
    error: null,
    lastDamageForConcentration: null,

    load: () => {
      const characters = storageService.loadAll();
      const activeId = storageService.getActiveId();
      const active = activeId ? characters[activeId] : null;
      // Refresh derived stats on the active character from current content.
      let refreshed = active ?? null;
      if (active) {
        refreshed = { ...recomputeDerivedStats(active, resolveDeps(active)), id: active.id };
        characters[active.id] = refreshed;
      }
      set({
        characters,
        activeCharacterId: active ? active.id : null,
        character: refreshed,
        isLoaded: true,
      });
    },

    loadCharacter: (id) => {
      const char = get().characters[id];
      if (char) set({ character: char, activeCharacterId: id });
    },

    setActiveCharacter: (id) => {
      const char = get().characters[id];
      if (!char) return;
      storageService.setActiveId(id);
      set({ character: char, activeCharacterId: id });
    },

    deleteCharacter: (id) => {
      storageService.deleteCharacter(id);
      set((s) => {
        const rest = { ...s.characters };
        delete rest[id];
        const wasActive = s.activeCharacterId === id;
        return {
          characters: rest,
          activeCharacterId: wasActive ? null : s.activeCharacterId,
          character: wasActive ? null : s.character,
        };
      });
    },

    upsertCharacter: (character) => {
      storageService.setActiveId(character.id);
      persist(character);
      set({ activeCharacterId: character.id });
    },

    createCharacter: (input) => {
      try {
        const deps = buildDepsForCreate(input);
        // core createCharacter already runs recomputeDerivedStats internally.
        const created = coreCreateCharacter(input, deps);
        // Second pass with character-resolved deps, plus the full spell catalog.
        // resolveDeps only resolves spells the character already knows, but
        // buildClassSpellData needs ALL content-pack spells in deps.spells to
        // populate knownSpells for class-list casters (Cleric, Druid, etc.).
        const secondDeps = resolveDeps(created);
        if (!secondDeps.spells || Object.keys(secondDeps.spells).length === 0) {
          secondDeps.spells = getAllSpells();
        }
        const recomputed = recomputeDerivedStats(created, secondDeps);
        // A feat grant can raise CON and therefore max HP; recompute clamps
        // current down to max but never heals, so top up after the fact.
        const next: AppCharacter = {
          ...recomputed,
          hitPoints: { ...recomputed.hitPoints, current: recomputed.hitPoints.max },
          id: crypto.randomUUID(),
        };
        storageService.setActiveId(next.id);
        persist(next);
        set({ activeCharacterId: next.id });
        return next.id;
      } catch (e) {
        set({ error: e instanceof Error ? e.message : 'Could not create character.' });
        return null;
      }
    },

    modifyHP: (delta) => {
      applyMutation((char) => coreModifyHP(char, delta));
      // Signal concentration CON save when HP reduced while concentrating (consumed by T-117).
      if (delta < 0) {
        const active = get().character;
        if (active && isConcentrating(active)) {
          set({ lastDamageForConcentration: Math.abs(delta) });
        }
      }
    },
    setTemporaryHP: (value) => applyMutation((char) => coreSetTemporaryHP(char, value)),
    toggleDeathSave: (kind, index) => {
      applyMutation((char) => {
        const ds = char.hitPoints.deathSaves;
        const currentCount = kind === 'success' ? ds.successes : ds.failures;

        let newCount: number;
        if (currentCount === index) {
          // Fill this position (advance count)
          newCount = index + 1;
        } else if (currentCount === index + 1) {
          // Unfill this position (the last filled one)
          newCount = index;
        } else {
          // Cannot skip positions — no change
          return char;
        }

        const successes = kind === 'success' ? newCount : ds.successes;
        const failures = kind === 'failure' ? newCount : ds.failures;

        return {
          ...char,
          hitPoints: {
            ...char.hitPoints,
            deathSaves: {
              successes,
              failures,
              isStable: successes >= 3,
            },
          },
          // NOTE: updatedAt set inline because toggleDeathSave doesn't go through
          // core's withUpdate() — it mutates deathSaves directly.
          updatedAt: new Date().toISOString(),
        };
      });
    },

    shortRest: (hitDiceToSpend) => {
      set({ lastDamageForConcentration: null });
      applyMutation((char, deps) => {
        const rested = coreShortRest(char, hitDiceToSpend, deps, restRng);
        return recomputeDerivedStats(rested, deps);
      });
    },

    longRest: () => {
      set({ lastDamageForConcentration: null });
      applyMutation((char, deps) => {
        // End concentration first (long rest = unconscious), then apply long rest
        const withoutConc = coreEndConcentration(char);
        const rested = coreLongRest(withoutConc, deps);
        return recomputeDerivedStats(rested, deps);
      });
    },

    levelUp: (options) => {
      const active = get().character;
      if (!active) return;
      const deps = resolveDeps(active);
      // When multiclassing into a new class, ensure the target class is in deps
      // (resolveDeps only resolves classes the character already has).
      if (options.isNewClass && !deps.classes[options.classId]) {
        const klass = getClassById(options.classId);
        if (klass) deps.classes = { ...deps.classes, [klass.id]: klass };
      }
      const leveled: Character = coreLevelUp(active, options, deps, restRng);
      // Recompute derived stats after level-up (proficiency bonus, attacks,
      // spell DCs, etc. may change). Preserve hitPoints from core to keep
      // rolled-HP values (recompute uses fixed dice).
      const recomputed = recomputeDerivedStats(leveled, deps);
      const next: AppCharacter = {
        ...recomputed,
        hitPoints: leveled.hitPoints,
        id: active.id,
      };
      persist(next);
    },

    toggleInspiration: () => {
      const active = get().character;
      if (!active) return;
      const next: AppCharacter = { ...coreToggleInspiration(active), id: active.id };
      persist(next);
    },

    modifyCurrency: (delta) => {
      const active = get().character;
      if (!active) return;
      const next: AppCharacter = { ...coreModifyCurrency(active, delta), id: active.id };
      persist(next);
    },

    toggleCondition: (conditionId) => {
      const active = get().character;
      if (!active) return;
      const next: AppCharacter = {
        ...coreToggleCondition(active, conditionId),
        id: active.id,
      };
      persist(next);
    },

    setExhaustionLevel: (level) => {
      const active = get().character;
      if (!active) return;
      const clamped = Math.max(0, Math.min(6, Math.round(level)));

      let newConditions = [...active.conditions];
      const exhaustionIdx = newConditions.findIndex((c) => c.id === 'Exhaustion');

      if (clamped === 0) {
        // Remove exhaustion if it exists
        if (exhaustionIdx !== -1) {
          newConditions = newConditions.filter((_, i) => i !== exhaustionIdx);
        }
      } else if (exhaustionIdx !== -1) {
        // Update existing exhaustion level
        newConditions[exhaustionIdx] = {
          ...newConditions[exhaustionIdx]!,
          level: clamped,
        };
      } else {
        // Add new exhaustion condition
        newConditions.push({
          id: 'Exhaustion' as ConditionName,
          source: '',
          appliedAt: new Date().toISOString(),
          level: clamped,
        });
      }

      // Recompute derived stats since exhaustion affects speed
      const updated = recomputeDerivedStats(
        { ...active, conditions: newConditions },
        resolveDeps(active),
      );
      const next: AppCharacter = { ...updated, id: active.id };
      persist(next);
    },

    equipItem: (itemId) => {
      applyMutation((char, deps) => coreEquipItemAndRecompute(char, itemId, deps));
    },

    unequipItem: (itemId) => {
      applyMutation((char, deps) => coreUnequipItemAndRecompute(char, itemId, deps));
    },

    removeEquipment: (itemId) => {
      const active = get().character;
      if (!active) return;
      const next: AppCharacter = {
        ...coreRemoveEquipment(active, itemId),
        id: active.id,
      };
      persist(next);
    },

    addEquipment: (item) => {
      const active = get().character;
      if (!active) return;
      const next: AppCharacter = {
        ...coreAddEquipment(active, item),
        id: active.id,
      };
      persist(next);
    },

    toggleDamageDefense: (category, damageType) => {
      const active = get().character;
      if (!active) return;
      const defenses = active.damageDefenses;
      const list = defenses[category];

      let updated: typeof defenses;
      if (list.includes(damageType)) {
        // Remove
        updated = { ...defenses, [category]: list.filter((t) => t !== damageType) };
      } else {
        // Add
        updated = { ...defenses, [category]: [...list, damageType] };
      }

      const next: AppCharacter = {
        ...active,
        damageDefenses: updated,
        updatedAt: new Date().toISOString(),
        id: active.id,
      };
      persist(next);
    },

    castSpell: (spellId, slotLevel) => {
      const spell = getSpell(spellId);
      if (!spell) {
        set({ error: `Spell not found: ${spellId}` });
        return;
      }

      const active = get().character;
      if (!active) return;

      const result = coreCastSpell(active, spell, slotLevel);

      if (!result.success) {
        set({ error: result.message ?? 'Failed to cast spell.' });
        return;
      }

      // Push roll overlay (side effect before persist)
      if (result.castingClassId) {
        rollSpellCast(result.char, spell, slotLevel, result.castingClassId);
      }

      // Set concentration if the spell requires it
      let updated = result.char;
      if (spell.concentration) {
        updated = startConcentration(updated, spell.id);
      }

      const next: AppCharacter = { ...updated, id: active.id };
      persist(next);
    },

    endConcentration: () => {
      const active = get().character;
      if (!active) return;
      const next: AppCharacter = {
        ...coreEndConcentration(active),
        id: active.id,
      };
      set({ lastDamageForConcentration: null });
      persist(next);
    },

    makeConcentrationSave: (damageAmount) => {
      const active = get().character;
      if (!active) return;
      if (!isConcentrating(active)) return;

      const deps = resolveDeps(active);
      const { char: updated } = makeConcentrationCheck(active, damageAmount, deps, defaultRandom);

      const next: AppCharacter = { ...updated, id: active.id };
      set({ lastDamageForConcentration: null });
      persist(next);
    },

    // ── Spell Management Actions ─────────────────────────

    prepareSpell: (spellId) => {
      const active = get().character;
      if (!active) return;
      const spell = getSpell(spellId);
      if (!spell) {
        set({ error: `Spell not found: ${spellId}` });
        return;
      }
      if (spell.level === 0) {
        set({ error: 'Use Learn Cantrip for level 0 spells, not Prepare.' });
        return;
      }
      const classIds = getMatchingClassIds(active, spell);
      if (classIds.length === 0) {
        set({ error: 'This spell does not match any of your classes.' });
        return;
      }
      const classId = classIds[0]!;
      const prevCount = active.spells.classSpellcasting[classId]?.preparedSpells.length ?? 0;
      const updated = corePrepareSpellForClass(active, classId, spellId);
      const newCount = updated.spells.classSpellcasting[classId]?.preparedSpells.length ?? 0;
      if (newCount <= prevCount) {
        set({
          error: 'Cannot prepare more spells — maximum prepared reached or spell already prepared.',
        });
        return;
      }
      const recomputed = recomputeDerivedStats(updated, resolveDeps(updated));
      const next: AppCharacter = { ...recomputed, id: active.id };
      persist(next);
    },

    unprepareSpell: (spellId) => {
      const active = get().character;
      if (!active) return;
      let foundClassId: string | null = null;
      for (const [classId, data] of Object.entries(active.spells.classSpellcasting)) {
        if (data.preparedSpells.includes(spellId)) {
          foundClassId = classId;
          break;
        }
      }
      if (!foundClassId) {
        set({ error: 'Spell is not currently prepared.' });
        return;
      }
      const updated = coreUnprepareSpellForClass(active, foundClassId, spellId);
      const recomputed = recomputeDerivedStats(updated, resolveDeps(updated));
      const next: AppCharacter = { ...recomputed, id: active.id };
      persist(next);
    },

    prepareSpellForClass: (classId, spellId) => {
      const active = get().character;
      if (!active) return;
      const updated = corePrepareSpellForClass(active, classId, spellId);
      const recomputed = recomputeDerivedStats(updated, resolveDeps(updated));
      const next: AppCharacter = { ...recomputed, id: active.id };
      persist(next);
    },

    unprepareSpellForClass: (classId, spellId) => {
      const active = get().character;
      if (!active) return;
      const updated = coreUnprepareSpellForClass(active, classId, spellId);
      const recomputed = recomputeDerivedStats(updated, resolveDeps(updated));
      const next: AppCharacter = { ...recomputed, id: active.id };
      persist(next);
    },

    learnSpell: (spellId) => {
      const active = get().character;
      if (!active) return;
      const spell = getSpell(spellId);
      if (!spell) {
        set({ error: `Spell not found: ${spellId}` });
        return;
      }
      const classIds = getMatchingClassIds(active, spell);
      if (classIds.length === 0) {
        set({ error: 'This spell does not match any of your classes.' });
        return;
      }
      // Only spellbook casters (e.g., Wizard) "learn" spells; other classes
      // access their full class list without needing to learn individual spells.
      const learnableIds = classIds.filter((cid) => {
        const klass = getClassById(cid);
        return klass && isSpellbookCaster(klass);
      });
      if (learnableIds.length === 0) {
        set({
          error:
            'This spell matches your classes but none of them learn spells individually (only spellbook casters like Wizard learn spells).',
        });
        return;
      }
      const classId = learnableIds[0]!;
      const updated = coreAddKnownSpell(active, classId, spellId);
      const recomputed = recomputeDerivedStats(updated, resolveDeps(updated));
      const next: AppCharacter = { ...recomputed, id: active.id };
      persist(next);
    },

    unlearnSpell: (spellId) => {
      const active = get().character;
      if (!active) return;
      let foundClassId: string | null = null;
      for (const [classId, data] of Object.entries(active.spells.classSpellcasting)) {
        if (data.knownSpells.includes(spellId)) {
          foundClassId = classId;
          break;
        }
      }
      if (!foundClassId) {
        set({ error: 'Spell is not currently known.' });
        return;
      }
      const updated = coreRemoveKnownSpell(active, foundClassId, spellId);
      const recomputed = recomputeDerivedStats(updated, resolveDeps(updated));
      const next: AppCharacter = { ...recomputed, id: active.id };
      persist(next);
    },

    learnCantrip: (classId, spellId) => {
      const active = get().character;
      if (!active) return;
      const prevCount = active.spells.classSpellcasting[classId]?.knownCantrips.length ?? 0;
      const updated = coreLearnCantripForClass(active, classId, spellId);
      const newCount = updated.spells.classSpellcasting[classId]?.knownCantrips.length ?? 0;
      if (newCount <= prevCount) {
        set({ error: 'Cannot learn cantrip — maximum known reached or already known.' });
        return;
      }
      const recomputed = recomputeDerivedStats(updated, resolveDeps(updated));
      const next: AppCharacter = { ...recomputed, id: active.id };
      persist(next);
    },

    unlearnCantrip: (classId, spellId) => {
      const active = get().character;
      if (!active) return;
      const classData = active.spells.classSpellcasting[classId];
      if (!classData?.knownCantrips?.includes(spellId)) return;
      const updated = {
        ...active,
        spells: {
          ...active.spells,
          classSpellcasting: {
            ...active.spells.classSpellcasting,
            [classId]: {
              ...classData,
              knownCantrips: classData.knownCantrips.filter((id) => id !== spellId),
            },
          },
        },
        updatedAt: new Date().toISOString(),
      };
      const recomputed = recomputeDerivedStats(updated, resolveDeps(updated));
      const next: AppCharacter = { ...recomputed, id: active.id };
      persist(next);
    },

    consumeSpellSlot: (level) => {
      const active = get().character;
      if (!active) return;
      const next: AppCharacter = {
        ...coreConsumeSpellSlot(active, level),
        id: active.id,
      };
      persist(next);
    },

    recoverSpellSlot: (level) => {
      const active = get().character;
      if (!active) return;
      const next: AppCharacter = {
        ...coreRecoverSpellSlot(active, level),
        id: active.id,
      };
      persist(next);
    },

    updateCharacter: (input) => {
      const active = get().character;
      if (!active) return;

      // Merge identity patches onto a shallow copy. Because Character fields
      // are readonly, we cast through `as Record<string,unknown>` to build a
      // mutable intermediate object, then restore readonly fields.
      const draft = { ...active } as Record<string, unknown>;

      if (input.name !== undefined) draft.name = input.name;
      if (input.species !== undefined) draft.species = input.species;
      if (input.speciesSubtype !== undefined) draft.speciesSubtype = input.speciesSubtype;
      if (input.background !== undefined) draft.background = input.background;
      if (input.classes !== undefined) draft.classes = input.classes;
      if (input.abilityScores) {
        const prev = draft.abilityScores as Character['abilityScores'];
        draft.abilityScores = { ...prev, ...input.abilityScores };
      }

      // Resolve deps from the patched character — critical when species,
      // background, or classes changed.
      const patched = draft as unknown as Character;
      const deps = resolveDeps(patched);
      const recomputed = recomputeDerivedStats(patched, deps);
      const next: AppCharacter = {
        ...recomputed,
        id: active.id,
        updatedAt: new Date().toISOString(),
      };
      persist(next);
    },
  };
});
