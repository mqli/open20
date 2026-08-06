import { useCallback, useRef, useState } from 'react';

interface UseDragDropOptions {
  onFileDrop: (file: File) => void;
  accept?: string[];
}

export function useDragDrop({ onFileDrop, accept }: UseDragDropOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounter.current = 0;

      const files = e.dataTransfer?.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      if (accept && !accept.some((ext) => file.name.toLowerCase().endsWith(ext))) {
        return;
      }

      onFileDrop(file);
    },
    [onFileDrop, accept],
  );

  const dragBindings = {
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDragOver: handleDragOver,
    onDrop: handleDrop,
  };

  return { isDragging, dragBindings };
}
