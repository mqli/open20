import { Surface } from '@/components/base/Surface/Surface';
import { Text } from '@/components/base/Text/Text';
import { Button } from '@/components/base/Button/Button';
import type { EditorLayoutProps } from './EditorLayout.types';

/**
 * Shared editor layout providing a two-column design:
 * - Left column: editor form content (children)
 * - Right column: optional preview card + action buttons
 *
 * Wraps everything in a `<form>` for native submit support.
 */
export function EditorLayout({
  children,
  preview,
  errors,
  className,
  onSubmit,
  onSave,
  onCancel,
  disabled = false,
  isSubmitting = false,
  isDirty = false,
  isValid = false,
  renderActions,
  previewLabel,
  cancelLabel = 'Cancel',
  saveLabel = 'Save',
  savingLabel = 'Saving...',
  isCreate: _isCreate = true,
}: EditorLayoutProps) {
  const saveText = isSubmitting ? savingLabel : saveLabel;

  return (
    <form onSubmit={onSubmit}>
      <div className={`lg:grid lg:grid-cols-[3fr_2fr] lg:gap-6 ${className ?? ''}`}>
        {/* ── Left Column: Editor ── */}
        <div className="flex min-h-0 flex-col">
          {children}

          {/* Form Errors */}
          {errors && Object.keys(errors).length > 0 && (
            <Surface variant="warning" padding="sm" className="mt-4 space-y-1">
              <Text as="p" variant="bodySm" className="text-danger">
                Please fix the following errors:
              </Text>
              {Object.entries(errors).map(([field, msg]) => (
                <Text key={field} as="p" variant="bodySm" className="ml-2 text-danger">
                  • {msg}
                </Text>
              ))}
            </Surface>
          )}
        </div>

        {/* ── Right Column: Preview ── */}
        <div className="lg:sticky lg:top-4 lg:self-start">
          {preview && (
            <>
              {previewLabel && (
                <Text as="h3" variant="labelSm" className="mb-3">
                  {previewLabel}
                </Text>
              )}
              {preview}
            </>
          )}

          {/* Action Buttons */}
          <div className={`border-t border-border bg-bg-primary pt-4 ${preview ? 'mt-4' : ''}`}>
            {renderActions ? (
              renderActions({ onSave, isDirty, isValid, isSubmitting })
            ) : (
              <div className="flex justify-end gap-2">
                {onCancel && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    disabled={isSubmitting || disabled}
                    className="shrink-0"
                  >
                    {cancelLabel}
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting || disabled}
                  className="shrink-0"
                >
                  {saveText}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
