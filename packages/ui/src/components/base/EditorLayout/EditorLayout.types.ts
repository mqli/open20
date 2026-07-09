import type { ReactNode, FormEvent } from 'react';

export interface EditorLayoutActionProps {
  /** Save callback with optional intent (stay/new/close) */
  onSave: (intent?: 'stay' | 'new' | 'close') => void;
  /** Whether the form is dirty (has unsaved changes) */
  isDirty: boolean;
  /** Whether the form passes validation */
  isValid: boolean;
  /** Whether a save is in progress */
  isSubmitting: boolean;
}

export interface EditorLayoutProps {
  /** Left column: editor form content (Tabs, sections, etc.) */
  children: ReactNode;
  /** Right column: preview card (optional) */
  preview?: ReactNode;
  /** Validation errors map: field -> message */
  errors?: Record<string, string>;
  /** Additional className for the outer grid wrapper */
  className?: string;

  // ── Form handlers ──
  /** Form submit handler (called when <form> onSubmit fires or Save button clicked) */
  onSubmit: (e: FormEvent) => void;
  /** Save handler for action buttons — passed to renderActions and used by default buttons */
  onSave: (intent?: 'stay' | 'new' | 'close') => void;
  /** Cancel button handler (shows Cancel button when provided) */
  onCancel?: () => void;

  // ── State ──
  /** Disable all interactive elements */
  disabled?: boolean;
  /** Whether a save is in progress */
  isSubmitting?: boolean;
  /** Whether the form has unsaved changes */
  isDirty?: boolean;
  /** Whether the form is valid */
  isValid?: boolean;

  // ── Actions ──
  /** Custom action buttons render prop (replaces default Cancel + Save) */
  renderActions?: (props: EditorLayoutActionProps) => ReactNode;

  // ── Labels ──
  /** Label for the preview section header */
  previewLabel?: ReactNode;
  /** Label for the Cancel button */
  cancelLabel?: string;
  /** Label for the Save button */
  saveLabel?: string;
  /** Label shown while saving */
  savingLabel?: string;
}
