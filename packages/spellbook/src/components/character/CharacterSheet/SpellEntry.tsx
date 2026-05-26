import { Badge, Button, RitualIcon, DefenseIcon } from '@open20/ui';
import { useSpellStore } from '@/stores/spell-store';
import { useSpellCapabilities } from '@/hooks/useSpellCapabilities';
import { SpellCardWrapper } from '@/components/spell/SpellCardWrapper';
import type { Spell } from '@/core/types';

interface SpellEntryProps {
  spell: Spell;
  alwaysPrepared: string[];
}

export function SpellEntry({
  spell, alwaysPrepared,
}: SpellEntryProps) {
  const isAlwaysPrepared = alwaysPrepared.includes(spell.id);
  const { isConcentratingOnThis } = useSpellCapabilities(spell);

  const selectSpell = useSpellStore(s => s.selectSpell);

  const handleOpenSpell = () => {
    selectSpell(spell);
  };

  const surfaceVariant = isConcentratingOnThis
    ? 'warning'
    : isAlwaysPrepared
      ? 'info'
      : 'default';

  return (
    <SpellCardWrapper
      spell={spell}
      density="compact"
      showDescription={false}
      surfaceVariant={surfaceVariant}
      glow={isAlwaysPrepared}
      showCastAction
      showDamageActions
      showConcentrationAction
      actionStyle="icon"
      renderBadges={() => (
        <>
          {isAlwaysPrepared && (
            <Badge variant="info" size="sm">
              <DefenseIcon size="xs" className="mr-1" />
              Always
            </Badge>
          )}
        </>
      )}
      renderActions={() => (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenSpell}
            title="Open Spell Details"
            className="p-1.5"
          >
            <RitualIcon size="xs" />
          </Button>
        </>
      )}
    />
  );
}
