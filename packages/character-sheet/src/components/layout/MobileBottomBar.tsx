// MobileBottomBar.tsx
// Mobile bottom tab bar (56px height, fixed at bottom).
// 4 primary tabs (Combat | Skills | Spells | Abilities) + a "More" tab that opens
// a bottom sheet for the low-frequency sections (Equipment | Features | Notes).
// Rest/LevelUp actions now live in the top sticky header (see AppShell).

import { useState } from 'react';
import {
  Shield,
  ScrollText,
  WandSparkles,
  MoreHorizontal,
  Dumbbell,
  Package,
  Feather,
  FileText,
  X,
} from 'lucide-react';
import { cn } from '@open20/ui';
import type { SectionKey } from './sections';

export interface MobileBottomBarProps {
  activeSection: SectionKey;
  onSectionChange: (section: SectionKey) => void;
  className?: string;
}

const PRIMARY_TABS: Array<{
  id: SectionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'combat', label: 'Combat', icon: Shield },
  { id: 'skills', label: 'Skills', icon: ScrollText },
  { id: 'spells', label: 'Spells', icon: WandSparkles },
  { id: 'abilities', label: 'Abilities', icon: Dumbbell },
];

const SECONDARY_SECTIONS: Array<{
  id: SectionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'equipment', label: 'Equipment', icon: Package },
  { id: 'features', label: 'Features', icon: Feather },
  { id: 'notes', label: 'Notes', icon: FileText },
];

const SECONDARY_IDS: SectionKey[] = ['equipment', 'features', 'notes'];
const isSecondary = (section: SectionKey) => SECONDARY_IDS.includes(section);

export function MobileBottomBar({
  activeSection,
  onSectionChange,
  className,
}: MobileBottomBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <nav
        className={cn(
          'sticky bottom-0 z-30 flex items-center border-t border-border bg-bg-secondary lg:hidden h-[56px]',
          className,
        )}
        role="tablist"
        aria-label="Character sheet navigation"
      >
        {PRIMARY_TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeSection === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={label}
              onClick={() => onSectionChange(id)}
              className={cn(
                'relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1',
                'transition-colors duration-150',
                isActive ? 'text-primary-400' : 'text-text-tertiary hover:text-text-secondary',
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium leading-none">{label}</span>
              {isActive && (
                <div className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary-400" />
              )}
            </button>
          );
        })}

        {/* More tab — opens bottom sheet for secondary sections */}
        <button
          type="button"
          role="tab"
          aria-selected={isSecondary(activeSection)}
          aria-label="More sections"
          aria-haspopup="dialog"
          aria-expanded={sheetOpen}
          onClick={() => setSheetOpen(true)}
          className={cn(
            'relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1',
            'transition-colors duration-150',
            isSecondary(activeSection)
              ? 'text-primary-400'
              : 'text-text-tertiary hover:text-text-secondary',
          )}
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-[10px] font-medium leading-none">More</span>
          {isSecondary(activeSection) && (
            <div className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary-400" />
          )}
        </button>
      </nav>

      {/* Bottom sheet for secondary sections */}
      {sheetOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="presentation">
          <div
            className="absolute inset-0 bg-black/50"
            aria-hidden="true"
            onClick={() => setSheetOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="More sections"
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-border bg-bg-secondary p-3 pb-6 shadow-2xl"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-bg-tertiary" />
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-text-primary">More Sections</span>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                aria-label="Close"
                className="flex h-9 w-9 items-center justify-center rounded-md text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {SECONDARY_SECTIONS.map(({ id, label, icon: Icon }) => {
                const isActive = activeSection === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      onSectionChange(id);
                      setSheetOpen(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium',
                      'transition-colors duration-150',
                      isActive
                        ? 'bg-primary-900/20 text-primary-400'
                        : 'text-text-secondary hover:bg-bg-tertiary',
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
