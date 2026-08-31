'use client';

import { useCallback } from 'react';

export function useImageFilePicker({
  multiple,
  maxFiles = 5,
  onFiles,
  onError,
}: {
  multiple?: boolean;
  maxFiles?: number;
  onFiles: (files: File[]) => void;
  onError?: (error: Error) => void;
}) {
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      try {
        const fileList = event.target.files;
        if (!fileList || fileList.length === 0) return;

        const files = Array.from(fileList).slice(0, maxFiles);
        onFiles(files);
      } catch (e) {
        onError?.(
          e instanceof Error ? e : new Error('Unknown error in file picker')
        );
      } finally {
        // reset input for repeated selection of the same file
        event.target.value = '';
      }
    },
    [maxFiles, onFiles, onError]
  );

  return {
    accept: 'image/png,image/jpeg,image/webp',
    multiple: !!multiple,
    onChange: handleChange,
  };
}
