import React from 'react';
import { cn } from '@/shared/lib/css';
import { AspectRatio } from './types';
import { getAspectRatioConfig } from './utils';

interface AspectRatioPreviewProps {
  aspectRatio: AspectRatio;
  className?: string;
}

export const AspectRatioPreview: React.FC<AspectRatioPreviewProps> = ({
  aspectRatio,
  className,
}) => {
  const config = getAspectRatioConfig(aspectRatio);
  const isHorizontal = config.ratio > 1;
  
  const maxSize = 100;
  let width = maxSize;
  let height = maxSize;
  
  if (isHorizontal) {
    height = maxSize / config.ratio;
  } else {
    width = maxSize * config.ratio;
  }
  
  return (
    <div className={cn("flex items-center justify-center p-2", className)}>
      <div 
        className="border-2 border-primary rounded-md bg-primary/5"
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
          {aspectRatio}
        </div>
      </div>
    </div>
  );
};
