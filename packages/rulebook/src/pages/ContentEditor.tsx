import { useEffect, useCallback, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  SpellEditor,
  MonsterEditor,
  SpeciesEditor,
  BackgroundEditor,
  FeatEditor,
  WeaponEditor,
  ArmorEditor,
  GearEditor,
  Button,
  Text,
} from '@open20/ui';
import { useContentEditorStore } from '../stores/contentEditorStore';
import { parsePlainText, transformSpell } from '@open20/content/parser';
import { ClipboardPaste } from 'lucide-react';
import { buildEditorConfigs } from './editor-config';

export function ContentEditor() {
  const { packId, contentType, contentId } = useParams<{
    packId: string;
    contentType: string;
    contentId?: string;
  }>();
  const navigate = useNavigate();

  // ── Store: metadata + write functions ──
  const {
    isDirty,
    isSaving,
    setParams,
    setSpell,
    setMonster,
    setSpecies,
    setBackground,
    setFeat,
    setWeapon,
    setArmor,
    setGear,
    saveSpell,
    saveMonster,
    saveSpecies,
    saveBackground,
    saveFeat,
    saveWeapon,
    saveArmor,
    saveGear,
    loadSpell,
    loadMonster,
    loadSpecies,
    loadBackground,
    loadFeat,
    loadWeapon,
    loadArmor,
    loadGear,
  } = useContentEditorStore();

  // ── Store: content values (individual selectors for render performance) ──
  const spell = useContentEditorStore((s) => s.spell);
  const monster = useContentEditorStore((s) => s.monster);
  const species = useContentEditorStore((s) => s.species);
  const background = useContentEditorStore((s) => s.background);
  const feat = useContentEditorStore((s) => s.feat);
  const weapon = useContentEditorStore((s) => s.weapon);
  const armor = useContentEditorStore((s) => s.armor);
  const gear = useContentEditorStore((s) => s.gear);

  // ── Content-type-keyed lookup maps ──
  const values: Record<string, unknown> = useMemo(
    () => ({ spell, monster, species, background, feat, weapon, armor, gear }),
    [spell, monster, species, background, feat, weapon, armor, gear],
  );

  const setters: Record<string, (val: unknown) => void> = useMemo(
    () => ({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      spell: setSpell as (val: any) => void,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      monster: setMonster as (val: any) => void,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      species: setSpecies as (val: any) => void,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      background: setBackground as (val: any) => void,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      feat: setFeat as (val: any) => void,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      weapon: setWeapon as (val: any) => void,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      armor: setArmor as (val: any) => void,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gear: setGear as (val: any) => void,
    }),
    [setSpell, setMonster, setSpecies, setBackground, setFeat, setWeapon, setArmor, setGear],
  );

  // ── Editor configs (built once, stable per store refs) ──
  const editorConfigs = useMemo(
    () =>
      buildEditorConfigs(
        {
          SpellEditor,
          MonsterEditor,
          SpeciesEditor,
          BackgroundEditor,
          FeatEditor,
          WeaponEditor,
          ArmorEditor,
          GearEditor,
        },
        {
          saveSpell,
          saveMonster,
          saveSpecies,
          saveBackground,
          saveFeat,
          saveWeapon,
          saveArmor,
          saveGear,
          loadSpell,
          loadMonster,
          loadSpecies,
          loadBackground,
          loadFeat,
          loadWeapon,
          loadArmor,
          loadGear,
        },
      ),
    [
      saveSpell,
      saveMonster,
      saveSpecies,
      saveBackground,
      saveFeat,
      saveWeapon,
      saveArmor,
      saveGear,
      loadSpell,
      loadMonster,
      loadSpecies,
      loadBackground,
      loadFeat,
      loadWeapon,
      loadArmor,
      loadGear,
    ],
  );

  // ── Spell paste-from-text state ──
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  const handleParsePastedText = useCallback(() => {
    const trimmed = pasteText.trim();
    if (!trimmed) {
      setParseError('Please paste spell text first.');
      return;
    }
    try {
      const parsed = parsePlainText(trimmed);
      const result = transformSpell(parsed);
      setSpell(result);
      setParseError(null);
      setShowPasteArea(false);
    } catch (err) {
      setParseError(err instanceof Error ? err.message : 'Failed to parse spell text.');
    }
  }, [pasteText, setSpell]);

  // ── Initialize params + load content for editing ──
  useEffect(() => {
    if (packId && contentType) {
      setParams(packId, contentType, contentId);
      if (contentId) {
        editorConfigs[contentType]?.loadFn(packId, contentId);
      }
    }
  }, [packId, contentType, contentId, setParams, editorConfigs]);

  // ── beforeunload: warn on unsaved changes ──
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // ── Navigation guard ──
  const navigateWithGuard = useCallback(
    (to: string) => {
      if (isDirty) {
        if (!window.confirm('You have unsaved changes. Leave anyway?')) return;
      }
      navigate(to);
    },
    [isDirty, navigate],
  );

  const handleCancel = useCallback(() => {
    navigateWithGuard(packId ? `/rulebook/packs/${packId}` : '/rulebook');
  }, [packId, navigateWithGuard]);

  // ── Shared action buttons (all editors) ──
  const renderContentActions = useCallback(
    (props: {
      onSave: (intent: 'stay' | 'new' | 'close') => void;
      isValid: boolean;
      isSubmitting: boolean;
    }) => (
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleCancel}
          disabled={isSaving}
          className="shrink-0"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => props.onSave('stay')}
          disabled={!props.isValid || isSaving}
          className="shrink-0"
        >
          Save
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => props.onSave('new')}
          disabled={!props.isValid || isSaving}
          className="shrink-0"
        >
          Save & New
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          onClick={() => props.onSave('close')}
          disabled={!props.isValid || isSaving}
          className="shrink-0"
        >
          Save & Close
        </Button>
      </div>
    ),
    [handleCancel, isSaving],
  );

  // ── Render ──
  const cfg = editorConfigs[contentType ?? 'spell'];
  if (!cfg) return null;

  const title = contentId ? `Edit ${cfg.label}` : `New ${cfg.label}`;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Text as="h1" variant="heading" className="mb-2">
          {title}
        </Text>
        <Text as="p" variant="body" className="text-muted-foreground">
          {packId && `Pack: ${packId}`}
          {isDirty && <span className="ml-2 text-warning">• Unsaved changes</span>}
        </Text>
      </div>

      {/* Paste-from-text import (spell only) */}
      {contentType === 'spell' && (
        <div className="mb-6">
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
            Import from Text
          </Button>

          {showPasteArea && (
            <div className="mt-3 p-4 rounded-lg border bg-muted/30 space-y-3">
              <Text as="p" variant="bodySm" className="text-muted-foreground">
                Paste spell text copied from 5e tools, D&D Beyond, or Roll20.
              </Text>
              <textarea
                className="w-full min-h-[200px] p-3 rounded-md border bg-background text-sm font-mono resize-y"
                placeholder="Paste spell text here..."
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
                  Parse & Fill Form
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
      )}

      <cfg.EditorComponent
        value={values[cfg.stateKey]}
        onChange={setters[cfg.stateKey]}
        onSubmit={async (_: unknown, intent?: string) => {
          const action = (intent as 'stay' | 'new' | 'close' | undefined) || 'stay';
          await cfg.saveFn(action);
          if (intent === 'close' && packId) {
            navigate(`/rulebook/packs/${packId}`);
          }
        }}
        onCancel={handleCancel}
        renderActions={renderContentActions}
        {...cfg.extraProps}
      />
    </div>
  );
}
