import React, { useEffect, useRef } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogFooter,
} from '@/shared/ui/kit/alert-dialog';
import { Button } from '@/shared/ui/kit/button';
import { Input } from '@/shared/ui/kit/input';
import { Separator } from '@/shared/ui/kit/separator';
import { Loader2, Upload, ZoomIn } from 'lucide-react';
import { AspectRatioSelector } from './aspect-ratio-selector';
import { AspectRatioPreview } from './aspect-ratio-preview';
import { useImageCropper } from './use-image-cropper';
import { ImageCropperProps } from './types';
import { getAcceptedFormats } from './utils';
import { ImageCropperItem } from './image-cropper-item';
import { ScrollArea } from '../../kit/scroll-area';


export const ImageCropperDialog: React.FC<ImageCropperProps> = ({
  multiple = false,
  allowedFormats,
  aspectRatio,
  onCropComplete,
  isOpen,
  onOpenChange,
  maxFileSize,
  quality = 0.95,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    images,
    currentAspectRatio,
    isProcessing,
    isZoomed,
    handleFileSelect,
    updateCrop,
    updateAspectRatio,
    processImages,
    reset,
    setIsZoomed,
  } = useImageCropper(multiple, allowedFormats, maxFileSize, quality);
  
  // Предотвращаем закрытие диалога при обработке
  useEffect(() => {
    if (!isProcessing) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, [isProcessing]);
  
  const handleComplete = async () => {
    try {
      const processed = await processImages();
      if (processed.length > 0) {
        onCropComplete(processed);
        onOpenChange(false);
        reset();
      }
    } catch (error) {
      console.error('Failed to process images:', error);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    // Блокируем закрытие во время обработки
    if (!open && isProcessing) {
      return;
    }
    
    if (!open) {
      reset();
    }
    
    onOpenChange(open);
  };
  
  const displayAspectRatio = aspectRatio || currentAspectRatio;
  
  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="max-w-[90vw] w-full max-w-5xl min-w-[512px]">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Обрезка изображени{multiple ? 'й' : 'я'}
            </h2>
            <div className="flex items-center gap-2">
              <AspectRatioPreview aspectRatio={displayAspectRatio} />
              {!aspectRatio && (
                <AspectRatioSelector
                  value={currentAspectRatio}
                  onChange={updateAspectRatio}
                  disabled={isProcessing}
                />
              )}
              <Button
                variant={isZoomed ? 'default' : 'outline'}
                size="icon"
                onClick={() => setIsZoomed(!isZoomed)}
                disabled={isProcessing || images.length === 0}
                title={isZoomed ? 'Отключить увеличение' : 'Увеличить маленькие изображения'}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* File Input */}
          <div className="flex justify-center">
            <Input
              ref={fileInputRef}
              type="file"
              accept={getAcceptedFormats(allowedFormats)}
              multiple={multiple}
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={isProcessing}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing || (!multiple && images.length > 0)}
              className="w-full max-w-sm"
            >
              <Upload className="mr-2 h-4 w-4" />
              {images.length === 0 
                ? `Выбрать изображени${multiple ? 'я' : 'е'}`
                : multiple 
                  ? 'Добавить еще'
                  : 'Изображение выбрано'
              }
            </Button>
          </div>
          
          {/* Images */}
          {images.length > 0 && (
            <ScrollArea className="h-[400px] w-full rounded-md border p-4">
              <div className="space-y-4">
                {images.map((image, index) => (
                  <div key={image.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-muted-foreground">
                        Изображение {index + 1} - {image.file.name}
                      </div>
                      <ImageCropperItem
                        id={image.id}
                        imageUrl={image.imageUrl}
                        crop={image.crop}
                        onCropChange={(crop) => updateCrop(image.id, crop)}
                        aspectRatio={displayAspectRatio}
                        isProcessing={isProcessing}
                        isZoomed={isZoomed}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
        
        <AlertDialogFooter>
          <Button
            onClick={handleComplete}
            disabled={isProcessing || images.length === 0}
            className="min-w-[120px]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Обработка...
              </>
            ) : (
              'Применить'
            )}
          </Button>
        </AlertDialogFooter>
        
        {/* Блокирующий оверлей при обработке */}
        {isProcessing && (
          <div 
            className="absolute inset-0 bg-transparent cursor-not-allowed z-50" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            aria-hidden="true"
          />
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};