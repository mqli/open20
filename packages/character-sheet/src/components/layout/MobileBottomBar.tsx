// MobileBottomBar.tsx
// Mobile bottom tab bar (56px height, fixed at bottom).
// 4 primary tabs: Combat | Skills | Spells | More
// "More" opens an inline dropdown menu for overflow sections:
// Abilities | Equipment | Features | Notes

import { useState, useRef, useEffect } from 'react';
import {
  Shield,
  ScrollText,
  WandSparkles,
  MoreHorizontal,
  Dumbbell,
  Package,
  Feather,
  FileText,
} from 'lucide-react';
import { cn } from '@open20/ui';
import type { SectionKey } from './Sidebar';

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
];

const OVERFLOW_SECTIONS: Array<{
  id: SectionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'abilities', label: 'Abilities', icon: Dumbbell },
  { id: 'equipment', label: 'Equipment', icon: Package },
  { id: 'features', label: 'Features', icon: Feather },
  { id: 'notes', label: 'Notes', icon: FileText },
];

const OVERFLOW_IDS: SectionKey[] = ['abilities', 'equipment', 'features', 'notes'];
const isOverflow = (section: SectionKey) => OVERFLOW_IDS.includes(section);

export function MobileBottomBar({
  activeSection,
  onSectionChange,
  className,
}: MobileBottomBarProps) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!moreOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        moreRef.current &&
        !moreRef.current.contains(e.target as Node)
      ) {
        setMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [moreOpen]);

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-30 flex items-center border-t border-border bg-bg-secondary lg:hidden',
        className,
      )}
      style={{ height: '56px' }}
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

      {/* More tab with dropdown */}
      <div className="relative flex flex-1">
        <button
          ref={moreRef}
          type="button"
          role="tab"
          aria-selected={isOverflow(activeSection)}
          aria-label="More sections"
          aria-expanded={moreOpen}
          aria-haspopup="menu"
          onClick={() => setMoreOpen((prev) => !prev)}
          className={cn(
            'relative flex w-full flex-col items-center justify-center gap-0.5 py-1',
            'transition-colors duration-150',
            isOverflow(activeSection)
              ? 'text-primary-400'
              : 'text-text-tertiary hover:text-text-secondary',
          )}
        >
          <MoreHorizontal className="h-5 w-5" />
          <span className="text-[10px] font-medium leading-none">More</span>
          {isOverflow(activeSection) && (
            <div className="absolute top-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary-400" />
          )}
        </button>

        {/* Dropdown menu */}
        {moreOpen && (
          <div
            ref={menuRef}
            role="menu"
            aria-label="More sections"
            className="absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-border bg-bg-secondary p-1 shadow-lg"
          >
            {OVERFLOW_SECTIONS.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onSectionChange(id);
                    setMoreOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium',
                    'transition-colors duration-150',
                    isActive
                      ? 'bg-primary-900/20 text-primary-400'
                      : 'text-text-secondary hover:bg-bg-tertiary',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
