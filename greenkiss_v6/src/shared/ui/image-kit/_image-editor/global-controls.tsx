"use client";

import type React from "react";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/kit/select";

import type { AspectPreset, Size } from "../_lib/types";

type Props = {
  presets: AspectPreset[];
  disabled: boolean;
  requiredAspectId?: string;
  requiredSize?: Size;
  value: {
    aspectId?: string;
    width?: number;
    height?: number;
    ext?: string | "all";
  };
  onChange: (v: Props["value"]) => void;
  allowedExts: string[];
  requiredExt?: string;
};

export const GlobalControls: React.FC<Props> = ({
  presets,
  disabled,
  requiredAspectId,
  requiredSize,
  value,
  onChange,
  allowedExts,
  requiredExt,
}) => {
  const aspectDisabled = !!requiredAspectId || disabled;
  const extDisabled = !!requiredExt || disabled;
  const sizeDisabled = disabled;

  const currentAspect = requiredAspectId ?? value.aspectId ?? presets[0]?.id;

  return (
    <div className="rounded-md border p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Label className="w-24">Формат</Label>
        {!requiredAspectId ? (
          <Select
            disabled={aspectDisabled}
            onValueChange={(v) => onChange({ ...value, aspectId: v })}
            value={currentAspect}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {presets.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-sm">
            {presets.find((p) => p.id === requiredAspectId)?.label ?? "—"}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Label className="w-24">Размер</Label>
        <Input
          className="w-28"
          disabled={sizeDisabled}
          min={1}
          onChange={(e) => {
            const w = Number(e.target.value);
            onChange({ ...value, width: isNaN(w) ? undefined : w });
          }}
          placeholder="Ширина"
          type="number"
          value={requiredSize?.width ?? value.width ?? ""}
        />
        <span>×</span>
        <Input
          className="w-28"
          disabled={sizeDisabled}
          min={1}
          onChange={(e) => {
            const h = Number(e.target.value);
            onChange({ ...value, height: isNaN(h) ? undefined : h });
          }}
          placeholder="Высота"
          type="number"
          value={requiredSize?.height ?? value.height ?? ""}
        />
      </div>

      <div className="flex items-center gap-3">
        <Label className="w-24">Расширение</Label>
        {!requiredExt ? (
          <Select
            disabled={extDisabled}
            onValueChange={(v) => onChange({ ...value, ext: v })}
            value={value.ext ?? "all"}
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {allowedExts.map((e) => (
                <SelectItem key={e} value={e}>
                  {e.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="text-sm">{requiredExt.toUpperCase()}</div>
        )}
      </div>
    </div>
  );
};
