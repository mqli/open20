import { createContext, useContext, useMemo, useEffect, type ReactNode } from 'react';
import type { StorageProvider, ComputationProvider } from '@/lib/providers';
import { localStorageProvider } from '@/lib/providers/storage';
import { localComputationProvider } from '@/lib/providers/computation';

interface AppContextValue {
  storage: StorageProvider;
  computation: ComputationProvider;
}

const AppContext = createContext<AppContextValue | null>(null);

// Module-level variable to access context outside of React hooks
let _contextValue: AppContextValue | null = null;

interface AppProvidersProps {
  children: ReactNode;
  storage?: StorageProvider;
  computation?: ComputationProvider;
}

export function AppProviders({
  children,
  storage = localStorageProvider,
  computation = localComputationProvider,
}: AppProvidersProps) {
  const value = useMemo(
    () => ({ storage, computation }),
    [storage, computation]
  );

  // Update module-level variable when context value changes
  useEffect(() => {
    _contextValue = value;
  }, [value]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within AppProviders');
  }
  return ctx;
}

// Non-hook function to get context value (for use in stores)
export function getAppContext(): AppContextValue {
  if (!_contextValue) {
    // Fallback to defaults if context not yet initialized
    return {
      storage: localStorageProvider,
      computation: localComputationProvider,
    };
  }
  return _contextValue;
}
