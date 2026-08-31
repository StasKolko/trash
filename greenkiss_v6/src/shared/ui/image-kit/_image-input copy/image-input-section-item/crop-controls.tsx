"use client";

import { type ChangeEvent, type FocusEvent, useEffect, useState } from "react";
import type { PixelCrop } from "react-image-crop";
import { Input } from "@/shared/ui/kit/input";

type Props = {
  crop: PixelCrop | undefined;
  limits: {
    xMax?: number;
    yMax?: number;
    wMax?: number;
    hMax?: number;
  };
  onChange: (next: PixelCrop) => void;
};

export const CropControls = ({ crop, limits, onChange }: Props) => {
  const [x, setX] = useState("");
  const [y, setY] = useState("");
  const [w, setW] = useState("");
  const [h, setH] = useState("");

  // Синхронизируемся, когда crop меняется извне (ReactCrop, инициализация и т.п.)
  useEffect(() => {
    if (!crop) {
      setX("");
      setY("");
      setW("");
      setH("");
      return;
    }

    setX(String(Math.round(crop.x)));
    setY(String(Math.round(crop.y)));
    setW(String(Math.round(crop.width)));
    setH(String(Math.round(crop.height)));
  }, [crop]);

  const patchCrop = (field: "x" | "y" | "width" | "height", value: number) => {
    if (!crop) return;

    const next: PixelCrop = {
      ...crop,
      [field]: value,
    } as PixelCrop;

    onChange(next);
  };

  const handleChange =
    (field: "x" | "y" | "width" | "height") =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;

      // Обновляем локальную строку всегда
      if (field === "x") setX(raw);
      if (field === "y") setY(raw);
      if (field === "width") setW(raw);
      if (field === "height") setH(raw);

      // Пустое значение — даём пользователю продолжить ввод, crop не трогаем
      if (!crop || raw.trim() === "") return;

      const num = Number(raw);
      if (Number.isNaN(num)) return;

      patchCrop(field, num);
    };

  const handleBlur =
    (field: "x" | "y" | "width" | "height") =>
    (e: FocusEvent<HTMLInputElement>) => {
      if (!crop) return;

      let raw = e.target.value.trim();
      if (raw === "") raw = e.target.min || "0";

      let num = Number(raw);
      if (Number.isNaN(num)) num = Number(e.target.min || 0);

      const min = e.target.min !== "" ? Number(e.target.min) : undefined;
      const max = e.target.max !== "" ? Number(e.target.max) : undefined;

      if (min !== undefined && !Number.isNaN(min)) num = Math.max(min, num);
      if (max !== undefined && !Number.isNaN(max)) num = Math.min(max, num);

      patchCrop(field, num);

      const final = String(num);
      if (field === "x") setX(final);
      if (field === "y") setY(final);
      if (field === "width") setW(final);
      if (field === "height") setH(final);
    };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm px-4 pt-2 pb-4">
      <div className="flex flex-col">
        <label htmlFor="x" className="mb-1">
          X
        </label>
        <Input
          id="x"
          max={limits.xMax ?? undefined}
          min={0}
          onChange={handleChange("x")}
          onBlur={handleBlur("x")}
          type="number"
          value={x}
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="y" className="mb-1">
          Y
        </label>
        <Input
          id="y"
          max={limits.yMax ?? undefined}
          min={0}
          onChange={handleChange("y")}
          onBlur={handleBlur("y")}
          type="number"
          value={y}
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="width" className="mb-1">
          Width
        </label>
        <Input
          id="width"
          max={limits.wMax ?? undefined}
          min={1} // лучше 1, валидацию минимума делаем через isCropInvalid
          onChange={handleChange("width")}
          onBlur={handleBlur("width")}
          type="number"
          value={w}
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="height" className="mb-1">
          Height
        </label>
        <Input
          id="height"
          max={limits.hMax ?? undefined}
          min={1}
          onChange={handleChange("height")}
          onBlur={handleBlur("height")}
          type="number"
          value={h}
        />
      </div>
    </div>
  );
};
