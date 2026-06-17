import { useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SpellEditor, Button, Text } from '@open20/ui';
import { useContentEditorStore } from '../stores/contentEditorStore';

export function ContentEditor() {
  const { packId, contentType, contentId } = useParams<{
    packId: string;
    contentType: string;
    contentId?: string;
  }>();
  const navigate = useNavigate();

  const {
    isDirty,
    isPreviewOpen,
    isSaving,
    setParams,
    setSpell,
    togglePreview,
    saveSpell,
    loadSpell,
  } = useContentEditorStore();
  const spell = useContentEditorStore((state) => state.spell);

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
    isDirty: boolean;
    isValid: boolean;
    isSubmitting: boolean;
  }) => (
    <div className="flex justify-between items-center pt-4 border-t border-border">
      <Button type="button" variant="ghost" size="lg" onClick={togglePreview}>
        {isPreviewOpen ? 'Hide Preview' : 'Show Preview'}
      </Button>
      <div className="flex gap-2">
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
    </div>
  );

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

      <SpellEditor
        value={spell}
        onChange={(updatedSpell) => setSpell(updatedSpell)}
        onSubmit={(_, intent) => handleSave(intent || 'stay')}
        onCancel={handleCancel}
        showPreview={isPreviewOpen}
        renderActions={renderActions}
      />
    </div>
  );
}
