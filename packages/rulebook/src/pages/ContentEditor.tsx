import { useEffect, useCallback, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SpellEditor, Button, Text } from '@open20/ui';
import { useContentEditorStore } from '../stores/contentEditorStore';
import { parsePlainText, transformSpell } from '@open20/content/parser';
import { ClipboardPaste, Skull, User } from 'lucide-react';

export function ContentEditor() {
  const { packId, contentType, contentId } = useParams<{
    packId: string;
    contentType: string;
    contentId?: string;
  }>();
  const navigate = useNavigate();

  const { isDirty, isSaving, setParams, setSpell, saveSpell, loadSpell } = useContentEditorStore();
  const spell = useContentEditorStore((state) => state.spell);

  // Paste-from-text state
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

  // Initialize params and load spell if editing
  useEffect(() => {
    if (packId && contentType) {
      setParams(packId, contentType, contentId);
      if (contentId) {
        loadSpell(packId, contentId);
      }
    }
  }, [packId, contentType, contentId, setParams, loadSpell]);

  // Unsaved changes protection - beforeunload event (for page refresh/close)
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

  // Navigation guard for in-app navigation (works with BrowserRouter)
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

  // Handle save intents
  const handleSave = async (intent: 'stay' | 'new' | 'close') => {
    await saveSpell(intent);
    if (intent === 'close' && packId) {
      navigate(`/rulebook/packs/${packId}`);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (packId) {
      navigateWithGuard(`/rulebook/packs/${packId}`);
    } else {
      navigateWithGuard('/rulebook');
    }
  };

  // Custom action buttons for SpellEditor
  const renderActions = (props: {
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

  // ── Multi-type placeholder renderers ──
  const renderComingSoon = (icon: React.ReactNode, typeName: string) => (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="p-4 rounded-full bg-bg-secondary mb-4">{icon}</div>
      <Text as="h2" variant="heading" className="mb-2">
        {contentId ? `Edit ${typeName}` : `New ${typeName}`}
      </Text>
      <Text as="p" variant="body" className="text-muted-foreground mb-6 max-w-md">
        The {typeName.toLowerCase()} editor is coming in a future update. For now, you can add{' '}
        {typeName.toLowerCase()} data via JSON import.
      </Text>
      <Button variant="outline" onClick={handleCancel}>
        Back to Pack
      </Button>
    </div>
  );

  if (contentType === 'monster') {
    return renderComingSoon(<Skull className="w-8 h-8 text-text-tertiary" />, 'Monster');
  }

  if (contentType === 'species') {
    return renderComingSoon(<User className="w-8 h-8 text-text-tertiary" />, 'Species');
  }

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
        onSubmit={(_, intent) => handleSave(intent || 'stay')}
        onCancel={handleCancel}
        renderActions={renderActions}
      />
    </div>
  );
}
