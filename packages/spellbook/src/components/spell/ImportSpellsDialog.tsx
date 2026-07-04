import { useState, useRef, useCallback } from 'react';
import { Button, Text, ResponsiveDialog } from '@open20/ui';
import { Upload, FileJson, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Spell } from 'open20-core';
import { useCustomSpellStore } from '@/stores/customSpellStore';
import { useTranslation } from '@/i18n';
import { useIsLargeScreen } from '@/hooks/useBreakpoint';
import { parseAndValidateSpells } from './import-export-utils';

type DialogState =
  | { phase: 'idle' }
  | { phase: 'parsing' }
  | { phase: 'preview'; spells: Spell[]; errors: string[] }
  | { phase: 'importing' }
  | { phase: 'result'; imported: number; skipped: number };

export type ImportSpellsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ImportSpellsDialog({ open, onOpenChange }: ImportSpellsDialogProps) {
  const t = useTranslation();
  const isLarge = useIsLargeScreen();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [state, setState] = useState<DialogState>({ phase: 'idle' });

  // Reset state when dialog opens/closes
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setState({ phase: 'idle' });
        setDragOver(false);
      }
      onOpenChange(newOpen);
    },
    [onOpenChange],
  );

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.json')) {
        setState({
          phase: 'preview',
          spells: [],
          errors: [t('invalidSpellsFile')],
        });
        return;
      }

      setState({ phase: 'parsing' });

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result as string;
          const result = parseAndValidateSpells(text);
          setState({
            phase: 'preview',
            spells: result.spells,
            errors: result.errors,
          });
        } catch (e) {
          setState({
            phase: 'preview',
            spells: [],
            errors: [e instanceof Error ? e.message : t('invalidSpellsFile')],
          });
        }
      };
      reader.onerror = () => {
        setState({
          phase: 'preview',
          spells: [],
          errors: ['Failed to read file.'],
        });
      };
      reader.readAsText(file);
    },
    [t],
  );

  const handleImport = useCallback(() => {
    if (state.phase !== 'preview' || state.spells.length === 0) return;

    setState({ phase: 'importing' });

    // Use getState() to avoid React batching issues
    const result = useCustomSpellStore.getState().importSpells(state.spells);

    setState({
      phase: 'result',
      imported: result.imported,
      skipped: result.skipped,
    });
  }, [state]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleReset = useCallback(() => {
    setState({ phase: 'idle' });
  }, []);

  const renderFooter = () => {
    if (state.phase === 'preview' && state.spells.length > 0) {
      return (
        <div className="flex items-center justify-end gap-2 shrink-0 px-4 py-3 sm:px-6 border-t border-border">
          <Button type="button" variant="primary" size="sm" onClick={handleImport}>
            {t('importCustomSpells')}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
            {t('cancel')}
          </Button>
        </div>
      );
    }
    if (state.phase === 'result') {
      return (
        <div className="flex items-center justify-end gap-2 shrink-0 px-4 py-3 sm:px-6 border-t border-border">
          <Button type="button" variant="ghost" size="sm" onClick={() => handleOpenChange(false)}>
            {t('cancel')}
          </Button>
        </div>
      );
    }
    return null;
  };

  const hasFooter =
    (state.phase === 'preview' && state.spells.length > 0) || state.phase === 'result';

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={handleOpenChange}
      isMobile={!isLarge}
      title={t('importSpellsTitle')}
      sheetSide="bottom"
      sheetClassName="flex flex-col overflow-hidden"
      dialogSize="md"
      dialogClassName="max-h-[85vh] overflow-hidden"
      renderFooter={hasFooter ? renderFooter : undefined}
    >
      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 space-y-4">
        {/* Phase: idle — file drop zone */}
        {state.phase === 'idle' && (
          <div
            className={`
                relative flex flex-col items-center justify-center gap-3 p-8
                border-2 border-dashed rounded-lg cursor-pointer transition-colors
                ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/50'}
              `}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="w-10 h-10 text-muted-foreground" />
            <Text as="p" variant="body" className="text-muted-foreground text-center">
              {t('dropFileOrClick')}
            </Text>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}

        {/* Phase: parsing */}
        {state.phase === 'parsing' && (
          <div className="flex items-center justify-center gap-2 py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            <Text variant="body">{t('loading')}</Text>
          </div>
        )}

        {/* Phase: preview */}
        {state.phase === 'preview' && (
          <>
            {state.spells.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                  <Text variant="body" className="font-medium">
                    {t('importPreview').replace('{count}', String(state.spells.length))}
                  </Text>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 border rounded-md p-3 bg-muted/30">
                  {state.spells.slice(0, 20).map((spell) => (
                    <div key={spell.id} className="flex items-center gap-2 text-sm">
                      <FileJson className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">{spell.name}</span>
                      <span className="text-muted-foreground shrink-0">
                        {spell.level === 0 ? t('cantrip') : `${t('levelLabel')} ${spell.level}`}
                      </span>
                    </div>
                  ))}
                  {state.spells.length > 20 && (
                    <Text variant="bodySm" className="text-muted-foreground pl-5.5">
                      ...and {state.spells.length - 20} more
                    </Text>
                  )}
                </div>
              </div>
            )}

            {state.errors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                  <Text variant="bodySm" className="font-medium">
                    {state.errors.length} validation{' '}
                    {state.errors.length === 1 ? 'error' : 'errors'}
                  </Text>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1 text-xs text-muted-foreground">
                  {state.errors.map((err, i) => (
                    <div key={i} className="truncate">
                      {err}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {state.spells.length === 0 && state.errors.length === 0 && (
              <Text variant="body" className="text-muted-foreground text-center py-4">
                No spells found in the file.
              </Text>
            )}
          </>
        )}

        {/* Phase: importing */}
        {state.phase === 'importing' && (
          <div className="flex items-center justify-center gap-2 py-8">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            <Text variant="body">{t('loading')}</Text>
          </div>
        )}

        {/* Phase: result */}
        {state.phase === 'result' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <Text variant="body" className="font-medium">
                {t('spellsImported').replace('{count}', String(state.imported))}
              </Text>
            </div>
            {state.skipped > 0 && (
              <Text variant="bodySm" className="text-muted-foreground">
                {t('spellsSkipped').replace('{count}', String(state.skipped))}
              </Text>
            )}
          </div>
        )}
      </div>
    </ResponsiveDialog>
  );
}
