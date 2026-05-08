import type { Resource } from '@/types/open20-core';

interface ResourceTrackerProps {
  resource: Resource;
  onUse: () => void;
  onRecover: () => void;
}

export function ResourceTracker({ resource, onUse, onRecover }: ResourceTrackerProps) {
  const remaining = resource.max - resource.used;

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium truncate flex-1 mr-2">{resource.id}</span>
      <div className="flex gap-1.5">
        {Array.from({ length: resource.max }, (_, i) => i < remaining).map((filled, idx) => (
          <button
            key={idx}
            onClick={filled ? onUse : onRecover}
            className={`w-8 h-8 rounded-full border-2 transition-resource touch-target ${
              filled
                ? 'bg-[--color-accent-gold] border-[--color-accent-gold]'
                : 'bg-transparent border-[--color-border] hover:border-[--color-text-muted]'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
