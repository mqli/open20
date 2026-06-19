import { useState } from 'react';
import type { Spell } from 'open20-core';
import { Sheet, Button } from '@open20/ui';
import { X } from 'lucide-react';

interface InlineEditPanelProps {
  open: boolean;
  spell: Spell | null;
  onClose: () => void;
  onSave?: (spell: Spell, description: string, level: number) => void;
}

export function InlineEditPanel({ open, spell, onClose, onSave }: InlineEditPanelProps) {
  const [description, setDescription] = useState(spell?.description.join('\n') || '');
  const [level, setLevel] = useState(spell?.level || 0);

  // Reset form when spell changes
  if (spell && spell.id !== undefined) {
    // Only update if spell changed
    if (description === '' && spell.description) {
      setDescription(spell.description.join('\n'));
    }
    if (level !== spell.level) {
      setLevel(spell.level);
    }
  }

  const handleSave = () => {
    if (spell && onSave) {
      onSave(spell, description, level);
    }
  };

  if (!spell) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Sheet.Content side="right" className="w-96">
        <Sheet.Header className="flex items-center justify-between">
          <Sheet.Title>Edit: {spell.name}</Sheet.Title>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded-md transition-colors">
            <X className="w-4 h-4" />
          </button>
        </Sheet.Header>
        <Sheet.Body>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-bg-primary text-text-primary"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-text-secondary">Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(Number(e.target.value))}
                  className="w-full p-2 border border-border rounded-md bg-bg-primary text-text-primary"
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-text-secondary">School</label>
                <input
                  type="text"
                  value={spell.school}
                  readOnly
                  className="w-full p-2 border border-border rounded-md bg-muted/30 text-text-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-text-secondary">Classes</label>
              <div className="text-sm text-text-primary">{spell.classes?.join(', ') || '-'}</div>
            </div>

            <div className="pt-4 border-t border-border flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  console.log('Open full editor for', spell.id);
                  // TODO: Navigate to Task K editor route
                }}
              >
                Open Full Editor →
              </Button>
            </div>
          </div>
        </Sheet.Body>
      </Sheet.Content>
    </Sheet>
  );
}
