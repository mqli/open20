import { useState, useCallback, useMemo, useRef } from 'react';
import { SpellEditor, Button, Text, ResponsiveDialog } from '@open20/ui';
import { ClipboardPaste } from 'lucide-react';
import type { Spell } from 'open20-core';
import { useCustomSpellStore } from '@/stores/customSpellStore';
import { useTranslation } from '@/i18n';
import { useIsLargeScreen } from '@/hooks/useBreakpoint';

interface CustomSpellModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingSpell?: Spell | null;
}

export function CustomSpellModal({ open, onOpenChange, editingSpell }: CustomSpellModalProps) {
  const t = useTranslation();
  const isLarge = useIsLargeScreen();
  const { addSpell, updateSpell } = useCustomSpellStore();

  const [showPasteArea, setShowPasteArea] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedSpell, setParsedSpell] = useState<Partial<Spell> | undefined>(undefined);

  const isEditing = !!editingSpell;

  // Editable value for SpellEditor (controlled)
  const [currentValue, setCurrentValue] = useState<Partial<Spell> | undefined>(undefined);

  // Reset state when dialog opens/closes
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setShowPasteArea(false);
        setPasteText('');
        setParseError(null);
        setParsedSpell(undefined);
        setCurrentValue(undefined);
      }
      onOpenChange(newOpen);
    },
    [onOpenChange],
  );

  const handleParsePastedText = useCallback(async () => {
    const trimmed = pasteText.trim();
    if (!trimmed) {
      setParseError('Please paste spell text first.');
      return;
    }
    try {
      const { parsePlainText, transformSpell } = await import('@open20/content/parser');
      const parsed = parsePlainText(trimmed);
      const result = transformSpell(parsed);
      setParsedSpell(result as Partial<Spell>);
      setCurrentValue(result as Partial<Spell>);
      setParseError(null);
      setShowPasteArea(false);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse spell text.');
    }
  }, [pasteText]);

  const handleSubmit = useCallback(
    (spell: Spell, intent?: 'stay' | 'new' | 'close') => {
      if (isEditing) {
        updateSpell(spell);
      } else {
        addSpell({ ...spell, source: 'Homebrew' });
      }

      if (intent === 'new') {
        setCurrentValue(undefined);
        setParsedSpell(undefined);
      } else if (intent === 'close') {
        handleOpenChange(false);
      }
      // 'stay' (default) - keep editor open
    },
    [isEditing, addSpell, updateSpell, handleOpenChange],
  );

  const handleCancel = useCallback(() => {
    handleOpenChange(false);
  }, [handleOpenChange]);

  const editorValue = useMemo(
    () => parsedSpell || currentValue || editingSpell || undefined,
    [parsedSpell, currentValue, editingSpell],
  );

  const title = isEditing ? t('editCustomSpell') : t('createCustomSpell');

  // Capture SpellEditor's save API for rendering in the fixed footer
  const saveApiRef = useRef<((intent: 'stay' | 'new' | 'close') => void) | null>(null);
  const [saveState, setSaveState] = useState({ isValid: false, isSubmitting: false });

  const renderActions = useCallback(
    ({
      onSave,
      isValid,
      isSubmitting,
    }: {
      onSave: (intent: 'stay' | 'new' | 'close') => void;
      isValid: boolean;
      isSubmitting: boolean;
    }) => {
      saveApiRef.current = onSave;
      // Sync validation/submitting state into local state so renderFooter re-renders
      if (saveState.isValid !== isValid || saveState.isSubmitting !== isSubmitting) {
        setSaveState({ isValid, isSubmitting });
      }
      return null; // Hide built-in buttons, we render them in the footer
    },
    [saveState.isValid, saveState.isSubmitting],
  );

  const renderFooter = () => (
    <div className="shrink-0 border-t border-border px-4 py-3 sm:px-6 flex justify-end gap-2">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleCancel}
        disabled={saveState.isSubmitting}
        className="shrink-0"
      >
        {t('cancel')}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => saveApiRef.current?.('stay')}
        disabled={!saveState.isValid || saveState.isSubmitting}
        className="shrink-0"
      >
        {t('saveSpell')}
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => saveApiRef.current?.('new')}
        disabled={!saveState.isValid || saveState.isSubmitting}
        className="shrink-0"
      >
        {t('saveAndNew')}
      </Button>
      <Button
        type="button"
        variant="primary"
        size="sm"
        onClick={() => saveApiRef.current?.('close')}
        disabled={!saveState.isValid || saveState.isSubmitting}
        className="shrink-0"
      >
        {t('saveAndClose')}
      </Button>
    </div>
  );

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={handleOpenChange}
      isMobile={!isLarge}
      title={title}
      sheetSide="bottom"
      sheetClassName="h-[90vh] flex flex-col overflow-hidden"
      dialogSize="xl"
      dialogClassName="h-[90vh] overflow-hidden"
      renderFooter={renderFooter}
    >
      <div className="flex flex-col flex-1 min-h-0">
        {/* Paste-from-text import */}
        <div className="shrink-0 px-4 pt-3 sm:px-6">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowPasteArea(!showPasteArea);
              setParseError(null);
            }}
          >
            <ClipboardPaste className="w-4 h-4 mr-1.5" />
            {t('importFromText')}
          </Button>

          {showPasteArea && (
            <div className="mt-3 p-4 rounded-lg border bg-muted/30 space-y-3">
              <Text as="p" variant="bodySm" className="text-muted-foreground">
                {t('pasteSpellText')}
              </Text>
              <textarea
                className="w-full min-h-[160px] p-3 rounded-md border bg-background text-sm font-mono resize-y"
                placeholder={t('pastePlaceholder')}
                value={pasteText}
                onChange={(e) => {
                  setPasteText(e.target.value);
                  setParseError(null);
                }}
              />
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleParsePastedText}
                  disabled={!pasteText.trim()}
                >
                  {t('parseAndFill')}
                </Button>
                {parseError && (
                  <Text as="p" variant="bodySm" className="text-destructive">
                    {parseError}
                  </Text>
                )}
              </div>
            </div>
          )}
        </div>

        {/* SpellEditor */}
        <div className="flex-1 min-h-0 overflow-y-auto [&_.bg-bg-primary]:bg-transparent px-4 py-3 sm:px-6">
          <SpellEditor
            value={editorValue}
            onChange={setCurrentValue}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            renderActions={renderActions}
          />
        </div>
      </div>
    </ResponsiveDialog>
  );
}
