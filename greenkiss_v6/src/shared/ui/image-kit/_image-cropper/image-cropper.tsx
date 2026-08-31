import React from 'react';
import { Button } from '@/shared/ui/kit/button';
import { ImageIcon } from 'lucide-react';
import { cn } from '@/shared/lib/css';
import { ImageCropperDialog } from './image-cropper-dialog';
import { ImageCropperProps } from './types';

export const ImageCropper: React.FC<ImageCropperProps> = ({
  disabled = false,
  className,
  triggerLabel = 'Выбрать изображение',
  isOpen,
  onOpenChange,
  ...dialogProps
}) => {
  return (
    <>
      <Button
        variant="outline"
        onClick={() => onOpenChange(true)}
        disabled={disabled}
        className={cn('gap-2', className)}
      >
        <ImageIcon className="h-4 w-4" />
        {triggerLabel}
      </Button>
      
      <ImageCropperDialog
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        {...dialogProps}
      />
    </>
  );
};
