import * as React from 'react';

export function ProcessingOverlay({ active, children }: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      {children}
      {active && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-2 text-white">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            <span className="text-sm">Обработка…</span>
          </div>
        </div>
      )}
    </div>
  );
}
