import { X } from 'lucide-react';
import {
  Button,
  Input,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  Surface,
} from '@open20/ui';
import { useTranslation } from '@/i18n';
import { SubclassSelect } from './SubclassSelect';
import type { AdditionalClassEntry } from './types';
import { dataLoader } from '@/core/data-loader';

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
  const CLASSES = dataLoader.getAllClasses().map((c) => ({
    id: c.id,
    name: c.name || c.id,
  }));

  return (
    <Surface variant="ghost" padding="sm" className="space-y-2 bg-bg-primary/30">
      <div className="grid grid-cols-12 gap-2 items-end">
        <div className="col-span-7">
          <SelectRoot
            value={entry.classId}
            onValueChange={(value) => onUpdate(entry.id, { classId: value, subclassId: undefined })}
          >
            <SelectTrigger />
            <SelectContent>
              {CLASSES.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectRoot>
        </div>
        <div className="col-span-3">
          <Input
            type="number"
            min={1}
            value={entry.level}
            onChange={(e) => onUpdate(entry.id, { level: parseInt(e.target.value) || 1 })}
            className="h-8 px-2 py-1 text-xs"
          />
        </div>
        <div className="col-span-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemove(entry.id)}
            className="h-8 w-full text-danger hover:text-danger hover:bg-danger/10"
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
