import type { ReactNode } from "react";

import { ImageInputRemoveItemButton } from "./image-input-remove-item-button";

export const ImageInputSection = ({
  isInvalid,
  title,
  children,
  onRemoveItem,
}: {
  isInvalid: boolean;
  title: string;
  children: ReactNode;
  onRemoveItem: () => void;
}) => {
  return (
    <section className="w-full relative p-1">
      <ImageInputRemoveItemButton onRemoveItem={onRemoveItem} />

      <h3 className="pt-2 font-bold text-xl text-center">{title}</h3>

      {isInvalid && (
        <div className="p-3 m-4 rounded-md border border-red-700 bg-red-800/20 text-md text-red-700">
          Область обрезки слишком мала. Увеличьте её или удалите картинку.
        </div>
      )}

      {children}
    </section>
  );
};
