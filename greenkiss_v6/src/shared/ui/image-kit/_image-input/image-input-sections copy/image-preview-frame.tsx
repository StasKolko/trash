import type { ReactNode } from "react";

export const ImagePreviewFrame = ({
  children,
  isInvalid,
}: {
  children: ReactNode;
  isInvalid?: boolean;
}) => (
  <div
    className={`
      relative w-full aspect-square overflow-hidden rounded-md border
      flex items-center justify-center
      ${
        isInvalid
          ? "border-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.6)]"
          : "border-border"
      }
    `}
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
