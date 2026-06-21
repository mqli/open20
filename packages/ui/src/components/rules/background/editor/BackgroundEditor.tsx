import { useState, useCallback } from 'react';
import { Input, Text, Button } from '@open20/ui';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Background, Gear } from 'open20-core';
import type { BackgroundEditorProps } from './BackgroundEditor.types';
import { COMMON_SKILLS } from './BackgroundEditor.types';

type AccordionSection = 'basic' | 'proficiencies' | 'equipment' | 'feature' | 'personality';

export function BackgroundEditor({
  value,
  onChange,
  onSubmit,
  onCancel,
  disabled = false,
  className,
  renderActions,
}: BackgroundEditorProps) {
  const [openSections, setOpenSections] = useState<Set<AccordionSection>>(new Set(['basic']));

  const toggleSection = (section: AccordionSection) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const update = useCallback(
    (partial: Partial<Background>) => {
      onChange?.({ ...value, ...partial });
    },
    [value, onChange],
  );

  const toggleSkill = useCallback(
    (skill: string) => {
      const current = [...(value?.skillProficiencies || [])];
      if (current.includes(skill)) {
        update({ skillProficiencies: current.filter((s) => s !== skill) });
      } else {
        update({ skillProficiencies: [...current, skill] });
      }
    },
    [value, update],
  );

  const handleSave = (intent: 'stay' | 'new' | 'close') => {
    if (onSubmit && value?.id) {
      onSubmit(value as Background, intent);
    }
  };

  const isDirty = true;
  const isValid = Boolean(value?.id);

  const AccordionHeader = ({ section, title }: { section: AccordionSection; title: string }) => (
    <button
      type="button"
      onClick={() => toggleSection(section)}
      disabled={disabled}
      className="flex items-center gap-2 w-full text-left py-3 px-4 rounded-lg hover:bg-bg-secondary transition-colors disabled:opacity-50"
    >
      {openSections.has(section) ? (
        <ChevronDown className="w-4 h-4" />
      ) : (
        <ChevronRight className="w-4 h-4" />
      )}
      <Text as="h3" variant="body" className="font-semibold">
        {title}
      </Text>
    </button>
  );

  return (
    <div className={className}>
      <div className="space-y-1 border rounded-lg divide-y">
        {/* Basic Info */}
        <div>
          <AccordionHeader section="basic" title="Basic Info" />
          {openSections.has('basic') && (
            <div className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    ID
                  </Text>
                  <Input
                    value={value?.id || ''}
                    onChange={(e) => update({ id: e.target.value })}
                    placeholder="e.g., acolyte"
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    Name
                  </Text>
                  <Input
                    value={value?.name || ''}
                    onChange={(e) => update({ name: e.target.value })}
                    placeholder="e.g., Acolyte"
                    disabled={disabled}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    Source
                  </Text>
                  <Input
                    value={value?.source || ''}
                    onChange={(e) => update({ source: e.target.value })}
                    placeholder="e.g., SRD 5.2"
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    Starting Gold (gp)
                  </Text>
                  <Input
                    type="number"
                    value={value?.startingGold ?? 0}
                    onChange={(e) => update({ startingGold: Number(e.target.value) })}
                    disabled={disabled}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Text as="label" variant="bodySm" className="font-medium">
                  Description
                </Text>
                <textarea
                  className="w-full p-2 border rounded-md bg-background text-sm min-h-[60px] disabled:opacity-50"
                  value={value?.description || ''}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="Describe the background..."
                  disabled={disabled}
                />
              </div>
            </div>
          )}
        </div>

        {/* Proficiencies */}
        <div>
          <AccordionHeader section="proficiencies" title="Proficiencies" />
          {openSections.has('proficiencies') && (
            <div className="px-4 pb-4 space-y-4">
              <div className="space-y-2">
                <Text as="label" variant="bodySm" className="font-medium">
                  Skill Proficiencies
                </Text>
                <div className="grid grid-cols-3 gap-1.5">
                  {COMMON_SKILLS.map((skill) => {
                    const selected = (value?.skillProficiencies || []).includes(skill);
                    return (
                      <label
                        key={skill}
                        className={`flex items-center gap-1.5 p-1.5 rounded text-xs cursor-pointer transition-colors ${
                          disabled ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          selected
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-bg-secondary'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleSkill(skill)}
                          className="rounded"
                          disabled={disabled}
                        />
                        {skill}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    Tool Proficiencies (comma-separated)
                  </Text>
                  <Input
                    value={(value?.toolProficiencies || []).join(', ')}
                    onChange={(e) =>
                      update({
                        toolProficiencies: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="e.g., Thieves' Tools"
                    disabled={disabled}
                  />
                </div>
                <div className="space-y-1.5">
                  <Text as="label" variant="bodySm" className="font-medium">
                    Languages (comma-separated)
                  </Text>
                  <Input
                    value={(value?.languages || []).join(', ')}
                    onChange={(e) =>
                      update({
                        languages: e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="e.g., Common, Elvish"
                    disabled={disabled}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Equipment */}
        <div>
          <AccordionHeader section="equipment" title="Equipment" />
          {openSections.has('equipment') && (
            <div className="px-4 pb-4 space-y-3">
              <div className="space-y-1.5">
                <Text as="label" variant="bodySm" className="font-medium">
                  Equipment (one per line, format: name | quantity)
                </Text>
                <textarea
                  className="w-full p-2 border rounded-md bg-background text-sm min-h-[100px] font-mono disabled:opacity-50"
                  value={((value?.startingEquipment || []) as readonly Gear[])
                    .map((g) => `${g.name}${g.quantity ? ` | ${g.quantity}` : ''}`)
                    .join('\n')}
                  onChange={(e) => {
                    const gear: Gear[] = e.target.value
                      .split('\n')
                      .map((line) => line.trim())
                      .filter(Boolean)
                      .map((line) => {
                        const [name, qtyStr] = line.split('|').map((s) => s.trim());
                        return {
                          id: name.toLowerCase().replace(/\s+/g, '-'),
                          name,
                          quantity: qtyStr ? Number(qtyStr) : 1,
                        } as Gear;
                      });
                    update({ startingEquipment: gear });
                  }}
                  placeholder={`Holy Symbol | 1\nPrayer Book | 1`}
                  disabled={disabled}
                />
              </div>
            </div>
          )}
        </div>

        {/* Feature */}
        <div>
          <AccordionHeader section="feature" title="Origin Feat" />
          {openSections.has('feature') && (
            <div className="px-4 pb-4 space-y-3">
              <div className="space-y-1.5">
                <Text as="label" variant="bodySm" className="font-medium">
                  Origin Feat ID
                </Text>
                <Input
                  value={value?.originFeatId || ''}
                  onChange={(e) => update({ originFeatId: e.target.value })}
                  placeholder="e.g., magic-initiate"
                  disabled={disabled}
                />
              </div>
            </div>
          )}
        </div>

        {/* Personality */}
        <div>
          <AccordionHeader section="personality" title="Personality" />
          {openSections.has('personality') && (
            <div className="px-4 pb-4 space-y-3">
              <Text as="p" variant="bodySm" className="text-muted-foreground">
                Personality traits, ideals, bonds, and flaws can be added as notes.
              </Text>
              <div className="space-y-1.5">
                <Text as="label" variant="bodySm" className="font-medium">
                  Personality Notes
                </Text>
                <textarea
                  className="w-full p-2 border rounded-md bg-background text-sm min-h-[80px] disabled:opacity-50"
                  value={value?.description || ''}
                  onChange={(e) => update({ description: e.target.value })}
                  placeholder="Additional personality notes..."
                  disabled={disabled}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {renderActions ? (
        <div className="mt-6">
          {renderActions({
            onSave: handleSave,
            isDirty,
            isValid,
            isSubmitting: false,
          })}
        </div>
      ) : (
        <div className="flex items-center justify-end gap-2 mt-6">
          {onCancel && (
            <Button type="button" variant="ghost" size="lg" onClick={onCancel} disabled={disabled}>
              Cancel
            </Button>
          )}
          {onSubmit && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => handleSave('stay')}
                disabled={!isValid || disabled}
              >
                Save
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                onClick={() => handleSave('new')}
                disabled={!isValid || disabled}
              >
                Save & New
              </Button>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => handleSave('close')}
                disabled={!isValid || disabled}
              >
                Save & Close
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
