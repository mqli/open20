// LongRestDialog.tsx
// Confirmation dialog for Long Rest (wireframe §7.3).
// Presentational — receives open/onOpenChange/onConfirm props.

import { Heart, Zap, Shield, RefreshCw, EyeOff, AlertTriangle, CheckCheck } from 'lucide-react';
import { Dialog, Button, Text } from '@open20/ui';

export interface LongRestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const RECOVERY_ITEMS: Array<{ icon: React.ComponentType<{ className?: string }>; label: string }> =
  [
    { icon: Heart, label: 'Restore all HP to maximum' },
    { icon: CheckCheck, label: 'Recover all hit dice' },
    { icon: Zap, label: 'Recover all spell slots' },
    { icon: Shield, label: 'Reset death saving throws' },
    { icon: RefreshCw, label: 'Reset once-per-rest abilities' },
    { icon: AlertTriangle, label: 'Remove all conditions' },
    { icon: EyeOff, label: 'End concentration' },
  ];

export function LongRestDialog({ open, onOpenChange, onConfirm }: LongRestDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="sm">
        <Dialog.Header>
          <Dialog.Title>Long Rest</Dialog.Title>
          <Dialog.Description>
            Your character will gain the benefits of a long rest:
          </Dialog.Description>
        </Dialog.Header>

        <ul className="mb-6 space-y-2">
          {RECOVERY_ITEMS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-start gap-3 text-sm text-text-primary">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              <span>{label}</span>
            </li>
          ))}
        </ul>

        {/* NFR-01: long-rest-in-progress hint — inline warning for notable effects */}
        <Text variant="bodySm" color="secondary" className="mb-4">
          This cannot be undone during the current session. You must complete a long rest (8 hours
          of downtime) before you can take another one.
        </Text>

        <div className="flex justify-end gap-2">
          <Dialog.Close asChild>
            <Button variant="ghost">Cancel</Button>
          </Dialog.Close>
          <Button variant="primary" onClick={handleConfirm} aria-label="Confirm long rest">
            Long Rest
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  );
}
