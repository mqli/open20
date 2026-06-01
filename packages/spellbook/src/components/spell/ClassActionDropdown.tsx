import { ChevronDown } from 'lucide-react';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  IconButton,
  PrepareSpellIcon,
} from '@open20/ui';
import { useTranslation } from '@/i18n';

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
  const t = useTranslation();
  const hasActive = activeClassIds.length > 0;
  const hasInactive = matchingClassIds.some((id) => !activeClassIds.includes(id));

  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>
        <IconButton
          variant={variant}
          active={active}
          title={hasActive ? t('manageSpell') : t('addSpell')}
        >
          <PrepareSpellIcon />
          <ChevronDown className="w-2.5 h-2.5 ml-0.5" />
        </IconButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40">
        {hasActive && (
          <>
            <DropdownMenuLabel>{t('forLabel', { label })}</DropdownMenuLabel>
            {activeClassIds.map((classId) => (
              <DropdownMenuItem
                key={`remove-${classId}`}
                disabled={disabledActiveClassIds.includes(classId)}
                onSelect={() => onToggle(classId)}
              >
                <span className="flex-1">{classId}</span>
                <span className="text-text-tertiary text-xs ml-2">
                  {disabledActiveClassIds.includes(classId)
                    ? t('alwaysPrepared')
                    : label === t('cantrip')
                      ? t('unlearn')
                      : t('unprepare')}
                </span>
              </DropdownMenuItem>
            ))}
            {hasInactive && <DropdownMenuSeparator />}
          </>
        )}
        {hasInactive && (
          <>
            {!hasActive && <DropdownMenuLabel>{t('addForLabel', { label })}</DropdownMenuLabel>}
            {matchingClassIds
              .filter((classId) => !activeClassIds.includes(classId))
              .map((classId) => (
                <DropdownMenuItem key={`add-${classId}`} onSelect={() => onToggle(classId)}>
                  <span className="flex-1">{classId}</span>
                  <span className="text-text-tertiary text-xs ml-2">
                    {label === t('cantrip') ? t('learn') : t('prepare')}
                  </span>
                </DropdownMenuItem>
              ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenuRoot>
  );
}
