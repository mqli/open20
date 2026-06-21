import { useNavigate } from 'react-router-dom';
import { DropdownMenu, Button } from '@open20/ui';
import { Plus, FileDown } from 'lucide-react';

interface AddContentButtonProps {
  packId?: string;
  onAddSpell?: () => void;
  onAddMonster?: () => void;
  onAddSpecies?: () => void;
  onAddBackground?: () => void;
  onAddFeat?: () => void;
  onImport?: () => void;
}

export function AddContentButton({
  packId,
  onAddSpell,
  onAddMonster,
  onAddSpecies,
  onAddBackground,
  onAddFeat,
  onImport,
}: AddContentButtonProps) {
  const navigate = useNavigate();

  const handleAddSpell = () => {
    if (packId) {
      navigate(`/rulebook/editor/${packId}/spell`);
    }
    onAddSpell?.();
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Button className="flex items-center gap-1">
          <Plus className="w-4 h-4" />
          Add
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-48">
        <DropdownMenu.Item onClick={handleAddSpell} className="cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />
          Add Spell
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            if (packId) {
              navigate(`/rulebook/editor/${packId}/monster`);
            }
            onAddMonster?.();
          }}
          className="cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Monster
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            if (packId) {
              navigate(`/rulebook/editor/${packId}/species`);
            }
            onAddSpecies?.();
          }}
          className="cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Species
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            if (packId) {
              navigate(`/rulebook/editor/${packId}/background`);
            }
            onAddBackground?.();
          }}
          className="cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Background
        </DropdownMenu.Item>
        <DropdownMenu.Item
          onClick={() => {
            if (packId) {
              navigate(`/rulebook/editor/${packId}/feat`);
            }
            onAddFeat?.();
          }}
          className="cursor-pointer"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Feat
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          onClick={() => {
            console.log('Import Content');
            onImport?.();
          }}
          className="cursor-pointer"
        >
          <FileDown className="w-4 h-4 mr-2" />
          Import Content
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
