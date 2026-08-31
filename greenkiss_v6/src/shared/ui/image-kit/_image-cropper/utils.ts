import { AspectRatio, AspectRatioConfig, AllowedFormats } from './types';
import { Crop } from 'react-image-crop';

export const ASPECT_RATIOS: AspectRatioConfig[] = [
  { value: '1:1', label: '1:1 (Квадрат)', ratio: 1 },
  { value: '3:4', label: '3:4 (Портрет)', ratio: 3/4 },
  { value: '4:3', label: '4:3 (Альбом)', ratio: 4/3 },
  { value: '16:9', label: '16:9 (Широкий)', ratio: 16/9 },
  { value: '9:16', label: '9:16 (Stories)', ratio: 9/16 },
  { value: '728:90', label: '728:90 (Баннер)', ratio: 728/90 },
  { value: '300:250', label: '300:250 (Средний прямоугольник)', ratio: 300/250 },
  { value: '320:50', label: '320:50 (Мобильный баннер)', ratio: 320/50 },
];

export const getAspectRatioConfig = (ratio: AspectRatio): AspectRatioConfig => {
  return ASPECT_RATIOS.find(r => r.value === ratio) || ASPECT_RATIOS[0];
};

export const calculateInitialCrop = (
  imageWidth: number,
  imageHeight: number,
  aspectRatio: AspectRatio
): Crop => {
  const { ratio } = getAspectRatioConfig(aspectRatio);
  const imageAspect = imageWidth / imageHeight;
  
  let width: number;
  let height: number;
  
  if (imageAspect > ratio) {
    // Изображение шире целевого соотношения
    height = imageHeight;
    width = height * ratio;
  } else {
    // Изображение выше целевого соотношения
    width = imageWidth;
    height = width / ratio;
  }
  
  return {
    unit: 'px',
    x: 0,
    y: 0,
    width: Math.min(width, imageWidth),
    height: Math.min(height, imageHeight),
  };
};

export const getAcceptedFormats = (allowed?: AllowedFormats): string => {
  const defaults: AllowedFormats = {
    png: true,
    webp: true,
    jpeg: true,
    jpg: true,
  };
  
  const formats = { ...defaults, ...allowed };
  const accepted: string[] = [];
  
  if (formats.png !== false) accepted.push('.png');
  if (formats.webp !== false) accepted.push('.webp');
  if (formats.jpeg !== false) accepted.push('.jpeg');
  if (formats.jpg !== false) accepted.push('.jpg');
  
  return accepted.join(',');
};

export const validateFile = (
  file: File,
  allowedFormats?: AllowedFormats,
  maxFileSize?: number
): string | null => {
  const formats = getAcceptedFormats(allowedFormats).split(',');
  const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
  
  if (!formats.includes(extension)) {
    return `Неподдерживаемый формат файла. Разрешены: ${formats.join(', ')}`;
  }
  
  if (maxFileSize && file.size > maxFileSize) {
    const sizeMB = (maxFileSize / 1024 / 1024).toFixed(1);
    return `Файл слишком большой. Максимальный размер: ${sizeMB}MB`;
  }
  
  return null;
};

export const cropImage = async (
  imageSrc: string,
  crop: Crop,
  fileName: string,
  quality = 0.95
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      canvas.width = crop.width!;
      canvas.height = crop.height!;
      
      ctx.drawImage(
        image,
        crop.x!,
        crop.y!,
        crop.width!,
        crop.height!,
        0,
        0,
        crop.width!,
        crop.height!
      );
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = imageSrc;
  });
};
