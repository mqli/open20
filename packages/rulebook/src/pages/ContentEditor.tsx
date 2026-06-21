import { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  SpellEditor,
  MonsterEditor,
  SpeciesEditor,
  BackgroundEditor,
  FeatEditor,
  Button,
  Text,
} from '@open20/ui';
import { useContentEditorStore } from '../stores/contentEditorStore';
import { parsePlainText, transformSpell } from '@open20/content/parser';
import { ClipboardPaste } from 'lucide-react';

export function ContentEditor() {
  const { packId, contentType, contentId } = useParams<{
    packId: string;
    contentType: string;
    contentId?: string;
  }>();
  const navigate = useNavigate();

  const {
    isDirty,
    isSaving,
    setParams,
    setSpell,
    setMonster,
    setSpecies,
    setBackground,
    setFeat,
    saveSpell,
    saveMonster,
    saveSpecies,
    saveBackground,
    saveFeat,
    loadSpell,
    loadMonster,
    loadSpecies,
    loadBackground,
    loadFeat,
  } = useContentEditorStore();
  const spell = useContentEditorStore((state) => state.spell);
  const monster = useContentEditorStore((state) => state.monster);
  const species = useContentEditorStore((state) => state.species);
  const background = useContentEditorStore((state) => state.background);
  const feat = useContentEditorStore((state) => state.feat);

  // Paste-from-text state (spells only)
  const [showPasteArea, setShowPasteArea] = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);

  // Parse pasted text and populate the form
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

  // Initialize params and load content if editing
  useEffect(() => {
    if (packId && contentType) {
      setParams(packId, contentType, contentId);
      if (contentId) {
        if (contentType === 'monster') {
          loadMonster(packId, contentId);
        } else if (contentType === 'species') {
          loadSpecies(packId, contentId);
        } else if (contentType === 'background') {
          loadBackground(packId, contentId);
        } else if (contentType === 'feat') {
          loadFeat(packId, contentId);
        } else {
          loadSpell(packId, contentId);
        }
      }
    }
  }, [
    packId,
    contentType,
    contentId,
    setParams,
    loadSpell,
    loadMonster,
    loadSpecies,
    loadBackground,
    loadFeat,
  ]);

  // Unsaved changes protection - beforeunload event
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

  // Navigation guard
  const navigateWithGuard = useCallback(
    (to: string) => {
      if (isDirty) {
        if (!window.confirm('You have unsaved changes. Leave anyway?')) {
          return;
        }
      }
      navigate(to);
    },
    [isDirty, navigate],
  );

  // Handle cancel
  const handleCancel = () => {
    if (packId) {
      navigateWithGuard(`/rulebook/packs/${packId}`);
    } else {
      navigateWithGuard('/rulebook');
    }
  };

  // Shared action buttons for all editors
  const renderContentActions = (props: {
    onSave: (intent: 'stay' | 'new' | 'close') => void;
    isValid: boolean;
    isSubmitting: boolean;
  }) => (
    <div className="flex items-center justify-end gap-2">
      <Button type="button" variant="ghost" size="lg" onClick={handleCancel} disabled={isSaving}>
        Cancel
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        onClick={() => props.onSave('stay')}
        disabled={!props.isValid || isSaving}
      >
        Save
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        onClick={() => props.onSave('new')}
        disabled={!props.isValid || isSaving}
      >
        Save & New
      </Button>
      <Button
        type="button"
        variant="primary"
        size="lg"
        onClick={() => props.onSave('close')}
        disabled={!props.isValid || isSaving}
      >
        Save & Close
      </Button>
    </div>
  );

  // ── Monster Editor ──
  if (contentType === 'monster') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Text as="h1" variant="heading" className="mb-2">
            {contentId ? 'Edit Monster' : 'New Monster'}
          </Text>
          <Text as="p" variant="body" className="text-muted-foreground">
            {packId && `Pack: ${packId}`}
            {isDirty && <span className="ml-2 text-warning">• Unsaved changes</span>}
          </Text>
        </div>

        <MonsterEditor
          value={monster}
          onChange={(updatedMonster) => setMonster(updatedMonster)}
          onSubmit={(_, intent) => {
            saveMonster(intent || 'stay');
            if (intent === 'close' && packId) {
              navigate(`/rulebook/packs/${packId}`);
            }
          }}
          onCancel={handleCancel}
          renderActions={renderContentActions}
          mode="simple"
          showPreview
        />
      </div>
    );
  }

  // ── Species Editor ──
  if (contentType === 'species') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Text as="h1" variant="heading" className="mb-2">
            {contentId ? 'Edit Species' : 'New Species'}
          </Text>
          <Text as="p" variant="body" className="text-muted-foreground">
            {packId && `Pack: ${packId}`}
            {isDirty && <span className="ml-2 text-warning">• Unsaved changes</span>}
          </Text>
        </div>
        <SpeciesEditor
          value={species}
          onChange={(updatedSpecies) => setSpecies(updatedSpecies)}
          onSubmit={(_, intent) => {
            saveSpecies(intent || 'stay');
            if (intent === 'close' && packId) {
              navigate(`/rulebook/packs/${packId}`);
            }
          }}
          onCancel={handleCancel}
          renderActions={renderContentActions}
        />
      </div>
    );
  }

  // ── Background Editor ──
  if (contentType === 'background') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Text as="h1" variant="heading" className="mb-2">
            {contentId ? 'Edit Background' : 'New Background'}
          </Text>
          <Text as="p" variant="body" className="text-muted-foreground">
            {packId && `Pack: ${packId}`}
            {isDirty && <span className="ml-2 text-warning">• Unsaved changes</span>}
          </Text>
        </div>
        <BackgroundEditor
          value={background}
          onChange={(updatedBg) => setBackground(updatedBg)}
          onSubmit={(_, intent) => {
            saveBackground(intent || 'stay');
            if (intent === 'close' && packId) {
              navigate(`/rulebook/packs/${packId}`);
            }
          }}
          onCancel={handleCancel}
          renderActions={renderContentActions}
        />
      </div>
    );
  }

  // ── Feat Editor ──
  if (contentType === 'feat') {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <Text as="h1" variant="heading" className="mb-2">
            {contentId ? 'Edit Feat' : 'New Feat'}
          </Text>
          <Text as="p" variant="body" className="text-muted-foreground">
            {packId && `Pack: ${packId}`}
            {isDirty && <span className="ml-2 text-warning">• Unsaved changes</span>}
          </Text>
        </div>
        <FeatEditor
          value={feat}
          onChange={(updatedFeat) => setFeat(updatedFeat)}
          onSubmit={(_, intent) => {
            saveFeat(intent || 'stay');
            if (intent === 'close' && packId) {
              navigate(`/rulebook/packs/${packId}`);
            }
          }}
          onCancel={handleCancel}
          renderActions={renderContentActions}
        />
      </div>
    );
  }

  // ── Spell Editor (default) ──
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <Text as="h1" variant="heading" className="mb-2">
          {contentId ? 'Edit Spell' : 'New Spell'}
        </Text>
        <Text as="p" variant="body" className="text-muted-foreground">
          {packId && `Pack: ${packId}`}
          {isDirty && <span className="ml-2 text-warning">• Unsaved changes</span>}
        </Text>
      </div>

      {/* Paste-from-text import area */}
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

      <SpellEditor
        value={spell}
        onChange={(updatedSpell) => setSpell(updatedSpell)}
        onSubmit={(_, intent) => {
          saveSpell(intent || 'stay');
          if (intent === 'close' && packId) {
            navigate(`/rulebook/packs/${packId}`);
          }
        }}
        onCancel={handleCancel}
        renderActions={renderContentActions}
      />
    </div>
  );
}
