import { Button } from '@open20/ui';
import { ConcentrationToggleIcon } from '@open20/ui';

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
  return isIconStyle ? (
    <Button
      variant={isConcentrating ? 'warning' : 'ghost'}
      size="sm"
      onClick={onToggle}
      title={isConcentrating ? 'End Concentration' : 'Start Concentration'}
      className="p-1.5"
    >
      <ConcentrationToggleIcon size="xs" />
    </Button>
  ) : (
    <Button
      variant={isConcentrating ? 'warning' : 'ghost'}
      size="sm"
      onClick={onToggle}
      title={isConcentrating ? 'End Concentration' : 'Start Concentration'}
    >
      <ConcentrationToggleIcon size="sm" className={`mr-1.5 ${isConcentrating ? 'animate-pulse' : ''}`} />
      {isConcentrating ? 'Stop' : 'Concentrate'}
    </Button>
  );
}
