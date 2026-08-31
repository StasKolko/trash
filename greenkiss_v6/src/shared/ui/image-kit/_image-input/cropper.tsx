"use client";

import React from "react";
import ReactCrop, { type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

type Props = {
  src: string; // dataURL/ObjectURL
  aspect?: number;
  onChangeCrop: (cropPx: {
    x: number;
    y: number;
    width: number;
    height: number;
  }) => void;
  onImageLoad?: (img: HTMLImageElement) => void;
  frameClassName?: string; // для бордера border-primary
};

export const Cropper: React.FC<Props> = ({
  src,
  aspect,
  onChangeCrop,
  onImageLoad,
  frameClassName,
}) => {
  const [crop, setCrop] = React.useState<Crop>({
    unit: "px",
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const imgRef = React.useRef<HTMLImageElement | null>(null);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    imgRef.current = img;
    // Инициализация: с верхнего левого угла, максимальная площадь минимальной стороны, под аспект если задан
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    let width = Math.min(nw, aspect ? Math.floor(nh * aspect) : nw);
    let height = Math.min(nh, aspect ? Math.floor(width / aspect) : nh);
    // Если по высоте ограничение с аспектом, пересчёт по высоте
    if (aspect) {
      if (width > nw) {
        width = nw;
        height = Math.floor(width / aspect);
      }
      if (height > nh) {
        height = nh;
        width = Math.floor(height * aspect);
      }
    }
    const initial: Crop = { unit: "px", x: 0, y: 0, width, height };
    setCrop(initial);
    onChangeCrop({ x: 0, y: 0, width, height });
    onImageLoad?.(img);
  };

  const onChange = (_: Crop, p: Crop) => {
    setCrop(p);
    if (p.unit === "px") {
      onChangeCrop({
        x: p.x ?? 0,
        y: p.y ?? 0,
        width: p.width ?? 0,
        height: p.height ?? 0,
      });
    }
  };

  return (
    <div className={frameClassName}>
      <ReactCrop aspect={aspect} crop={crop} keepSelection onChange={onChange}>
        <img
          alt="crop-source"
          className="max-h-[70vh] object-contain"
          draggable={false}
          onLoad={handleImageLoad}
          src={src}
        />
      </ReactCrop>
    </div>
  );
};
