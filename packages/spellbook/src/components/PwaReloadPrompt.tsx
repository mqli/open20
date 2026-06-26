import { useRegisterSW } from 'virtual:pwa-register/react';
import { Surface, Button, Text, IconButton } from '@open20/ui';
import { RefreshCw, X } from 'lucide-react';

export function PwaReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Surface variant="primary" padding="md" shadow="lg" className="flex items-center gap-3">
        <RefreshCw className="h-4 w-4 text-primary-600" />
        <Text size="sm" weight="medium">
          New version available
        </Text>
        <Button variant="primary" size="sm" onClick={() => updateServiceWorker(true)}>
          Reload
        </Button>
        <IconButton
          variant="secondary"
          size="sm"
          onClick={() => setNeedRefresh(false)}
          className="text-text-tertiary"
        >
          <X />
        </IconButton>
      </Surface>
    </div>
  );
}
