import { Badge, Button, RitualIcon, DefenseIcon } from '@open20/ui';
import { useSpellStore } from '@/stores/spellStore';
import { useSpellCapabilities } from '@/hooks/useSpellCapabilities';
import { SpellCard } from '@/components/spell/SpellCard';
import { SpellCardBadges } from '@/components/spell/SpellCardBadges';
import { SpellCardActions } from '@/components/spell/SpellCardActions';
import type { Spell } from '@/core/types';
import { useTranslation } from '@/i18n';

interface SpellEntryProps {
  spell: Spell;
  alwaysPrepared: string[];
}

export function SpellEntry({ spell, alwaysPrepared }: SpellEntryProps) {
  const t = useTranslation();
  const isAlwaysPrepared = alwaysPrepared.includes(spell.id);
  const { isConcentratingOnThis } = useSpellCapabilities(spell);

  const selectSpell = useSpellStore((s) => s.selectSpell);

  const handleOpenSpell = () => {
    selectSpell(spell);
  };

  const surfaceVariant = isConcentratingOnThis ? 'warning' : isAlwaysPrepared ? 'info' : 'default';

  return (
    <SpellCard
      spell={spell}
      density="compact"
      showDescription={false}
      surfaceVariant={surfaceVariant}
      glow={isAlwaysPrepared}
      renderBadges={() => (
        <SpellCardBadges
          spell={spell}
          renderBadges={() => (
            <>
              {isAlwaysPrepared && (
                <Badge variant="info" size="sm">
                  <DefenseIcon size="xs" className="mr-1" />
                  {t('alwaysPrepared')}
                </Badge>
              )}
            </>
          )}
        />
      )}
      renderActions={() => (
        <>
          <SpellCardActions
            spell={spell}
            showCast
            showDamage
            showConcentration
            actionStyle="icon"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenSpell}
            title={t('manageSpell')}
            className="p-1.5"
          >
            <RitualIcon size="xs" />
          </Button>
        </>
      )}
    />
  );
}
