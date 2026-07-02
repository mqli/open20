import { useMemo } from 'react';
import { X } from 'lucide-react';
import {
  Badge,
  Button,
  Input,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectSeparator,
  Surface,
} from '@open20/ui';
import { useTranslation } from '@/i18n';
import { SubclassSelect } from './SubclassSelect';
import type { AdditionalClassEntry } from './types';
import { getAllClasses } from '@/core/content-resolver';
import { useCustomClassStore } from '@/stores/customClassStore';

interface AdditionalClassEntryProps {
  entry: AdditionalClassEntry;
  onUpdate: (id: string, updates: Partial<AdditionalClassEntry>) => void;
  onRemove: (id: string) => void;
}

export function AdditionalClassEntryComponent({
  entry,
  onUpdate,
  onRemove,
}: AdditionalClassEntryProps) {
  const t = useTranslation();
  const { classes: customEntries } = useCustomClassStore();

  const CLASSES = useMemo(() => {
    const srdClasses = getAllClasses().map((c) => ({
      id: c.id,
      name: c.name || c.id,
      source: c.source,
    }));
    const customClasses = customEntries.map((e) => ({
      id: e.class.id,
      name: e.class.name,
      source: e.class.source,
    }));
    return [...srdClasses, ...customClasses];
  }, [customEntries]);

  return (
    <Surface variant="ghost" padding="sm" className="space-y-2 bg-bg-primary/30">
      <div className="grid grid-cols-12 gap-2 items-end">
        <div className="col-span-6">
          <SelectRoot
            value={entry.classId}
            onValueChange={(value) => onUpdate(entry.id, { classId: value, subclassId: undefined })}
          >
            <SelectTrigger data-testid="additional-class-select" />
            <SelectContent>
              {CLASSES.filter((c) => c.source !== 'Homebrew').map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
              {CLASSES.some((c) => c.source === 'Homebrew') && (
                <>
                  <SelectSeparator />
                  {CLASSES.filter((c) => c.source === 'Homebrew').map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-1">
                        {c.name}
                        <Badge variant="secondary" size="xs">
                          {t('homebrew')}
                        </Badge>
                      </span>
                    </SelectItem>
                  ))}
                </>
              )}
            </SelectContent>
          </SelectRoot>
        </div>
        <div className="col-span-4">
          <Input
            type="number"
            min={1}
            value={entry.level}
            onChange={(e) => onUpdate(entry.id, { level: parseInt(e.target.value) || 1 })}
            data-testid="additional-level-input"
          />
        </div>
        <div className="col-span-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(entry.id)}
            className="h-8 w-full text-danger hover:text-danger hover:bg-danger/10"
            data-testid="remove-additional-class-btn"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <SubclassSelect
        classId={entry.classId}
        value={entry.subclassId ?? ''}
        onChange={(value) => onUpdate(entry.id, { subclassId: value || undefined })}
        label={t('class')}
      />
    </Surface>
  );
}
