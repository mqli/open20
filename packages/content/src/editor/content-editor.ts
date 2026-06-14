import type { Spell } from 'open20-core';
import type { EditableContentPack } from '../types/content-pack';
import type { EditState, UndoEntry } from '../types/edit-state';

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

  // ── Undo ───────────────────────────────────────────────────

  /** Undo the last operation. Restores pack to prior snapshot. */
  undo(): void {
    if (!this.canUndo) {
      console.warn('No undo available');
      return;
    }
    const entry = this.editState.undoStack.pop()!;
    const snapshot = JSON.parse(entry.snapshot) as { spells?: unknown; meta?: unknown };
    // Restore pack fields from snapshot
    if ('spells' in snapshot) {
      if (snapshot.spells === null) {
        delete this.pack.spells; // Remove spells if it was undefined before
      } else {
        this.pack.spells = snapshot.spells as Spell[];
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
    // Always include spells in snapshot (use null if undefined, so JSON.stringify preserves the key)
    const snapshotObj: Record<string, unknown> = {
      meta: this.pack.meta,
    };
    if (this.pack.spells !== undefined) {
      snapshotObj.spells = this.pack.spells;
    } else {
      snapshotObj.spells = null; // Use null to preserve the key
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
