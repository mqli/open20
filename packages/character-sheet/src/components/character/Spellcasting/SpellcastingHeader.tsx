import { WandSparkles } from 'lucide-react';
import { getBestSpellAttackBonus } from 'open20-core';
import { Surface, Text } from '@open20/ui';
import type { AppCharacter } from '@/types';

export interface SpellcastingHeaderProps {
  character: AppCharacter;
  className?: string;
}

export function SpellcastingHeader({ character, className }: SpellcastingHeaderProps) {
  const firstClassData = Object.values(character.spells.classSpellcasting)[0];
  const spellSaveDC = firstClassData?.spellSaveDC ?? 0;
  const spellAttackBonus = getBestSpellAttackBonus(character);

  return (
    <Surface variant="default" padding="md" className={className}>
      <div className="flex items-center gap-2 mb-3">
        <WandSparkles className="h-5 w-5 text-primary-500 shrink-0" aria-hidden />
        <Text variant="label" weight="bold">
          Spellcasting
        </Text>
      </div>

      <div className="flex gap-3">
        <div className="flex-1 rounded-lg border border-border bg-bg-secondary p-3 text-center">
          <Text variant="labelSm" color="secondary" className="mb-1">
            Spell DC
          </Text>
          <Text variant="h3" className="text-primary-600 tabular-nums">
            {spellSaveDC}
          </Text>
        </div>
        <div className="flex-1 rounded-lg border border-border bg-bg-secondary p-3 text-center">
          <Text variant="labelSm" color="secondary" className="mb-1">
            Atk Bonus
          </Text>
          <Text variant="h3" className="text-primary-600 tabular-nums">
            +{spellAttackBonus}
          </Text>
        </div>
      </div>
    </Surface>
  );
}
