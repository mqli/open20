import { useSpellStore } from '@/stores/spellStore';
import { Button, FilterChip, Text } from '@open20/ui';
import { useTranslation } from '@/i18n';
import { dataLoader } from '@/core/data-loader';
import { useMemo } from 'react';
import { SPELL_SCHOOLS } from 'open20-core';

export function FilterChips() {
  const classes = useMemo(
    () =>
      dataLoader
        .getAllClasses()
        .filter((c) => !!c.spellcasting)
        .map((c) => c.id),
    [],
  );
  const t = useTranslation();
  const {
    selectedClasses,
    toggleClassFilter,
    selectedSchools,
    toggleSchoolFilter,
    showRitualOnly,
    setShowRitualOnly,
    showConcentrationOnly,
    setShowConcentrationOnly,
    clearAllFilters,
  } = useSpellStore();

  const activeFilterCount =
    selectedClasses.length +
    selectedSchools.length +
    (showRitualOnly ? 1 : 0) +
    (showConcentrationOnly ? 1 : 0);

  return (
    <div className="py-2 space-y-3">
      <div className="flex justify-between">
        <div className="flex flex-wrap gap-2">
          <FilterChip
            variant={showRitualOnly ? 'info' : 'secondary'}
            active={showRitualOnly}
            onPressedChange={(pressed) => setShowRitualOnly(pressed)}
          >
            {t('ritual')}
          </FilterChip>
          <FilterChip
            variant={showConcentrationOnly ? 'warning' : 'secondary'}
            active={showConcentrationOnly}
            onPressedChange={(pressed) => setShowConcentrationOnly(pressed)}
          >
            {t('concentration')}
          </FilterChip>
        </div>
        {activeFilterCount > 0 && (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-text-secondary hover:text-danger text-xs py-0.5"
            >
              {activeFilterCount > 1
                ? t('clearFilters', { count: activeFilterCount })
                : t('clearFilter')}
            </Button>
          </div>
        )}
      </div>
      <div>
        <Text
          as="h4"
          size="sm"
          weight="medium"
          color="tertiary"
          className="uppercase tracking-wider mb-1.5"
        >
          {t('classes')}
        </Text>
        <div className="max-h-28 overflow-y-auto pr-1 scrollbar-custom">
          <div className="flex flex-wrap gap-1.5">
            {classes.map((cls) => (
              <FilterChip
                key={cls}
                variant={selectedClasses.includes(cls) ? 'primary' : 'secondary'}
                active={selectedClasses.includes(cls)}
                onPressedChange={() => toggleClassFilter(cls)}
                size="sm"
              >
                {cls}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>

      <div>
        <Text
          as="h4"
          size="sm"
          weight="medium"
          color="tertiary"
          className="uppercase tracking-wider mb-1.5"
        >
          {t('schools')}
        </Text>
        <div className="max-h-28 overflow-y-auto pr-1 scrollbar-custom">
          <div className="flex flex-wrap gap-1.5">
            {SPELL_SCHOOLS.map((school) => (
              <FilterChip
                key={school}
                variant={selectedSchools.includes(school) ? 'primary' : 'secondary'}
                active={selectedSchools.includes(school)}
                onPressedChange={() => toggleSchoolFilter(school)}
                size="sm"
              >
                {school}
              </FilterChip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
