import { useState, useCallback } from 'react';

export interface UseArrayFieldReturn<T> {
  items: T[];
  addItem: (item: T) => void;
  removeItem: (index: number) => void;
  updateItem: (index: number, updater: (item: T) => T) => void;
  setItems: (items: T[]) => void;
}

export function useArrayField<T>(initialItems: T[] = []): UseArrayFieldReturn<T> {
  const [items, setItemsState] = useState<T[]>(initialItems);

  const addItem = useCallback((item: T) => {
    setItemsState((prev) => [...prev, item]);
  }, []);

  const removeItem = useCallback((index: number) => {
    setItemsState((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = useCallback((index: number, updater: (item: T) => T) => {
    setItemsState((prev) => prev.map((item, i) => (i === index ? updater(item) : item)));
  }, []);

  const setItems = useCallback((newItems: T[]) => {
    setItemsState(newItems);
  }, []);

  return { items, addItem, removeItem, updateItem, setItems };
}
