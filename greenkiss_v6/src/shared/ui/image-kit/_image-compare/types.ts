export type ImageDimensions = {
  width: number;
  height: number;
  aspectRatio: number;
  src: string;
  isObjectUrl: boolean; // мы ли создавали URL.createObjectURL
};

export type ImageLike = Blob | File | string;
