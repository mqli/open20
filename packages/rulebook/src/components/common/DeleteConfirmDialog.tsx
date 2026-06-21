import { AlertTriangle } from 'lucide-react';
import { Button } from '@open20/ui';

export type ConfirmMode = 'delete-pack' | 'delete-content' | 'disable-pack' | 'discard-changes';

interface DeleteConfirmDialogContent {
  /** Names of items being deleted, shown in bullet list */
  items?: string[];
}

interface DeleteConfirmDialogProps {
  open: boolean;
  mode: ConfirmMode;
  /** Name of the pack being deleted/disabled */
  packName?: string;
  /** Content count by type, e.g. { Spells: 12, Monsters: 3 } */
  contentSummary?: Record<string, number>;
  content?: DeleteConfirmDialogContent;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function getDialogConfig(mode: ConfirmMode) {
  switch (mode) {
    case 'delete-pack':
      return {
        title: 'Delete Content Pack',
        confirmLabel: 'Delete',
        description: 'This action cannot be undone.',
        confirmDestructive: true as const,
      };
    case 'delete-content':
      return {
        title: 'Delete Content',
        confirmLabel: 'Delete',
        description: 'This action cannot be undone.',
        confirmDestructive: true as const,
      };
    case 'disable-pack':
      return {
        title: 'Disable Content Pack',
        confirmLabel: 'Disable',
        description:
          'This will temporarily hide all content from this pack in Browse and search results.',
        confirmDestructive: false as const,
      };
    case 'discard-changes':
      return {
        title: 'Discard Changes',
        confirmLabel: 'Discard',
        description: 'You have unsaved changes. Are you sure you want to discard them?',
        confirmDestructive: true as const,
      };
  }
}

export function DeleteConfirmDialog({
  open,
  mode,
  packName,
  contentSummary,
  content,
  loading = false,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  if (!open) return null;

  const config = getDialogConfig(mode);
  const items = content?.items ?? [];

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-bg-primary rounded-lg p-6 w-[420px] shadow-xl">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div
            className={`p-2 rounded-full shrink-0 ${config.confirmDestructive ? 'bg-red-100 dark:bg-red-900/20' : 'bg-amber-100 dark:bg-amber-900/20'}`}
          >
            <AlertTriangle
              className={`w-5 h-5 ${config.confirmDestructive ? 'text-destructive' : 'text-amber-600 dark:text-amber-400'}`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-text-primary">{config.title}</h2>
            {packName && (
              <p className="text-sm text-text-primary mt-1">
                {mode === 'delete-pack' && 'Are you sure you want to delete '}
                {mode === 'disable-pack' && 'Disable '}
                <span className="font-medium">&ldquo;{packName}&rdquo;</span>?
              </p>
            )}
          </div>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-muted rounded-md transition-colors shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="mb-6">
          {/* Items list */}
          {items.length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-text-secondary mb-2">
                You are about to delete {items.length} item{items.length !== 1 ? 's' : ''}:
              </p>
              <ul className="space-y-1">
                {items.slice(0, 5).map((name, i) => (
                  <li key={i} className="text-sm text-text-primary flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary shrink-0" />
                    {name}
                  </li>
                ))}
                {items.length > 5 && (
                  <li className="text-sm text-text-tertiary">+{items.length - 5} more</li>
                )}
              </ul>
            </div>
          )}

          {/* Content summary (for delete-pack / disable-pack) */}
          {contentSummary && Object.keys(contentSummary).length > 0 && (
            <div className="mb-3">
              <p className="text-sm text-text-secondary mb-1">
                {mode === 'delete-pack' ? 'This will permanently remove:' : 'Affected content:'}
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(contentSummary).map(([type, count]) =>
                  count > 0 ? (
                    <span
                      key={type}
                      className="px-2 py-0.5 text-xs bg-bg-secondary rounded border border-border"
                    >
                      {type}: {count}
                    </span>
                  ) : null,
                )}
              </div>
            </div>
          )}

          {/* Warning text */}
          <p
            className={`text-sm ${config.confirmDestructive ? 'text-destructive' : 'text-amber-600 dark:text-amber-400'}`}
          >
            ⚠ {config.description}
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={config.confirmDestructive ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? 'Processing...' : config.confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
