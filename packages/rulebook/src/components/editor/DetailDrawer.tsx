import { X, BookOpen, Zap, Clock } from 'lucide-react';
import type { Spell } from 'open20-core';

interface DetailDrawerProps {
  spell: Spell;
  onClose: () => void;
  onAddToPack: (spell: Spell) => void;
}

export function DetailDrawer({ spell, onClose, onAddToPack }: DetailDrawerProps) {
  const levelLabel =
    spell.level === 0 ? 'Cantrip' : `${spell.level}${getOrdinalSuffix(spell.level)}`;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border shadow-lg p-6 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-semibold text-lg">{spell.name}</h2>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded-md transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 法术信息 */}
      <div className="mb-6 space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Level:</span>
          <span className="text-muted-foreground">{levelLabel}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">School:</span>
          <span className="text-muted-foreground">{spell.school}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <BookOpen className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Source: {spell.source}</span>
        </div>

        {/* 法术属性 */}
        <div className="flex flex-wrap gap-3 pt-3 border-t border-border">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{spell.castingTime}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Range: {spell.range}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span>Duration: {spell.duration}</span>
          </div>
          {spell.concentration && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <Zap className="w-3 h-3" />
              <span>Concentration</span>
            </div>
          )}
          {spell.ritual && (
            <div className="flex items-center gap-1 text-xs text-purple-600">
              <span>Ritual</span>
            </div>
          )}
        </div>

        {/* 成分 */}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">Components:</span>
          <span className="text-muted-foreground">{spell.components.join(', ')}</span>
        </div>

        {/* 职业 */}
        {spell.classes && spell.classes.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">Classes:</span>
            <span className="text-muted-foreground">{spell.classes.join(', ')}</span>
          </div>
        )}
      </div>

      {/* 描述 */}
      <div className="mb-6">
        <h3 className="font-medium text-sm mb-2">Description</h3>
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          {spell.description.map((paragraph, index) => (
            <p key={index} className="text-sm text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* 升环施法 */}
      {spell.usingAHigherLevelSpellSlot && spell.usingAHigherLevelSpellSlot.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium text-sm mb-2">At Higher Levels</h3>
          <div className="bg-muted/50 p-4 rounded-lg space-y-2">
            {spell.usingAHigherLevelSpellSlot.map((text, index) => (
              <p key={index} className="text-sm text-muted-foreground">
                {text}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => onAddToPack(spell)}
          className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
        >
          Add to My Pack
        </button>
      </div>

      {/* 只读模式指示 */}
      <div className="mt-4 p-3 bg-muted/30 rounded-md">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          Read-only content from {spell.source}
        </p>
      </div>
    </div>
  );
}

function getOrdinalSuffix(num: number): string {
  if (num === 1) return 'st';
  if (num === 2) return 'nd';
  if (num === 3) return 'rd';
  return 'th';
}
