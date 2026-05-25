import type { Spell } from 'open20-core';
import { Badge } from '@/components/ui/Badge';
import { Text } from '@/components/ui/Text';
import { renderInlineMarkdown } from '@/utils/inline-markdown';

interface SpellContentProps {
  spell: Spell;
}

export function SpellContent({ spell }: SpellContentProps) {
  return (
    <>
      <div className="mb-6">
        <Text as="h2" className="text-2xl md:text-[26px] font-medium mb-2">
          {spell.name}
        </Text>
        <div className="flex gap-2">
          <Badge variant={spell.level === 0 ? 'secondary' : 'primary'}>
            {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}
          </Badge>
          <Badge variant="secondary">{spell.school}</Badge>
        </div>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
        {spell.description.map((paragraph, i) => (
          <Text key={i} variant="body" className="leading-relaxed mb-4 last:mb-0">
            {renderInlineMarkdown(paragraph)}
          </Text>
        ))}
      </div>

      {spell.level === 0 && spell.cantripUpgrade && (
        <div className="pl-4 border-l-4 border-accent mb-6 py-1">
          <Text size="sm" color="secondary" weight="medium" className="uppercase mb-2">Cantrip Upgrade</Text>
          {spell.cantripUpgrade.map((upgrade, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <Text size="sm" weight="medium" className="text-accent">
                At Character Level {upgrade.atCharacterLevel}:
              </Text>
              {upgrade.damage?.map((d, j) => (
                <Text key={j} variant="body" className="ml-2">
                  {d.dice} {d.type} damage
                </Text>
              ))}
            </div>
          ))}
        </div>
      )}

      {spell.usingAHigherLevelSpellSlot && (
        <div className="pl-4 border-l-4 border-primary-400 mb-6 py-1">
          <Text size="sm" color="secondary" weight="medium" className="uppercase mb-1">At Higher Levels</Text>
          {spell.usingAHigherLevelSpellSlot.map((paragraph, i) => (
            <Text key={i} variant="body" className="leading-relaxed mb-4 last:mb-0">
              {renderInlineMarkdown(paragraph)}
            </Text>
          ))}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-border">
        <Text size="sm" color="secondary" weight="medium" className="uppercase mb-2">Classes</Text>
        <div className="flex flex-wrap gap-2">
          {spell.classes?.map(c => (
            <Badge key={c} variant="secondary">{c}</Badge>
          ))}
        </div>
      </div>
    </>
  );
}
