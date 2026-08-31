"use client";

import {
  useEffect,
  useState,
  type ChangeEvent,
  type FocusEvent,
} from "react";
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

/**
 * ВАЖНО:
 *  - локальное состояние строк (xStr, yStr, wStr, hStr) живёт своей жизнью во время ввода
 *  - мы синхронизируем его с crop ТОЛЬКО:
 *      * при смене crop снаружи (когда реально поменялась картинка/кроп),
 *      * при blur (когда мы уже склампили и зафиксировали значение)
 */
export const CropControls = ({ crop, limits, onChange }: Props) => {
  const [xStr, setXStr] = useState("");
  const [yStr, setYStr] = useState("");
  const [wStr, setWStr] = useState("");
  const [hStr, setHStr] = useState("");

  // Первичная/внешняя синхронизация только когда crop реально поменялся
  useEffect(() => {
    if (!crop) {
      setXStr("");
      setYStr("");
      setWStr("");
      setHStr("");
      return;
    }

    setXStr((prev) =>
      prev === "" ? String(Math.round(crop.x)) : prev,
    );
    setYStr((prev) =>
      prev === "" ? String(Math.round(crop.y)) : prev,
    );
    setWStr((prev) =>
      prev === "" ? String(Math.round(crop.width)) : prev,
    );
    setHStr((prev) =>
      prev === "" ? String(Math.round(crop.height)) : prev,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crop?.x, crop?.y, crop?.width, crop?.height]);
  // намеренно используем точечные зависимости, чтобы не срабатывать на каждый
  // новый объект crop с теми же значениями

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

      // локально всегда обновляем строку, даже если это "пусто" или "0."
      if (field === "x") setXStr(raw);
      if (field === "y") setYStr(raw);
      if (field === "width") setWStr(raw);
      if (field === "height") setHStr(raw);

      // Пока пользователь вводит — не трогаем crop (пусть blur всё зафиксирует)
      // Если хочешь более агрессивную синхронизацию — можно раскомментировать
      // логику ниже, но это снова приведёт к «дёрганьям».
    };

  const handleBlur =
    (field: "x" | "y" | "width" | "height") =>
    (e: FocusEvent<HTMLInputElement>) => {
      if (!crop) return;

      let raw = e.target.value.trim();
      const minAttr = e.target.min;
      const maxAttr = e.target.max;

      // Если оставили пусто — подставляем минимум или 0/1
      if (raw === "") {
        if (field === "width" || field === "height") {
          raw = minAttr || "1";
        } else {
          raw = minAttr || "0";
        }
      }

      let num = Number(raw);
      if (Number.isNaN(num)) {
        num = field === "width" || field === "height" ? 1 : 0;
      }

      const min =
        minAttr !== "" && minAttr != null ? Number(minAttr) : undefined;
      const max =
        maxAttr !== "" && maxAttr != null ? Number(maxAttr) : undefined;

      if (min !== undefined && !Number.isNaN(min)) num = Math.max(min, num);
      if (max !== undefined && !Number.isNaN(max)) num = Math.min(max, num);

      // Фактически обновляем crop
      patchCrop(field, num);

      const final = String(num);
      if (field === "x") setXStr(final);
      if (field === "y") setYStr(final);
      if (field === "width") setWStr(final);
      if (field === "height") setHStr(final);
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
          value={xStr}
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
          value={yStr}
        />
      </div>

      <div className="flex flex-col">
        <label htmlFor="width" className="mb-1">
          Width
        </label>
        <Input
          id="width"
          max={limits.wMax ?? undefined}
          min={1}
          onChange={handleChange("width")}
          onBlur={handleBlur("width")}
          type="number"
          value={wStr}
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
          value={hStr}
        />
      </div>
    </div>
  );
};
