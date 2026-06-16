interface ImportWizardProps {
  onClose: () => void;
}

export function ImportWizard({ onClose }: ImportWizardProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-bg-primary rounded-lg p-6 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-text-primary">Import Content Pack</h2>
          <button onClick={onClose} className="text-text-primary hover:text-text-secondary">
            ✕
          </button>
        </div>

        <div className="mb-4 text-text-secondary">
          <p className="mb-2">Import a content pack from a JSON file.</p>
          <p className="text-sm text-text-tertiary">
            This feature will be available in a future update.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-border rounded-md text-text-primary hover:bg-bg-secondary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
