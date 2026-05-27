import type { SpellFormData } from '../SpellEditor.types';
import { Text } from '../../../Text/Text';
import { Surface } from '../../../Surface/Surface';
import { Button } from '../../../Button/Button';

interface DescriptionSectionProps {
  formData: SpellFormData;
  onChange: (updates: Partial<SpellFormData>) => void;
  disabled?: boolean;
}

export function DescriptionSection({ formData, onChange, disabled }: DescriptionSectionProps) {
  const addDescriptionParagraph = () => {
    onChange({
      description: [...formData.description, ''],
    });
  };

  const updateDescriptionParagraph = (index: number, value: string) => {
    const newDescription = [...formData.description];
    newDescription[index] = value;
    onChange({ description: newDescription });
  };

  const removeDescriptionParagraph = (index: number) => {
    if (formData.description.length <= 1) return;
    const newDescription = formData.description.filter((_, i) => i !== index);
    onChange({ description: newDescription });
  };

  const addHigherLevelEntry = () => {
    onChange({
      usingAHigherLevelSpellSlot: [
        ...(formData.usingAHigherLevelSpellSlot || []),
        '',
      ],
    });
  };

  const updateHigherLevelEntry = (index: number, value: string) => {
    const newEntries = [...(formData.usingAHigherLevelSpellSlot || [])];
    newEntries[index] = value;
    onChange({ usingAHigherLevelSpellSlot: newEntries });
  };

  const removeHigherLevelEntry = (index: number) => {
    const newEntries = (formData.usingAHigherLevelSpellSlot || []).filter(
      (_, i) => i !== index
    );
    onChange({
      usingAHigherLevelSpellSlot: newEntries.length > 0 ? newEntries : undefined,
    });
  };

  return (
    <Surface variant="default" padding="md" className="space-y-4">
      <Text as="h3" variant="heading" size="lg" className="text-text-primary">
        Description
      </Text>

      {/* Description Paragraphs */}
      <div className="space-y-2">
        <Text as="label" variant="formLabel">
          Description (Multi-paragraph)
        </Text>
        {formData.description.map((paragraph, index) => (
          <div key={index} className="flex gap-2">
            <textarea
              value={paragraph}
              onChange={(e) => updateDescriptionParagraph(index, e.target.value)}
              placeholder={`Paragraph ${index + 1}`}
              disabled={disabled}
              className="flex-1 min-h-[80px] rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            />
            {formData.description.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeDescriptionParagraph(index)}
                disabled={disabled}
                className="text-danger hover:bg-danger/10"
              >
                ×
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addDescriptionParagraph}
          disabled={disabled}
          className="text-primary-600 dark:text-primary-400"
        >
          + Add Paragraph
        </Button>
      </div>

      {/* At Higher Levels (only for level > 0) */}
      {formData.level > 0 && (
        <div className="space-y-2 pt-4 border-t border-border/50">
          <Text as="label" variant="formLabel">
            At Higher Levels
          </Text>
          {(formData.usingAHigherLevelSpellSlot || []).map((entry, index) => (
            <div key={index} className="flex gap-2">
              <textarea
                value={entry}
                onChange={(e) => updateHigherLevelEntry(index, e.target.value)}
                placeholder="Describe effect when cast at higher level"
                disabled={disabled}
                className="flex-1 min-h-[60px] rounded-md border border-border bg-bg-primary px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeHigherLevelEntry(index)}
                disabled={disabled}
                className="text-danger hover:bg-danger/10"
              >
                ×
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addHigherLevelEntry}
            disabled={disabled}
            className="text-primary-600 dark:text-primary-400"
          >
            + Add Higher Level Effect
          </Button>
        </div>
      )}
    </Surface>
  );
}
