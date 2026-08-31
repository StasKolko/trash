import type { ReactNode } from "react";

export const ImagePreviewFrame = ({ children }: { children: ReactNode }) => (
  <div
    className="relative w-full aspect-square overflow-hidden rounded-md flex items-center justify-center"
    style={{
      backgroundImage: `
        linear-gradient(45deg, #e5e5e5 25%, transparent 25%, transparent 75%, #e5e5e5 75%, #e5e5e5),
        linear-gradient(45deg, #e5e5e5 25%, transparent 25%, transparent 75%, #e5e5e5 75%, #e5e5e5)
      `,
      backgroundSize: "16px 16px",
      backgroundPosition: "0 0, 8px 8px",
      backgroundColor: "#ffffff",
    }}
  >
    {children}
  </div>
);
