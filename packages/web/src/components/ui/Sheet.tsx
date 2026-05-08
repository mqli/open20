import * as React from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface SheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="fixed bottom-0 left-0 right-0 bg-[--color-bg-surface] rounded-t-xl border-t border-[--color-border] shadow-xl transition-sheet max-h-[85vh] overflow-auto">
        {children}
      </div>
    </div>
  );
}

interface SheetHeaderProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export function SheetHeader({ children, onClose }: SheetHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[--color-border]">
      <div>{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-[--color-bg-elevated] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}

interface SheetContentProps {
  children: React.ReactNode;
  className?: string;
}

export function SheetContent({ children, className }: SheetContentProps) {
  return <div className={cn('p-4', className)}>{children}</div>;
}
