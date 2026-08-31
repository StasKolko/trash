import type { ChangeEvent, FocusEvent } from "react";
import { Input } from "@/shared/ui/kit/input";

export const CropNumberField = ({
  label,
  value,
  min,
  max,
  onChange,
  onBlur,
}: {
  label: string;
  value: string;
  min?: number;
  max?: number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: FocusEvent<HTMLInputElement>) => void;
}) => (
  <div className="flex flex-col">
    <label htmlFor={label} className="mb-1">
      {label.toUpperCase()}
    </label>
    <Input
      id={label}
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={onChange}
      onBlur={onBlur}
    />
  </div>
);
