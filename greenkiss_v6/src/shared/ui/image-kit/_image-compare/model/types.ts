export type LoadedImage = {
  url: string;
  width: number;
  height: number;
  aspect: number;
};

export type ImageCompareConfig = {
  left: File;
  right: File;
  className?: string;
};
