import type { SkillEntry } from '@/types/open20-core';
import { cn } from '@/lib/utils';

interface SkillBadgeProps {
  skillName: string;
  skill: SkillEntry;
  modifier: number;
  onClick?: () => void;
}

export function SkillBadge({ skillName, skill, modifier, onClick }: SkillBadgeProps) {
  const handleClick = () => {
    const mod = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    const roll = `1d20${mod}`;
    navigator.clipboard.writeText(roll);
    if (onClick) onClick();
  };

  // Format skill name for display (e.g., "AnimalHandling" -> "Animal Handling")
  const formatSkillName = (name: string) => {
    return name.replace(/([a-z])([A-Z])/g, '$1 $2');
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'relative px-3 py-1.5 rounded-full text-xs font-medium transition-condition',
        'border flex items-center gap-1.5 min-h-[32px]',
        skill.expertise
          ? 'bg-[--color-accent-gold]/20 text-[--color-accent-gold] border-[--color-accent-gold]/30'
          : skill.proficient
            ? 'bg-[--color-accent-blue]/20 text-[--color-accent-blue] border-[--color-accent-blue]/30'
            : 'bg-[--color-bg-elevated] text-[--color-text-secondary] border-[--color-border] hover:bg-[--color-bg-surface]'
      )}
    >
      {skill.expertise && (
        <span className="text-[10px]">★★</span>
      )}
      {!skill.expertise && skill.proficient && (
        <span className="text-[10px]">★</span>
      )}
      <span>{formatSkillName(skillName)}</span>
      <span className="font-mono">
        {modifier >= 0 ? '+' : ''}{modifier}
      </span>
    </button>
  );
}
