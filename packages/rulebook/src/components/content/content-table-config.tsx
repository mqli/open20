import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { BookOpen, Skull, User, ScrollText, Award, Swords, Shield, Backpack } from 'lucide-react';
import type { ContentTypeKey } from '../pack/pack-detail-types';

export interface ContentColumn {
  header: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (item: any) => ReactNode;
}

export interface ContentTableTypeConfig {
  icon: LucideIcon;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getName: (item: any) => string;
  columns: ContentColumn[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getSource: (item: any, sourceLabel?: string) => string;
}

export const TABLE_CONFIGS: Record<ContentTypeKey, ContentTableTypeConfig> = {
  spells: {
    icon: BookOpen,
    getName: (item) => item.name,
    columns: [
      {
        header: 'Level',
        render: (item) => item.level,
      },
      {
        header: 'School',
        render: (item) => item.school,
      },
      {
        header: 'Classes',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (item: any) => <span className="text-xs">{item.classes?.join(', ') || '-'}</span>,
      },
    ],
    getSource: (item) => item.source,
  },

  monsters: {
    icon: Skull,
    getName: (item) => item.name,
    columns: [
      {
        header: 'Type',
        render: (item) => item.type,
      },
      {
        header: 'Size',
        render: (item) => item.size,
      },
      {
        header: 'CR',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (item: any) => String(item.challengeRating.rating),
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSource: (item: any, sourceLabel?: string) => sourceLabel || item.source,
  },

  species: {
    icon: User,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getName: (item: any) => item.id,
    columns: [
      {
        header: 'Size',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (item: any) => item.size,
      },
      {
        header: 'Speed',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (item: any) => `${item.speed}ft`,
      },
      {
        header: 'Languages',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (item: any) => <span className="text-xs">{item.languages?.length || 0} langs</span>,
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSource: (item: any, sourceLabel?: string) => sourceLabel || item.source,
  },

  backgrounds: {
    icon: ScrollText,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getName: (item: any) => item.name || item.id,
    columns: [
      {
        header: 'Skill Proficiencies',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (item: any) => (
          <span className="text-xs">{item.skillProficiencies?.join(', ') || '-'}</span>
        ),
      },
      {
        header: 'Starting Gold',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (item: any) => `${item.startingGold}gp`,
      },
      {
        header: 'Origin Feat',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (item: any) => <span className="text-xs">{item.originFeatId}</span>,
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSource: (item: any, sourceLabel?: string) => sourceLabel || item.source,
  },

  feats: {
    icon: Award,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getName: (item: any) => item.name || item.id,
    columns: [
      {
        header: 'Category',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (item: any) => item.category,
      },
      {
        header: 'Prerequisites',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (item: any) => (item.prerequisites ? 'Yes' : '-'),
      },
      {
        header: 'Repeatable',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (item: any) => (
          <span className="text-xs">{item.repeatable ? 'Repeatable' : '-'}</span>
        ),
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSource: (item: any, sourceLabel?: string) => sourceLabel || item.source,
  },

  weapons: {
    icon: Swords,
    getName: (item) => item.name,
    columns: [
      {
        header: 'Category',
        render: (item) => item.category,
      },
      {
        header: 'Damage',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (item: any) =>
          `${item.damage.entries[0]?.dice ?? '?'} ${item.damage.entries[0]?.type ?? ''}`,
      },
      {
        header: 'Weight',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (item: any) => `${item.weight} lbs`,
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSource: (item: any, sourceLabel?: string) => sourceLabel || item.source,
  },

  armors: {
    icon: Shield,
    getName: (item) => item.name,
    columns: [
      {
        header: 'Category',
        render: (item) => item.category,
      },
      {
        header: 'AC',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (item: any) => `AC ${item.ac}`,
      },
      {
        header: 'Weight',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (item: any) => `${item.weight} lbs`,
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSource: (item: any, sourceLabel?: string) => sourceLabel || item.source,
  },

  gears: {
    icon: Backpack,
    getName: (item) => item.name,
    columns: [
      {
        header: 'Type',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (item: any) => (
          <span className="text-xs">{item.type === 'consumable' ? 'Consumable' : 'Gear'}</span>
        ),
      },
      {
        header: 'Cost',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (item: any) => (
          <span className="text-xs">
            {item.cost ? `${item.cost.quantity} ${item.cost.unit}` : '-'}
          </span>
        ),
      },
      {
        header: 'Weight',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        render: (item: any) => `${item.weight} lbs`,
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getSource: (item: any, sourceLabel?: string) => sourceLabel || item.source,
  },
};
