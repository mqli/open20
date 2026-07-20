import { useState, useRef, useCallback } from 'react';
import { Button, Text, ResponsiveDialog } from '@open20/ui';
import { Upload, CheckCircle2, AlertCircle, User } from 'lucide-react';
import { useTranslation } from '@/i18n';
import { useIsLargeScreen } from '@/hooks/useBreakpoint';
import {
  parseAndValidateCharacterBundle,
  importCharacterBundle,
} from './character-import-export-utils';
import type { CharacterBundle } from './character-import-export-types';

type DialogState =
  | { phase: 'idle' }
  | { phase: 'parsing' }
  | { phase: 'preview'; bundle: CharacterBundle; warnings: string[] }
  | { phase: 'not-character'; message: string }
  | { phase: 'importing' }
  | {
      phase: 'result';
      characterId: string;
      characterName: string;
      importedSpells: number;
      skippedSpells: number;
      importedSubclasses: number;
    };

export type CharacterImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CharacterImportDialog({ open, onOpenChange }: CharacterImportDialogProps) {
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
          phase: 'not-character',
          message: t('invalidCharacterFile'),
        });
        return;
      }

      setState({ phase: 'parsing' });

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = reader.result as string;
          const result = parseAndValidateCharacterBundle(text);

          if (result.type === 'character-bundle') {
            setState({
              phase: 'preview',
              bundle: result.bundle,
              warnings: result.warnings,
            });
          } else if (result.type === 'spells-or-pack') {
            setState({ phase: 'not-character', message: result.message });
          } else {
            setState({ phase: 'not-character', message: result.errors.join('\n') });
          }
        } catch (e) {
          setState({
            phase: 'not-character',
            message: e instanceof Error ? e.message : t('invalidCharacterFile'),
          });
        }
      };
      reader.onerror = () => {
        setState({
          phase: 'not-character',
          message: 'Failed to read file.',
        });
      };
      reader.readAsText(file);
    },
    [t],
  );

  const handleImport = useCallback(async () => {
    if (state.phase !== 'preview') return;

    setState({ phase: 'importing' });

    try {
      const result = await importCharacterBundle(state.bundle);

      setState({
        phase: 'result',
        characterId: result.characterId,
        characterName: result.characterName,
        importedSpells: result.importedSpells,
        skippedSpells: result.skippedSpells,
        importedSubclasses: result.importedSubclasses,
      });
    } catch (e) {
      setState({
        phase: 'not-character',
        message: e instanceof Error ? e.message : 'Import failed.',
      });
    }
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

  const spellCount = state.phase === 'preview' ? (state.bundle.content.spells?.length ?? 0) : 0;
  const subclassCount =
    state.phase === 'preview' ? (state.bundle.content.subclasses?.length ?? 0) : 0;

  const renderFooter = () => {
    if (state.phase === 'preview') {
      return (
        <div className="flex items-center justify-end gap-2 shrink-0 px-4 py-3 sm:px-6 border-t border-border">
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="character-import-btn"
            onClick={() => handleImport()}
          >
            {t('importCharacter')}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
            {t('cancel')}
          </Button>
        </div>
      );
    }
    if (state.phase === 'not-character') {
      return (
        <div className="flex items-center justify-end gap-2 shrink-0 px-4 py-3 sm:px-6 border-t border-border">
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
    state.phase === 'preview' || state.phase === 'not-character' || state.phase === 'result';

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={handleOpenChange}
      isMobile={!isLarge}
      title={t('importCharacterTitle')}
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
              character-import-drop-zone
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
              className="character-import-file-input hidden"
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
          <div className="space-y-4">
            {/* Character info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-5 h-5" />
                <Text variant="body" className="font-medium">
                  {t('characterImportPreview')}
                </Text>
              </div>

              <div className="bg-muted/30 border rounded-md p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <Text variant="body" className="character-import-preview-name font-medium">
                    {state.bundle.character.name}
                  </Text>
                </div>
                <Text variant="bodySm" className="text-muted-foreground">
                  {state.bundle.character.species}
                  {' — '}
                  {state.bundle.character.classes.map((c) => `${c.classId} ${c.level}`).join(' / ')}
                </Text>
              </div>
            </div>

            {/* Content summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="character-import-spell-count bg-muted/30 border rounded-md p-3">
                <Text variant="bodySm" className="text-muted-foreground">
                  {t('customSpells')}
                </Text>
                <Text variant="heading" className="mt-1">
                  {spellCount}
                </Text>
              </div>
              <div className="character-import-subclass-count bg-muted/30 border rounded-md p-3">
                <Text variant="bodySm" className="text-muted-foreground">
                  {t('customSubclasses')}
                </Text>
                <Text variant="heading" className="mt-1">
                  {subclassCount}
                </Text>
              </div>
            </div>

            {spellCount > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-1 border rounded-md p-3 bg-muted/30">
                {state.bundle.content.spells?.slice(0, 10).map((spell) => (
                  <div key={spell.id} className="flex items-center gap-2 text-sm">
                    <span className="truncate">{spell.name}</span>
                    <span className="text-muted-foreground shrink-0 ml-auto">
                      {spell.level === 0 ? t('cantrip') : `${t('levelLabel')} ${spell.level}`}
                    </span>
                  </div>
                ))}
                {spellCount > 10 && (
                  <Text variant="bodySm" className="text-muted-foreground">
                    ...and {spellCount - 10} more
                  </Text>
                )}
              </div>
            )}

            {subclassCount > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-1 border rounded-md p-3 bg-muted/30">
                {state.bundle.content.subclasses?.map((sub) => (
                  <div key={sub.id} className="flex items-center gap-2 text-sm">
                    <span className="truncate">{sub.id}</span>
                    <span className="text-muted-foreground shrink-0 ml-auto">
                      {sub.parentClass}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {state.warnings.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="w-5 h-5" />
                  <Text variant="bodySm" className="font-medium">
                    {state.warnings.length} warning{state.warnings.length !== 1 ? 's' : ''}
                  </Text>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1 text-xs text-muted-foreground">
                  {state.warnings.map((warn, i) => (
                    <div key={i} className="truncate">
                      {warn}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase: not a character file */}
        {state.phase === 'not-character' && (
          <div className="character-import-error space-y-3">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <Text variant="body" className="font-medium">
                {state.message}
              </Text>
            </div>
          </div>
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
          <div className="character-import-result space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              <Text variant="body" className="font-medium">
                {t('characterImported').replace('{name}', state.characterName)}
              </Text>
            </div>
            <div className="space-y-1">
              {state.importedSpells > 0 && (
                <Text variant="bodySm" className="text-muted-foreground">
                  {t('spellsImported').replace('{count}', String(state.importedSpells))}
                </Text>
              )}
              {state.skippedSpells > 0 && (
                <Text variant="bodySm" className="text-muted-foreground">
                  {t('spellsSkipped').replace('{count}', String(state.skippedSpells))}
                </Text>
              )}
              {state.importedSubclasses > 0 && (
                <Text variant="bodySm" className="text-muted-foreground">
                  {state.importedSubclasses} subclass
                  {state.importedSubclasses !== 1 ? 'es' : ''} imported
                </Text>
              )}
            </div>
          </div>
        )}
      </div>
    </ResponsiveDialog>
  );
}
