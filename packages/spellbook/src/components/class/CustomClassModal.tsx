import { useState, useCallback, useMemo } from 'react';
import {
  DialogRoot,
  DialogContent,
  DialogTitle,
  DialogClose,
  Button,
  Text,
  Surface,
} from '@open20/ui';
import { X, Plus, Trash2, Sparkles, Pencil, ArrowLeft, Settings } from 'lucide-react';
import { useCustomClassStore, type CustomClassEntry } from '@/stores/customClassStore';
import { useTranslation } from '@/i18n';
import { CustomClassFormInner } from './CustomClassForm';

// ── Outer modal wrapper (forces remount via key when form resets) ─

interface CustomClassModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If set, pre-populate the form for editing. */
  editingEntry?: CustomClassEntry | null;
  /** Compact render (for use in dropdown flyout, no full dialog). */
  compact?: boolean;
}

export function CustomClassModal({
  open,
  onOpenChange,
  editingEntry,
  compact,
}: CustomClassModalProps) {
  const { classes: allEntries, saveClass, deleteClass } = useCustomClassStore();
  const t = useTranslation();

  // Internal selection: null = list view, 'new' = create form, classId = edit form
  // Reset to list view when modal opens, unless external editingEntry is provided
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);

  // Sync internal state when modal opens
  const selectedId = useMemo(() => {
    if (!open) return null;
    if (editingEntry) return editingEntry.class.id; // external call
    return internalSelectedId;
  }, [open, editingEntry, internalSelectedId]);

  // Find the entry being edited (when selectedId is a class id)
  const activeEntry = useMemo(
    () => (selectedId ? allEntries.find((e) => e.class.id === selectedId) : null),
    [selectedId, allEntries],
  );

  // When modal opens with no external editingEntry and no prior selection, default to list view (null).
  // If there are no entries yet, auto-open create form.
  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next) {
        if (editingEntry) {
          // external edit — keep as-is
        } else if (allEntries.length === 0) {
          setInternalSelectedId('new');
        } else {
          setInternalSelectedId(null);
        }
      } else {
        setInternalSelectedId(null);
      }
      onOpenChange(next);
    },
    [onOpenChange, editingEntry, allEntries.length],
  );

  const handleSelectEdit = useCallback((classId: string) => {
    setInternalSelectedId(classId);
  }, []);

  const handleCreateNew = useCallback(() => {
    setInternalSelectedId('new');
  }, []);

  const handleBackToList = useCallback(() => {
    setInternalSelectedId(null);
  }, []);

  const handleDeleteFromList = useCallback(
    (classId: string) => {
      if (!window.confirm(t('deleteConfirmCustomClass'))) return;
      deleteClass(classId);
    },
    [deleteClass, t],
  );

  // Key forces full remount when switching between create/edit
  // External editingEntry uses its own key path
  const resolvedEditingEntry =
    editingEntry ?? (selectedId && selectedId !== 'new' ? (activeEntry ?? null) : null);
  const formKey = open
    ? editingEntry
      ? editingEntry.class.id
      : selectedId === 'new'
        ? 'new'
        : (selectedId ?? 'closed')
    : 'closed';

  const handleSave = useCallback(
    (entry: CustomClassEntry) => {
      saveClass(entry);
      // Return to list view after save (for internal navigation)
      if (!editingEntry) {
        handleBackToList();
      } else {
        onOpenChange(false);
      }
    },
    [saveClass, onOpenChange, editingEntry, handleBackToList],
  );

  const handleDelete = useCallback(
    (classId: string) => {
      deleteClass(classId);
      // Return to list view after delete (for internal navigation)
      if (!editingEntry) {
        handleBackToList();
      } else {
        onOpenChange(false);
      }
    },
    [deleteClass, onOpenChange, editingEntry, handleBackToList],
  );

  // ── Compact mode (external editingEntry only) ──
  if (compact) {
    return (
      <CustomClassFormInner
        key={formKey}
        editingEntry={editingEntry}
        compact
        onSave={handleSave}
        onDelete={handleDelete}
        onDismiss={() => onOpenChange(false)}
      />
    );
  }

  // ── Form view ──
  const showForm = selectedId === 'new' || (selectedId !== null && !!activeEntry) || !!editingEntry;

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="sm">
        {showForm ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                {/* Back button (internal navigation only) */}
                {!editingEntry && (
                  <Button variant="ghost" size="sm" className="p-1" onClick={handleBackToList}>
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <DialogTitle>
                  <Sparkles className="w-4 h-4 mr-1 inline" />
                  {resolvedEditingEntry ? t('editCustomClass') : t('createCustomClass')}
                </DialogTitle>
              </div>
              <DialogClose asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <X className="w-4 h-4" />
                </Button>
              </DialogClose>
            </div>
            <CustomClassFormInner
              key={formKey}
              editingEntry={resolvedEditingEntry}
              onSave={handleSave}
              onDelete={handleDelete}
              onDismiss={() => {
                if (editingEntry) {
                  onOpenChange(false);
                } else {
                  handleBackToList();
                }
              }}
            />
          </>
        ) : (
          <>
            {/* ── List view ── */}
            <div className="flex justify-between items-center mb-4">
              <DialogTitle>
                <Settings className="w-4 h-4 mr-1 inline" />
                {t('manageCustomClasses')}
              </DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="sm" className="p-1">
                  <X className="w-4 h-4" />
                </Button>
              </DialogClose>
            </div>

            <div className="space-y-3">
              <Button variant="primary" size="sm" onClick={handleCreateNew} className="w-full">
                <Plus className="w-4 h-4 mr-1" />
                {t('createCustomClass')}
              </Button>

              {allEntries.length === 0 ? (
                <Text variant="body" className="text-text-tertiary text-center py-4">
                  {t('noCustomClasses')}
                </Text>
              ) : (
                <div className="space-y-2 mt-3">
                  {allEntries.map((entry) => (
                    <Surface
                      key={entry.class.id}
                      variant="default"
                      padding="sm"
                      className="flex items-center justify-between border"
                    >
                      <div>
                        <Text weight="bold" size="sm">
                          {entry.class.name}
                        </Text>
                        <Text variant="caption" className="text-text-tertiary">
                          {entry.class.spellcasting?.ability ?? '—'} · {entry.subclasses.length}{' '}
                          {entry.subclasses.length === 1 ? 'subclass' : 'subclasses'}
                        </Text>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-1.5"
                          onClick={() => handleSelectEdit(entry.class.id)}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-1.5 text-destructive"
                          onClick={() => handleDeleteFromList(entry.class.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Surface>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </DialogRoot>
  );
}
