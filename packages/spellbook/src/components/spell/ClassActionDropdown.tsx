import { BookMarked, ChevronDown, Star } from 'lucide-react';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
} from '@open20/ui';

interface ClassActionDropdownProps {
  matchingClassIds: string[];
  activeClassIds: string[];
  disabledActiveClassIds?: string[];
  label: string;
  onToggle: (classId: string) => void;
  variant?: 'info' | 'primary';
  active?: boolean;
}

export function ClassActionDropdown({
  matchingClassIds,
  activeClassIds,
  disabledActiveClassIds = [],
  label,
  onToggle,
  variant = 'info',
  active = false,
}: ClassActionDropdownProps) {
  const hasActive = activeClassIds.length > 0;
  const hasInactive = matchingClassIds.some((id) => !activeClassIds.includes(id));

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <IconButton
          variant={variant}
          active={active}
          title={hasActive ? `Manage ${label}` : `Add ${label}`}
        >
          {variant === 'info' ? (
            <BookMarked />
          ) : (
            <Star className={active ? 'fill-current' : ''} />
          )}
          <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        {hasActive && (
          <>
            <DropdownMenuLabel>{label} for</DropdownMenuLabel>
            {activeClassIds.map((classId) => (
              <DropdownMenuItem
                key={`remove-${classId}`}
                disabled={disabledActiveClassIds.includes(classId)}
                onSelect={() => onToggle(classId)}
              >
                <span className="flex-1">{classId}</span>
                <span className="text-text-tertiary text-xs ml-2">
                  {disabledActiveClassIds.includes(classId)
                    ? 'Always'
                    : label === 'Cantrip'
                      ? 'Unlearn'
                      : 'Unprepare'}
                </span>
              </DropdownMenuItem>
            ))}
            {hasInactive && <DropdownMenuSeparator />}
          </>
        )}
        {hasInactive && (
          <>
            {!hasActive && <DropdownMenuLabel>Add {label} for</DropdownMenuLabel>}
            {matchingClassIds
              .filter((classId) => !activeClassIds.includes(classId))
              .map((classId) => (
                <DropdownMenuItem
                  key={`add-${classId}`}
                  onSelect={() => onToggle(classId)}
                >
                  <span className="flex-1">{classId}</span>
                  <span className="text-text-tertiary text-xs ml-2">
                    {label === 'Cantrip' ? 'Learn' : 'Prepare'}
                  </span>
                </DropdownMenuItem>
              ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}
