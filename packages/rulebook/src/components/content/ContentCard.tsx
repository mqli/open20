import { useState } from 'react';
import { Plus, BookOpen } from 'lucide-react';
import type { Spell } from 'open20-core';

interface ContentCardProps {
  spell: Spell;
  onViewDetail: (spell: Spell) => void;
  onAddToPack: (spell: Spell) => void;
}

export function ContentCard({ spell, onViewDetail, onAddToPack }: ContentCardProps) {
  const [showAddDropdown, setShowAddDropdown] = useState(false);

  // 获取描述摘要（取第一段，限制长度）
  const descriptionText = spell.description.join(' ');
  const descriptionSummary =
    descriptionText.length > 150 ? descriptionText.substring(0, 150) + '...' : descriptionText;

  return (
    <div
      className="border border-border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
      onClick={() => onViewDetail(spell)}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-sm">{spell.name}</h3>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <BookOpen className="w-3 h-3" />
          {spell.source}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-2">
        Lv{spell.level} · {spell.school}
      </p>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{descriptionSummary}</p>

      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowAddDropdown(!showAddDropdown);
          }}
          className="px-3 py-1 border border-border rounded-md text-xs hover:bg-muted transition-colors flex items-center gap-1"
        >
          <Plus className="w-3 h-3" />
          Add to
          <span className="ml-1">▼</span>
        </button>

        {showAddDropdown && (
          <div className="absolute bottom-full left-0 mb-2 bg-background border border-border rounded-md shadow-lg p-1 z-10 min-w-[150px]">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToPack(spell);
                setShowAddDropdown(false);
              }}
              className="block w-full text-left px-3 py-2 hover:bg-muted rounded-md text-xs"
            >
              📦 My Spells
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: 实现添加到 Campaign
                setShowAddDropdown(false);
              }}
              className="block w-full text-left px-3 py-2 hover:bg-muted rounded-md text-xs"
            >
              📦 Campaign
            </button>
            <hr className="my-1 border-border" />
            <button
              onClick={(e) => {
                e.stopPropagation();
                // TODO: 实现创建新包
                setShowAddDropdown(false);
              }}
              className="block w-full text-left px-3 py-2 hover:bg-muted rounded-md text-xs"
            >
              + New Pack...
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
