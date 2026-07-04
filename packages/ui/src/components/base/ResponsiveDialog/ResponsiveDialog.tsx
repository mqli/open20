import type { ReactNode } from 'react';
import { Dialog } from '../Dialog';
import { Sheet } from '../Sheet';
import { IconButton } from '../IconButton';
import { X } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Controls whether to render as a mobile Sheet or desktop Dialog */
  isMobile: boolean;
  /** Title text displayed in the header */
  title?: ReactNode;
  children: ReactNode;

  /** Mobile Sheet side direction (default 'bottom') */
  sheetSide?: 'right' | 'bottom';
  /** Extra className applied to mobile Sheet.Content */
  sheetClassName?: string;

  /** Desktop Dialog size (default 'md') */
  dialogSize?: 'sm' | 'md' | 'lg' | 'xl';
  /** Extra className applied to desktop Dialog.Content */
  dialogClassName?: string;

  /** Custom header override — replaces the default title + close button */
  renderHeader?: () => ReactNode;
  /** Custom footer rendered at the bottom */
  renderFooter?: () => ReactNode;

  /** Hide the default close button */
  hideClose?: boolean;
  /** Disable the close button */
  closeDisabled?: boolean;
}

const HEADER_CLASSES =
  'flex justify-between items-center shrink-0 px-4 py-3 sm:px-6 border-b border-border';
const TITLE_CLASSES = 'text-xl font-black text-text-primary';

export function ResponsiveDialog({
  open,
  onOpenChange,
  isMobile,
  title,
  children,
  sheetSide = 'bottom',
  sheetClassName,
  dialogSize = 'md',
  dialogClassName,
  renderHeader,
  renderFooter,
  hideClose = false,
  closeDisabled = false,
}: ResponsiveDialogProps) {
  const handleClose = () => onOpenChange(false);

  const header = renderHeader ? (
    renderHeader()
  ) : (
    <div className={HEADER_CLASSES}>
      <h2 className={TITLE_CLASSES}>{title}</h2>
      {!hideClose && (
        <IconButton size="sm" disabled={closeDisabled} onClick={handleClose}>
          <X className="w-4 h-4" />
        </IconButton>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <Sheet.Content side={sheetSide} className={cn(sheetClassName)}>
          {header}
          {children}
          {renderFooter?.()}
        </Sheet.Content>
      </Sheet>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size={dialogSize} className={cn('p-0 flex flex-col', dialogClassName)}>
        {header}
        {children}
        {renderFooter?.()}
      </Dialog.Content>
    </Dialog.Root>
  );
}
