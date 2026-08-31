import type { ReactNode } from "react";

export const Header = ({ children }: { children: ReactNode }) => {
  return (
    <header className="w-full fixed md:sticky bottom-0 md:top-0 z-50 border-t md:border-t-0 md:border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="h-12 md:h-14 flex items-center justify-between gap-4 px-4 sm:px-8">
        {children}
      </div>
    </header>
  );
};
