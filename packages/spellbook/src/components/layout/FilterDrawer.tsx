import { useState } from 'react';
import { Button, Sheet, Surface, Text } from '@open20/ui';
import { SlidersHorizontal } from 'lucide-react';
import { useSpellStore } from '@/stores/spellStore';
import { useIsLargeScreen } from '@/hooks/useBreakpoint';
import { useTranslation } from '@/i18n';
import { LevelTabs } from '@/components/spell-library/LevelTabs';
import { FilterChips } from '@/components/spell-library/FilterChips';

export function FilterDrawer() {
  const t = useTranslation();
  const isLarge = useIsLargeScreen();
  const [isOpen, setIsOpen] = useState(false);
  const { selectedLevel, selectedClasses, selectedSchools, showRitualOnly, showConcentrationOnly } =
    useSpellStore();

  const activeFilterCount =
    (selectedLevel !== null ? 1 : 0) +
    selectedClasses.length +
    selectedSchools.length +
    (showRitualOnly ? 1 : 0) +
    (showConcentrationOnly ? 1 : 0);

  // Desktop: filters are always visible in the content area, no drawer needed
  if (isLarge) return null;

  // Mobile: trigger button + Sheet drawer with filters
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative shrink-0"
        data-testid="filter-trigger"
      >
        <SlidersHorizontal className="w-4 h-4" />
        {activeFilterCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-primary-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </Button>
      <Sheet.Root open={isOpen} onOpenChange={setIsOpen}>
        <Sheet.Content side="bottom" className="max-h-[70vh] overflow-y-auto px-4 py-4">
          <div className="space-y-4">
            <Text as="h3" variant="heading" size="lg">
              {t('filters')}
            </Text>
            <Surface variant="selected" className="p-3 rounded-lg">
              <div className="space-y-3">
                <LevelTabs />
                <FilterChips />
              </div>
            </Surface>
          </div>
        </Sheet.Content>
      </Sheet.Root>
    </>
  );
}
