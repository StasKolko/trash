"use client";

export type EditableImageOrder = number;

export type EditableImage = {
  id: string;
  file: File;
  order: EditableImageOrder;
};

export type ImageEditorProps = {
  images: EditableImage[];
  minImages: number;
  maxImages: number;
  minSize: number; // bytes
  maxSize: number; // bytes
  onChange: (images: EditableImage[]) => void;
};
