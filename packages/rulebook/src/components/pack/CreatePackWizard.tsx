import { useState } from 'react';
import { Button } from '@open20/ui';
import { Input } from '@open20/ui';
import { usePackStore } from '../../stores/packStore';
import type { ContentPackMeta } from 'open20-core';

interface CreatePackWizardProps {
  onClose: () => void;
}

export function CreatePackWizard({ onClose }: CreatePackWizardProps) {
  const [step, setStep] = useState(1);
  const [packId, setPackId] = useState('');
  const [packName, setPackName] = useState('');
  const [version, setVersion] = useState('1.0.0');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const createAndSavePack = usePackStore((state) => state.createAndSavePack);

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handleCreate = async () => {
    const meta: ContentPackMeta = {
      id: packId,
      name: packName,
      version,
      source: packName, // Use packName as source for new packs
      author: author || undefined,
    };
    await createAndSavePack(meta);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-primary rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Content Pack</h2>
          <button onClick={onClose} className="text-text-primary hover:text-text-secondary">
            ✕
          </button>
        </div>

        <div className="mb-4">
          <span className="text-sm text-text-secondary">Step {step} of 2: </span>
          <span className="text-sm font-semibold text-text-primary">
            {step === 1 ? 'Basic Information' : 'Confirm & Create'}
          </span>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-text-primary">Pack ID *</label>
              <Input
                type="text"
                value={packId}
                onChange={(e) => setPackId(e.target.value)}
                placeholder="my-homebrew"
              />
              <p className="text-xs text-text-tertiary mt-1">kebab-case, unique</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-primary">
                Pack Name *
              </label>
              <Input
                type="text"
                value={packName}
                onChange={(e) => setPackName(e.target.value)}
                placeholder="My Homebrew Spells"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-primary">Version</label>
              <Input type="text" value={version} onChange={(e) => setVersion(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-primary">Author</label>
              <Input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-text-primary">
                Description (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-border rounded-md bg-bg-primary text-text-primary"
                rows={3}
              />
            </div>
          </div>
        ) : (
          <div className="mb-4">
            <h3 className="font-semibold mb-2 text-text-primary">Confirm Pack Details</h3>
            <div className="space-y-1 text-sm text-text-secondary">
              <p>
                <strong>ID:</strong> {packId}
              </p>
              <p>
                <strong>Name:</strong> {packName}
              </p>
              <p>
                <strong>Version:</strong> {version}
              </p>
              <p>
                <strong>Author:</strong> {author || '(not set)'}
              </p>
              {description && (
                <p>
                  <strong>Description:</strong> {description}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {step === 1 ? (
            <Button onClick={handleNext} disabled={!packId || !packName}>
              Next →
            </Button>
          ) : (
            <Button onClick={handleCreate}>Create Pack</Button>
          )}
        </div>
      </div>
    </div>
  );
}
