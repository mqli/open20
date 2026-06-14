/** Single undo entry — snapshot before an operation */
export interface UndoEntry {
  /** Serialized JSON snapshot of the pack before the operation */
  snapshot: string;
  /** Human-readable description (e.g., "Added spell Fireball") */
  description: string;
  /** Timestamp when the operation occurred */
  timestamp: string;
}

/**
 * Runtime edit state — NEVER serialized to export JSON.
 * Maintained internally by ContentEditor (Task D).
 */
export interface EditState {
  createdAt: string;
  updatedAt: string;
  schemaVersion: string;
  undoStack: UndoEntry[];
}
