import { useState, useCallback, useEffect } from 'react';
import { Crop } from 'react-image-crop';
import { 
  ImageToCrop, 
  ProcessedImage, 
  AspectRatio,
  AllowedFormats
} from './types';
import { validateFile, cropImage } from './utils';
import toast from 'react-hot-toast';

export const useImageCropper = (
  multiple: boolean,
  allowedFormats?: AllowedFormats,
  maxFileSize?: number,
  quality?: number
) => {
  const [images, setImages] = useState<ImageToCrop[]>([]);
  const [currentAspectRatio, setCurrentAspectRatio] = useState<AspectRatio>('1:1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;
    
    const newImages: ImageToCrop[] = [];
    const filesToProcess = multiple ? Array.from(files) : [files[0]];
    
    for (const file of filesToProcess) {
      const error = validateFile(file, allowedFormats, maxFileSize);
      
      if (error) {
        toast.error(`Ошибка файла "${file.name}": ${error}`);
        continue;
      }
      
      const imageUrl = URL.createObjectURL(file);
      newImages.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        imageUrl,
        crop: { unit: 'px', x: 0, y: 0, width: 0, height: 0 },
        aspectRatio: currentAspectRatio,
      });
    }
    
    setImages(prev => multiple ? [...prev, ...newImages] : newImages);
  }, [multiple, allowedFormats, maxFileSize, currentAspectRatio, toast]);
  
  const updateCrop = useCallback((id: string, crop: Crop) => {
    setImages(prev => 
      prev.map(img => 
        img.id === id ? { ...img, crop } : img
      )
    );
  }, []);
  
  const updateAspectRatio = useCallback((aspectRatio: AspectRatio) => {
    setCurrentAspectRatio(aspectRatio);
    setImages(prev => 
      prev.map(img => ({ ...img, aspectRatio, crop: { unit: 'px', x: 0, y: 0, width: 0, height: 0 } }))
    );
  }, []);
  
  const processImages = useCallback(async (): Promise<ProcessedImage[]> => {
    setIsProcessing(true);
    const processed: ProcessedImage[] = [];
    
    try {
      for (const image of images) {
        if (!image.crop.width || !image.crop.height) {
          toast.error(`Изображение "${image.file.name}" не обрезано!`);
          continue;
        }
        
        const croppedBlob = await cropImage(
          image.imageUrl,
          image.crop,
          image.file.name,
          quality
        );
        
        const croppedUrl = URL.createObjectURL(croppedBlob);
        
        processed.push({
          id: image.id,
          originalFile: image.file,
          croppedImageUrl: croppedUrl,
          crop: image.crop,
          aspectRatio: image.aspectRatio,
        });
      }
      
      return processed;
    } catch (error) {
      toast.error(`Ошибка при обработке изображений: ${error}`);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [images, quality, toast]);
  
  const reset = useCallback(() => {
    images.forEach(img => URL.revokeObjectURL(img.imageUrl));
    setImages([]);
    setIsProcessing(false);
    setIsZoomed(false);
  }, [images]);
  
  useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.imageUrl));
    };
  }, [images]);
  
  return {
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
  };
};
