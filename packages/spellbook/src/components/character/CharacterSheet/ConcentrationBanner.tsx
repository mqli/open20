import { spellService } from '@/core/spell-service';
import { Surface, Text, ConcentrationIcon } from '@open20/ui';
import { useTranslation } from '@/i18n';

interface ConcentrationBannerProps {
  concentratingSpellId: string;
}

export function ConcentrationBanner({ concentratingSpellId }: ConcentrationBannerProps) {
  const t = useTranslation();
  const spellName =
    spellService.getSpell(concentratingSpellId)?.name ?? concentratingSpellId.replace(/-/g, ' ');

  return (
    <Surface
      variant="tint"
      padding="md"
      className="bg-amber-500/10 border-amber-500/25 flex items-center gap-3"
    >
      <Surface variant="ghost" padding="xs" className="bg-amber-500/15 text-amber-500 shrink-0">
        <ConcentrationIcon size="md" />
      </Surface>
      <div className="min-w-0">
        <Text variant="label" className="text-amber-600">
          {t('concentrationBanner')}
        </Text>
        <Text weight="bold" className="truncate">
          {spellName}
        </Text>
      </div>
    </Surface>
  );
}
