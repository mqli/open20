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
  Users,
  Pencil,
  TrendingUp,
} from 'lucide-react';
import type { AppCharacter } from '@/types';
import { Tabs, Text, Button, cn } from '@open20/ui';
import { HeroCard } from './HeroCard';
import { RestActions } from './RestActions';
import type { SectionKey } from './sections';

export type { SectionKey, CollapsibleKey } from './sections';

export interface SidebarProps {
  character: AppCharacter;
  activeSection: SectionKey;
  onSectionChange: (section: SectionKey) => void;
  onOpenCharacterSelector: () => void;
  onEditCharacter: () => void;
  onLevelUp: () => void;
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
  onOpenCharacterSelector,
  onEditCharacter,
  onLevelUp,
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
      <div className="p-3 pb-0">
        <HeroCard character={character} />
      </div>

      {/* Character management triggers */}
      <div className="flex gap-1 px-3 pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-text-secondary hover:text-text-primary"
          onClick={onOpenCharacterSelector}
          aria-label="Manage characters"
        >
          <Users className="h-4 w-4" />
          <Text variant="bodySm">Characters</Text>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-text-secondary hover:text-text-primary"
          onClick={onEditCharacter}
          aria-label="Edit character"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </div>

      {/* Nav Tabs — vertical pills */}
      <div className="flex-1 px-3 py-2">
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
      <div className="border-t border-border p-3">
        <RestActions />
        <hr className="my-2 border-border" />
        <Button
          variant="primary"
          size="sm"
          className="w-full justify-start gap-2"
          onClick={onLevelUp}
          aria-label="Level up character"
          disabled={character.classes.reduce((sum, c) => sum + c.level, 0) >= 20}
        >
          <TrendingUp className="h-4 w-4" />
          Level Up
        </Button>
      </div>
    </aside>
  );
}
