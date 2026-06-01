import { Button } from '@open20/ui';
import { ConcentrationIcon } from '@open20/ui';
import { useTranslation } from '@/i18n';

interface ConcentrationToggleProps {
  isConcentrating: boolean;
  isIconStyle: boolean;
  onToggle: () => void;
}

export function ConcentrationToggle({
  isConcentrating,
  isIconStyle,
  onToggle,
}: ConcentrationToggleProps) {
  const t = useTranslation();
  return isIconStyle ? (
    <Button
      variant={isConcentrating ? 'warning' : 'ghost'}
      size="sm"
      onClick={onToggle}
      title={isConcentrating ? t('endConcentration') : t('startConcentration')}
      className="p-1.5"
    >
      <ConcentrationIcon size="xs" />
    </Button>
  ) : (
    <Button
      variant={isConcentrating ? 'warning' : 'ghost'}
      size="sm"
      onClick={onToggle}
      title={isConcentrating ? t('endConcentration') : t('startConcentration')}
    >
      <ConcentrationIcon size="sm" className={`mr-1.5 ${isConcentrating ? 'animate-pulse' : ''}`} />
      {isConcentrating ? t('stop') : t('concentrate')}
    </Button>
  );
}
