import type { Spell, Monster } from 'open20-core';
import type { EditableContentPack } from '../types/content-pack';
import type { EditState, UndoEntry } from '../types/edit-state';

/** Content keys that participate in snapshot/undo tracking */
const SNAPSHOT_KEYS = ['spells', 'monsters'] as const;

export class ContentEditor {
  readonly pack: EditableContentPack;
  private editState: EditState;

  constructor(pack: EditableContentPack) {
    this.pack = pack;
    this.editState = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      schemaVersion: '1.0.0',
      undoStack: [],
    };
  }

  // ── Spell CRUD ────────────────────────────────────────────

  /** Add a spell to the pack. Creates spells array if needed. */
  addSpell(spell: Spell): void {
    this.snapshotBeforeOperation(`Added spell ${spell.name || spell.id}`);
    if (!this.pack.spells) {
      this.pack.spells = [];
    }
    // Create a mutable copy to avoid read-only issues
    const mutableSpell: Spell = JSON.parse(JSON.stringify(spell));
    this.pack.spells.push(mutableSpell);
    this.editState.updatedAt = new Date().toISOString();
  }

  /** Update existing spell by ID. Partial update. Throws if not found. */
  updateSpell(spellId: string, updates: Partial<Spell>): void {
    const spell = this.getSpell(spellId);
    if (!spell) {
      throw new Error(`Spell with id "${spellId}" not found`);
    }
    this.snapshotBeforeOperation(`Updated spell ${spellId}`);
    // Create mutable copy, apply updates, then assign back
    const mutable = JSON.parse(JSON.stringify(spell)) as Spell;
    Object.assign(mutable, updates);
    const index = this.pack.spells!.findIndex((s) => s.id === spellId);
    this.pack.spells![index] = mutable;
    this.editState.updatedAt = new Date().toISOString();
  }

  /** Remove a spell by ID. Throws if not found. */
  removeSpell(spellId: string): void {
    const index = this.pack.spells?.findIndex((s) => s.id === spellId) ?? -1;
    if (index === -1) {
      throw new Error(`Spell with id "${spellId}" not found`);
    }
    this.snapshotBeforeOperation(`Removed spell ${spellId}`);
    this.pack.spells!.splice(index, 1);
    this.editState.updatedAt = new Date().toISOString();
  }

  /** Duplicate a spell with new ID (originalId + '-copy' suffix). */
  duplicateSpell(spellId: string): Spell {
    const original = this.getSpell(spellId);
    if (!original) {
      throw new Error(`Spell with id "${spellId}" not found`);
    }
    this.snapshotBeforeOperation(`Duplicated spell ${spellId}`);
    const copy: Spell = JSON.parse(JSON.stringify(original));
    // Mutate the copy (no longer readonly after JSON parse)
    (copy as { id: string }).id = `${original.id}-copy`;
    if (!this.pack.spells) {
      this.pack.spells = [];
    }
    this.pack.spells.push(copy);
    this.editState.updatedAt = new Date().toISOString();
    return copy;
  }

  /** Get a spell by ID. Returns undefined if not found. */
  getSpell(spellId: string): Spell | undefined {
    return this.pack.spells?.find((s) => s.id === spellId);
  }

  /** List all spells in the pack. */
  listSpells(): Spell[] {
    return this.pack.spells ? [...this.pack.spells] : [];
  }

  // ── Monster CRUD ──────────────────────────────────────────

  /** Add a monster to the pack. Creates monsters array if needed. */
  addMonster(monster: Monster): void {
    this.snapshotBeforeOperation(`Added monster ${monster.name || monster.id}`);
    if (!this.pack.monsters) {
      this.pack.monsters = [];
    }
    const mutableMonster: Monster = JSON.parse(JSON.stringify(monster));
    this.pack.monsters.push(mutableMonster);
    this.editState.updatedAt = new Date().toISOString();
  }

  /** Update existing monster by ID. Partial update. Throws if not found. */
  updateMonster(monsterId: string, updates: Partial<Monster>): void {
    const monster = this.getMonster(monsterId);
    if (!monster) {
      throw new Error(`Monster with id "${monsterId}" not found`);
    }
    this.snapshotBeforeOperation(`Updated monster ${monsterId}`);
    const mutable = JSON.parse(JSON.stringify(monster)) as Monster;
    Object.assign(mutable, updates);
    const index = this.pack.monsters!.findIndex((m) => m.id === monsterId);
    this.pack.monsters![index] = mutable;
    this.editState.updatedAt = new Date().toISOString();
  }

  /** Remove a monster by ID. Throws if not found. */
  removeMonster(monsterId: string): void {
    const index = this.pack.monsters?.findIndex((m) => m.id === monsterId) ?? -1;
    if (index === -1) {
      throw new Error(`Monster with id "${monsterId}" not found`);
    }
    this.snapshotBeforeOperation(`Removed monster ${monsterId}`);
    this.pack.monsters!.splice(index, 1);
    this.editState.updatedAt = new Date().toISOString();
  }

  /** Duplicate a monster with new ID (originalId + '-copy' suffix). */
  duplicateMonster(monsterId: string): Monster {
    const original = this.getMonster(monsterId);
    if (!original) {
      throw new Error(`Monster with id "${monsterId}" not found`);
    }
    this.snapshotBeforeOperation(`Duplicated monster ${monsterId}`);
    const copy: Monster = JSON.parse(JSON.stringify(original));
    (copy as { id: string }).id = `${original.id}-copy`;
    if (!this.pack.monsters) {
      this.pack.monsters = [];
    }
    this.pack.monsters.push(copy);
    this.editState.updatedAt = new Date().toISOString();
    return copy;
  }

  /** Get a monster by ID. Returns undefined if not found. */
  getMonster(monsterId: string): Monster | undefined {
    return this.pack.monsters?.find((m) => m.id === monsterId);
  }

  /** List all monsters in the pack. */
  listMonsters(): Monster[] {
    return this.pack.monsters ? [...this.pack.monsters] : [];
  }

  // ── Undo ───────────────────────────────────────────────────

  /** Undo the last operation. Restores pack to prior snapshot. */
  undo(): void {
    if (!this.canUndo) {
      console.warn('No undo available');
      return;
    }
    const entry = this.editState.undoStack.pop()!;
    const snapshot = JSON.parse(entry.snapshot) as Record<string, unknown>;
    // Restore pack fields from snapshot
    const packRecord = this.pack as unknown as Record<string, unknown>;
    for (const key of SNAPSHOT_KEYS) {
      if (key in snapshot) {
        if (snapshot[key] === null) {
          delete packRecord[key];
        } else {
          packRecord[key] = snapshot[key];
        }
      }
    }
    if (snapshot.meta !== undefined) {
      this.pack.meta = snapshot.meta as EditableContentPack['meta'];
    }
  }

  /** Whether there is an undo operation available. */
  get canUndo(): boolean {
    return this.editState.undoStack.length > 0;
  }

  // ── Private helpers ────────────────────────────────────────

  /** Snapshot the pack state before a mutation (for undo). */
  private snapshotBeforeOperation(description: string): void {
    const snapshotObj: Record<string, unknown> = {
      meta: this.pack.meta,
    };
    for (const key of SNAPSHOT_KEYS) {
      if (this.pack[key] !== undefined) {
        snapshotObj[key] = this.pack[key];
      } else {
        snapshotObj[key] = null; // Use null to preserve the key
      }
    }
    const snapshot = JSON.stringify(snapshotObj);
    const entry: UndoEntry = {
      snapshot,
      description,
      timestamp: new Date().toISOString(),
    };
    this.editState.undoStack.push(entry);
    // Phase 1: keep only 1 entry (pop oldest if > 1)
    if (this.editState.undoStack.length > 1) {
      this.editState.undoStack.shift();
    }
  }
}
