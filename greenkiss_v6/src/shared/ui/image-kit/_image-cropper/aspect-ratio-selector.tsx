import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/kit/select';
import { AspectRatio } from './types';
import { ASPECT_RATIOS } from './utils';

interface AspectRatioSelectorProps {
  value: AspectRatio;
  onChange: (value: AspectRatio) => void;
  disabled?: boolean;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({
  value,
  onChange,
  disabled,
}) => {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Выберите формат" />
      </SelectTrigger>
      <SelectContent>
        {ASPECT_RATIOS.map((ratio) => (
          <SelectItem key={ratio.value} value={ratio.value}>
            {ratio.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
