import { useEffect, useState } from 'react';
import { subscribeToToasts, dismissToast } from '@/utils/toast';
import type { Toast } from '@/utils/toast';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => subscribeToToasts(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg border text-sm max-w-sm transition-all duration-300 ${
            toast.type === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : toast.type === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : 'bg-bg-secondary border-border-primary text-text-primary'
          }`}
        >
          {toast.type === 'error' && <AlertCircle size={16} />}
          {toast.type === 'success' && <CheckCircle2 size={16} />}
          {toast.type === 'info' && <Info size={16} />}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="p-0.5 rounded hover:bg-white/10 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
