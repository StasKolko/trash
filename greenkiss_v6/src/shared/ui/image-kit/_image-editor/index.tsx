"use client";

import { useEffect } from "react";
import { ImageEditorProvider } from "./model/context";
import { useImageEditorStore } from "./model/store";
import type { ImageEditorProps } from "./model/types";
import { CompressionDialog } from "./ui/compression-dialog";
import { ImageEditorDialog } from "./ui/dialog";
import { ImageEditorTrigger } from "./ui/trigger";

export function ImageEditor(props: ImageEditorProps) {
  const initFromProps = useImageEditorStore((state) => state.initFromProps);

  useEffect(() => {
    initFromProps({
      items: props.images,
      minImages: props.minImages,
      maxImages: props.maxImages,
      minSize: props.minSize,
      maxSize: props.maxSize,
    });
  }, [
    initFromProps,
    props.images,
    props.minImages,
    props.maxImages,
    props.minSize,
    props.maxSize,
  ]);

  return (
    <ImageEditorProvider value={props}>
      <div className="inline-block">
        <ImageEditorTrigger />
        <ImageEditorDialog />
        <CompressionDialog />
      </div>
    </ImageEditorProvider>
  );
}
