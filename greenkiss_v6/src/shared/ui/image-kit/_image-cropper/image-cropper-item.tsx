import React, { useRef, useState } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { cn } from '@/shared/lib/css';
import { AspectRatio } from './types';
import { calculateInitialCrop, getAspectRatioConfig } from './utils';
import { Loader2 } from 'lucide-react';

interface ImageCropperItemProps {
  id: string;
  imageUrl: string;
  crop: Crop;
  onCropChange: (crop: Crop) => void;
  aspectRatio: AspectRatio;
  isProcessing: boolean;
  isZoomed: boolean;
}

export const ImageCropperItem: React.FC<ImageCropperItemProps> = ({
  id,
  imageUrl,
  crop,
  onCropChange,
  aspectRatio,
  isProcessing,
  isZoomed,
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const config = getAspectRatioConfig(aspectRatio);
  
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImageDimensions({ width: naturalWidth, height: naturalHeight });
    
    if (!crop || crop.width === 0) {
      const initialCrop = calculateInitialCrop(naturalWidth, naturalHeight, aspectRatio);
      onCropChange(initialCrop);
    }
  };
  
  const shouldZoom = isZoomed && 
    imageDimensions.width < 400 && 
    imageDimensions.height < 400;
  
  return (
    <div className="relative">
      <div className={cn(
        "relative overflow-auto max-h-[500px] rounded-lg border",
        shouldZoom && "flex items-center justify-center min-h-[400px]"
      )}>
        <ReactCrop
          crop={crop}
          onChange={(c) => onCropChange(c)}
          aspect={config.ratio}
          disabled={isProcessing}
          className={cn(
            shouldZoom && "scale-[2] origin-center"
          )}
        >
          <img
            ref={imgRef}
            src={imageUrl}
            alt={`Crop ${id}`}
            onLoad={handleImageLoad}
            className="max-w-none"
          />
        </ReactCrop>
        
        {isProcessing && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center rounded-lg">
            <div className="text-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              <p className="text-sm font-medium">Обработка изображения...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
