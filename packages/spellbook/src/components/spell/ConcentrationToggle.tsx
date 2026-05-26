import { Activity } from 'lucide-react';
import { Button } from '@open20/ui';

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
      <Activity className="w-3 h-3" />
    </Button>
  ) : (
    <Button
      variant={isConcentrating ? 'warning' : 'ghost'}
      size="sm"
      onClick={onToggle}
      title={isConcentrating ? 'End Concentration' : 'Start Concentration'}
    >
      <Activity className={`w-3.5 h-3.5 mr-1.5 ${isConcentrating ? 'animate-pulse' : ''}`} />
      {isConcentrating ? 'Stop' : 'Concentrate'}
    </Button>
  );
}
