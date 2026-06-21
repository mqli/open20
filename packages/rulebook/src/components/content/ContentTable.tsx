import { useState } from 'react';
import type { Spell, Monster, Species, Background, Feat, Weapon, Armor, Gear } from 'open20-core';
import {
  BookOpen,
  Skull,
  User,
  ScrollText,
  Award,
  Swords,
  Shield,
  Backpack,
  Pencil,
  Trash2,
} from 'lucide-react';

type TableMode =
  | 'spells'
  | 'monsters'
  | 'species'
  | 'backgrounds'
  | 'feats'
  | 'weapons'
  | 'armors'
  | 'gears';

interface ContentTableProps {
  spells?: Spell[];
  monsters?: Monster[];
  species?: Species[];
  backgrounds?: Background[];
  feats?: Feat[];
  weapons?: Weapon[];
  armors?: Armor[];
  gears?: Gear[];
  selectedIds: string[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleSelect: (id: string) => void;
  onSelectAll: (ids: string[]) => void;
  isReadOnly?: boolean;
  /** Source label for items that don't have their own source field (e.g., monsters from a pack) */
  sourceLabel?: string;
}

export function ContentTable({
  spells,
  monsters,
  species,
  backgrounds,
  feats,
  weapons,
  armors,
  gears,
  selectedIds,
  onEdit,
  onDelete,
  onToggleSelect,
  onSelectAll,
  isReadOnly = false,
  sourceLabel,
}: ContentTableProps) {
  const [selectAllChecked, setSelectAllChecked] = useState(false);

  /** Determine mode based on which prop is provided */
  let mode: TableMode = 'spells';
  if (monsters) mode = 'monsters';
  else if (species) mode = 'species';
  else if (backgrounds) mode = 'backgrounds';
  else if (feats) mode = 'feats';
  else if (weapons) mode = 'weapons';
  else if (armors) mode = 'armors';
  else if (gears) mode = 'gears';

  const items = (() => {
    switch (mode) {
      case 'monsters':
        return monsters ?? [];
      case 'species':
        return species ?? [];
      case 'backgrounds':
        return backgrounds ?? [];
      case 'feats':
        return feats ?? [];
      case 'weapons':
        return weapons ?? [];
      case 'armors':
        return armors ?? [];
      case 'gears':
        return gears ?? [];
      default:
        return spells ?? [];
    }
  })();

  const handleSelectAll = () => {
    if (selectAllChecked) {
      onSelectAll([]);
    } else {
      onSelectAll(items.map((item) => item.id));
    }
    setSelectAllChecked(!selectAllChecked);
  };

  const handleToggleSelect = (id: string) => {
    onToggleSelect(id);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left p-2">
              <input
                type="checkbox"
                checked={selectAllChecked}
                onChange={handleSelectAll}
                className="cursor-pointer"
              />
            </th>
            <th className="text-left p-2 text-text-secondary text-sm font-medium">Type</th>
            <th className="text-left p-2 text-text-secondary text-sm font-medium">Name</th>
            {mode === 'spells' && (
              <>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">Level</th>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">School</th>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">Classes</th>
              </>
            )}
            {mode === 'monsters' && (
              <>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">Type</th>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">Size</th>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">CR</th>
              </>
            )}
            {mode === 'weapons' && (
              <>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">Category</th>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">Damage</th>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">Weight</th>
              </>
            )}
            {mode === 'armors' && (
              <>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">Category</th>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">AC</th>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">Weight</th>
              </>
            )}
            {mode === 'gears' && (
              <>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">Type</th>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">Cost</th>
                <th className="text-left p-2 text-text-secondary text-sm font-medium">Weight</th>
              </>
            )}
            <th className="text-left p-2 text-text-secondary text-sm font-medium">Source</th>
            {(onEdit || onDelete) && !isReadOnly && (
              <th className="text-left p-2 text-text-secondary text-sm font-medium">Actions</th>
            )}
          </tr>
        </thead>
        <tbody>
          {mode === 'spells' &&
            spells?.map((spell) => (
              <tr
                key={spell.id}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(spell.id)}
                    onChange={() => handleToggleSelect(spell.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="p-2">
                  <BookOpen className="w-4 h-4 text-text-secondary" />
                </td>
                <td className="p-2 text-text-primary font-medium">{spell.name}</td>
                <td className="p-2 text-text-primary">{spell.level}</td>
                <td className="p-2 text-text-primary">{spell.school}</td>
                <td className="p-2 text-text-primary text-xs">
                  {spell.classes?.join(', ') || '-'}
                </td>
                <td className="p-2 text-text-primary text-xs">{spell.source}</td>
                {(onEdit || onDelete) && !isReadOnly && (
                  <td className="p-2">
                    <div className="flex gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(spell.id)}
                          className="p-1 hover:bg-muted rounded-md transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 text-text-secondary hover:text-text-primary" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(spell.id)}
                          className="p-1 hover:bg-muted rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-destructive hover:text-destructive/80" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          {mode === 'monsters' &&
            monsters?.map((monster) => (
              <tr
                key={monster.id}
                className="border-b border-border hover:bg-muted/50 transition-colors"
              >
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(monster.id)}
                    onChange={() => handleToggleSelect(monster.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="p-2">
                  <Skull className="w-4 h-4 text-text-secondary" />
                </td>
                <td className="p-2 text-text-primary font-medium">{monster.name}</td>
                <td className="p-2 text-text-primary">{monster.type}</td>
                <td className="p-2 text-text-primary">{monster.size}</td>
                <td className="p-2 text-text-primary">{String(monster.challengeRating.rating)}</td>
                <td className="p-2 text-text-primary text-xs">{sourceLabel || monster.source}</td>
                {(onEdit || onDelete) && !isReadOnly && (
                  <td className="p-2">
                    <div className="flex gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(monster.id)}
                          className="p-1 hover:bg-muted rounded-md transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4 text-text-secondary hover:text-text-primary" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(monster.id)}
                          className="p-1 hover:bg-muted rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-destructive hover:text-destructive/80" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          {mode === 'species' &&
            species?.map((s) => (
              <tr key={s.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s.id)}
                    onChange={() => handleToggleSelect(s.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="p-2">
                  <User className="w-4 h-4 text-text-secondary" />
                </td>
                <td className="p-2 text-text-primary font-medium">{s.id}</td>
                <td className="p-2 text-text-primary">{s.size}</td>
                <td className="p-2 text-text-primary">{s.speed}ft</td>
                <td className="p-2 text-text-primary text-xs">{s.languages?.length || 0} langs</td>
                <td className="p-2 text-text-primary text-xs">{sourceLabel || s.source}</td>
              </tr>
            ))}
          {mode === 'backgrounds' &&
            backgrounds?.map((b) => (
              <tr key={b.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(b.id)}
                    onChange={() => handleToggleSelect(b.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="p-2">
                  <ScrollText className="w-4 h-4 text-text-secondary" />
                </td>
                <td className="p-2 text-text-primary font-medium">{b.name || b.id}</td>
                <td className="p-2 text-text-primary text-xs">
                  {b.skillProficiencies?.join(', ') || '-'}
                </td>
                <td className="p-2 text-text-primary">{b.startingGold}gp</td>
                <td className="p-2 text-text-primary text-xs">{b.originFeatId}</td>
                <td className="p-2 text-text-primary text-xs">{sourceLabel || b.source}</td>
              </tr>
            ))}
          {mode === 'feats' &&
            feats?.map((f) => (
              <tr key={f.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(f.id)}
                    onChange={() => handleToggleSelect(f.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="p-2">
                  <Award className="w-4 h-4 text-text-secondary" />
                </td>
                <td className="p-2 text-text-primary font-medium">{f.name || f.id}</td>
                <td className="p-2 text-text-primary">{f.category}</td>
                <td className="p-2 text-text-primary">{f.prerequisites ? 'Yes' : '-'}</td>
                <td className="p-2 text-text-primary text-xs">
                  {f.repeatable ? 'Repeatable' : '-'}
                </td>
                <td className="p-2 text-text-primary text-xs">{sourceLabel || f.source}</td>
              </tr>
            ))}
          {mode === 'weapons' &&
            weapons?.map((w) => (
              <tr key={w.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(w.id)}
                    onChange={() => handleToggleSelect(w.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="p-2">
                  <Swords className="w-4 h-4 text-text-secondary" />
                </td>
                <td className="p-2 text-text-primary font-medium">{w.name}</td>
                <td className="p-2 text-text-primary">{w.category}</td>
                <td className="p-2 text-text-primary">
                  {w.damage.entries[0]?.dice ?? '?'} {w.damage.entries[0]?.type ?? ''}
                </td>
                <td className="p-2 text-text-primary">{w.weight} lbs</td>
                <td className="p-2 text-text-primary text-xs">{sourceLabel || w.source}</td>
              </tr>
            ))}
          {mode === 'armors' &&
            armors?.map((a) => (
              <tr key={a.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(a.id)}
                    onChange={() => handleToggleSelect(a.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="p-2">
                  <Shield className="w-4 h-4 text-text-secondary" />
                </td>
                <td className="p-2 text-text-primary font-medium">{a.name}</td>
                <td className="p-2 text-text-primary">{a.category}</td>
                <td className="p-2 text-text-primary">AC {a.ac}</td>
                <td className="p-2 text-text-primary">{a.weight} lbs</td>
                <td className="p-2 text-text-primary text-xs">{sourceLabel || a.source}</td>
              </tr>
            ))}
          {mode === 'gears' &&
            gears?.map((g) => (
              <tr key={g.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(g.id)}
                    onChange={() => handleToggleSelect(g.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="p-2">
                  <Backpack className="w-4 h-4 text-text-secondary" />
                </td>
                <td className="p-2 text-text-primary font-medium">{g.name}</td>
                <td className="p-2 text-text-primary text-xs">
                  {g.type === 'consumable' ? 'Consumable' : 'Gear'}
                </td>
                <td className="p-2 text-text-primary text-xs">{g.cost || '-'}</td>
                <td className="p-2 text-text-primary">{g.weight} lbs</td>
                <td className="p-2 text-text-primary text-xs">{sourceLabel || g.source}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
