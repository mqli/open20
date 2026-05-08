import type { Attack } from '@/types/open20-core';
import { Button } from '@/components/ui';
import { Swords } from 'lucide-react';

interface WeaponRowProps {
  attack: Attack;
  onAttack?: () => void;
}

export function WeaponRow({ attack, onAttack }: WeaponRowProps) {
  const handleAttack = () => {
    const mod = attack.attackBonus >= 0 ? `+${attack.attackBonus}` : `${attack.attackBonus}`;
    const roll = `1d20${mod}`;
    navigator.clipboard.writeText(roll);
    if (onAttack) onAttack();
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-[--color-bg-elevated] rounded-lg border border-[--color-border] w-full">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-[--color-accent-gold] shrink-0" />
          <span className="font-medium text-sm truncate">{attack.name}</span>
        </div>
        {attack.mastery && (
          <span className="text-xs text-[--color-text-secondary] ml-6 line-clamp-1">
            {attack.mastery}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAttack}
          className="font-mono text-xs min-w-[44px] min-h-[36px]"
        >
          {attack.attackBonus >= 0 ? '+' : ''}{attack.attackBonus}
        </Button>

        <div className="text-right min-w-[60px]">
          <div className="text-sm font-semibold">{attack.damage}</div>
          <div className="text-xs text-[--color-text-secondary] truncate">{attack.damageType}</div>
        </div>
      </div>
    </div>
  );
}
