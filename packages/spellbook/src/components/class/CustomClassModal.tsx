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
import { X, Plus, Trash2, Sparkles, Pencil, ArrowLeft, Settings, BookOpen } from 'lucide-react';
import type { Subclass } from 'open20-core';
import { useCustomClassStore, type CustomClassEntry } from '@/stores/customClassStore';
import { useTranslation } from '@/i18n';
import { CustomClassFormInner } from './CustomClassForm';
import { getAllClasses } from '@/core/content-resolver';

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
  const {
    classes: allEntries,
    standaloneSubclasses,
    saveClass,
    deleteClass,
    addSubclass,
    addStandaloneSubclass,
  } = useCustomClassStore();
  const t = useTranslation();

  // Internal selection: null = list view, 'new' = create form, classId = edit form,
  // 'addsub:<classId>' = add subclass to existing class
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

  // Condense add-subclass: extract target classId from 'addsub:<classId>' syntax
  const addsubTargetId = useMemo(() => {
    if (!selectedId?.startsWith('addsub:')) return null;
    return selectedId.slice('addsub:'.length);
  }, [selectedId]);

  const addsubTargetName = useMemo(() => {
    if (!addsubTargetId) return '';
    const custom = allEntries.find((e) => e.class.id === addsubTargetId)?.class.name;
    if (custom) return custom;
    const srd = getAllClasses().find((c) => c.id === addsubTargetId);
    return srd?.name ?? '';
  }, [addsubTargetId, allEntries]);

  // SRD classes that have spellcasting (for quick "add subclass" access)
  const customClassIds = useMemo(() => new Set(allEntries.map((e) => e.class.id)), [allEntries]);

  const srdSpellcastingClasses = useMemo(
    () =>
      getAllClasses()
        .filter((c) => c.spellcasting && !customClassIds.has(c.id))
        .sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [customClassIds],
  );

  // Whether the add-subclass target is an SRD class (not in custom store)
  const addsubTargetIsSrd = useMemo(
    () => addsubTargetId !== null && !customClassIds.has(addsubTargetId ?? ''),
    [addsubTargetId, customClassIds],
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

  const handleAddSubclassToExisting = useCallback((classId: string) => {
    setInternalSelectedId(`addsub:${classId}`);
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

  const handleAddSubclass = useCallback(
    (classId: string, subclass: Subclass) => {
      if (addsubTargetIsSrd) {
        addStandaloneSubclass(classId, subclass);
      } else {
        addSubclass(classId, subclass);
      }
      handleBackToList();
    },
    [addSubclass, addStandaloneSubclass, addsubTargetIsSrd, handleBackToList],
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
  const showForm =
    selectedId === 'new' ||
    (selectedId !== null && !!activeEntry) ||
    !!editingEntry ||
    !!addsubTargetId;

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange}>
      <DialogContent size="sm">
        {showForm ? (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                {/* Back button (internal navigation only) */}
                {!editingEntry && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-1"
                    onClick={handleBackToList}
                    data-testid="class-modal-back-btn"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                )}
                <DialogTitle>
                  {addsubTargetId ? (
                    <>
                      <Plus className="w-4 h-4 mr-1 inline" />
                      {t('addSubclassTo', { name: addsubTargetName })}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-1 inline" />
                      {resolvedEditingEntry ? t('editCustomClass') : t('createCustomClass')}
                    </>
                  )}
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
              addSubclassToClassId={addsubTargetId ?? undefined}
              onAddSubclass={addsubTargetId ? handleAddSubclass : undefined}
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

              {/* ── Custom Classes ── */}
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
                          {standaloneSubclasses.filter((s) => s.parentClass === entry.class.id)
                            .length > 0 &&
                            ` (+${standaloneSubclasses.filter((s) => s.parentClass === entry.class.id).length} standalone)`}
                        </Text>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-1.5"
                          onClick={() => handleAddSubclassToExisting(entry.class.id)}
                          title={t('addSubclassTo', { name: entry.class.name })}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
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

              {/* ── SRD Classes ── */}
              {srdSpellcastingClasses.length > 0 && (
                <div className="space-y-2 mt-3">
                  <Text
                    variant="caption"
                    weight="semibold"
                    className="text-text-tertiary uppercase tracking-wider"
                  >
                    {t('srdClasses')}
                  </Text>
                  {srdSpellcastingClasses.map((klass) => {
                    const standaloneCount = standaloneSubclasses.filter(
                      (s) => s.parentClass === klass.id,
                    ).length;
                    return (
                      <Surface
                        key={klass.id}
                        variant="default"
                        padding="sm"
                        className="flex items-center justify-between border border-dashed"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                          <div>
                            <Text weight="bold" size="sm">
                              {klass.name}
                            </Text>
                            <Text variant="caption" className="text-text-tertiary">
                              {klass.spellcasting?.ability ?? '—'} ·{' '}
                              {standaloneCount > 0
                                ? `${standaloneCount} custom ${standaloneCount === 1 ? 'subclass' : 'subclasses'}`
                                : 'SRD only'}
                            </Text>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-1.5"
                          onClick={() => handleAddSubclassToExisting(klass.id)}
                          title={t('addSubclassTo', { name: klass.name || klass.id })}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      </Surface>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </DialogRoot>
  );
}
