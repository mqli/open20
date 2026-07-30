// Sidebar.tsx
// Desktop sidebar (250px fixed width). Integrates:
// - HeroCard (sticky top)
// - Vertical nav Tabs using @open20/ui Tabs (variant="pills")
// - RestActions (sticky bottom)
//
// Nav uses its own internal Tabs state to track selected section.
// The parent ContentArea reads the same section key for rendering.

import {
  Shield,
  Dumbbell,
  ScrollText,
  WandSparkles,
  Package,
  Feather,
  FileText,
} from 'lucide-react';
import type { AppCharacter } from '@/types';
import { Tabs, Text, cn } from '@open20/ui';
import { HeroCard } from './HeroCard';
import { RestActions } from './RestActions';

export type SectionKey =
  | 'combat'
  | 'abilities'
  | 'skills'
  | 'spells'
  | 'equipment'
  | 'features'
  | 'notes';

export interface SidebarProps {
  character: AppCharacter;
  activeSection: SectionKey;
  onSectionChange: (section: SectionKey) => void;
  onShortRest?: () => void;
  onLongRest?: () => void;
  className?: string;
}

const NAV_ITEMS: Array<{
  id: SectionKey;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'combat', label: 'Combat', icon: Shield },
  { id: 'abilities', label: 'Abilities', icon: Dumbbell },
  { id: 'skills', label: 'Skills', icon: ScrollText },
  { id: 'spells', label: 'Spells', icon: WandSparkles },
  { id: 'equipment', label: 'Equipment', icon: Package },
  { id: 'features', label: 'Features', icon: Feather },
  { id: 'notes', label: 'Notes', icon: FileText },
];

export function Sidebar({
  character,
  activeSection,
  onSectionChange,
  onShortRest,
  onLongRest,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        'hidden h-screen w-[250px] shrink-0 flex-col overflow-y-auto border-r border-border bg-bg-secondary lg:flex',
        className,
      )}
    >
      {/* Hero Card — sticky top */}
      <div className="p-4 pb-0">
        <HeroCard character={character} />
      </div>

      {/* Nav Tabs — vertical pills */}
      <div className="flex-1 p-4">
        <Text variant="labelSm" color="secondary" className="mb-2 uppercase tracking-wide">
          Navigation
        </Text>
        <Tabs.Root
          value={activeSection}
          onValueChange={(v) => onSectionChange(v as SectionKey)}
          orientation="vertical"
          className="w-full"
        >
          <Tabs.List className="flex w-full flex-col gap-1" variant="pills">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <Tabs.Trigger
                key={id}
                value={id}
                className="inline-flex w-full items-center justify-start gap-2 px-3 py-2 text-sm font-medium"
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>
      </div>

      {/* Rest Actions — sticky bottom */}
      <div className="border-t border-border p-4">
        <RestActions onShortRest={onShortRest} onLongRest={onLongRest} />
      </div>
    </aside>
  );
}
