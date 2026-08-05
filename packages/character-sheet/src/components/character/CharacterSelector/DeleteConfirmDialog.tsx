// DeleteConfirmDialog.tsx (T-122)
// Confirmation dialog for character deletion. Follows LongRestDialog pattern:
// presentational — receives open/onOpenChange/onConfirm props.

import { Dialog, Button } from '@open20/ui';

export interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  characterName: string;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  characterName,
}: DeleteConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="sm">
        <Dialog.Header>
          <Dialog.Title>Delete {characterName}?</Dialog.Title>
          <Dialog.Description>Are you sure? This cannot be undone.</Dialog.Description>
        </Dialog.Header>

        <div className="flex justify-end gap-2">
          <Dialog.Close asChild>
            <Button variant="ghost">Cancel</Button>
          </Dialog.Close>
          <Button variant="danger" onClick={handleConfirm} aria-label="Confirm deletion">
            Delete
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
