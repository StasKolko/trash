"use client";

import { useEffect, useState } from "react";
import { nearlyEqual } from "../_lib/aspect";
import {
  createObjectUrl,
  detectBlobMeta,
  imageLikeToBlob,
  revokeObjectUrlSafe,
} from "../_lib/image-utils";

type ImageLike = Blob | File | string;

export const ImageCompare = ({
  left,
  right,
  maxWidthPx = 1024,
  widthPercent = 90,
  strictAspectCheck = true,
}: {
  left: ImageLike;
  right: ImageLike;
  maxWidthPx?: number;
  widthPercent?: number;
  strictAspectCheck?: boolean;
}) => {
  const [leftUrl, setLeftUrl] = useState<string>();
  const [rightUrl, setRightUrl] = useState<string>();
  const [containerWidth, setContainerWidth] = useState<number>(maxWidthPx);
  const [dividerX, setDividerX] = useState<number>(0.5);

  useEffect(() => {
    let canceled = false;
    (async () => {
      const [lb, rb] = await Promise.all([
        imageLikeToBlob(left),
        imageLikeToBlob(right),
      ]);
      const [lm, rm] = await Promise.all([
        detectBlobMeta(lb),
        detectBlobMeta(rb),
      ]);
      if (strictAspectCheck && !nearlyEqual(lm.aspect, rm.aspect)) {
        // В DEV режиме можно кидать ошибку
        if (process.env.NODE_ENV !== "production") {
          console.error("ImageCompare: аспекты изображений не совпадают", {
            left: lm,
            right: rm,
          });
          throw new Error(
            "ImageCompare: изображения должны иметь одинаковый формат (соотношение сторон)",
          );
        }
      }
      const lurl = createObjectUrl(lb);
      const rurl = createObjectUrl(rb);
      if (!canceled) {
        setLeftUrl(lurl);
        setRightUrl(rurl);
        // ширина — мин(90vw, maxWidthPx, фактическая ширина картинок)
        const realW = Math.min(lm.width, rm.width);
        const vw =
          typeof window !== "undefined" ? window.innerWidth : maxWidthPx;
        const width = Math.min((vw * widthPercent) / 100, maxWidthPx, realW);
        setContainerWidth(Math.max(240, width));
      } else {
        revokeObjectUrlSafe(lurl);
        revokeObjectUrlSafe(rurl);
      }
    })();
    return () => {
      canceled = true;
      revokeObjectUrlSafe(leftUrl);
      revokeObjectUrlSafe(rightUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, right, maxWidthPx, widthPercent]);

  if (!leftUrl || !rightUrl) return null;

  return (
    <div
      className="relative select-none"
      onPointerDown={(e) => {
        const rect = (
          e.currentTarget as HTMLDivElement
        ).getBoundingClientRect();
        const update = (clientX: number) => {
          const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
          setDividerX(x / rect.width);
        };
        update(e.clientX);
        const move = (ev: PointerEvent) => update(ev.clientX);
        const up = () => {
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
        };
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
      }}
      style={{ width: containerWidth, touchAction: "none" }}
    >
      <div className="relative overflow-hidden rounded-md border">
        <img
          alt="left"
          className="block w-full h-auto pointer-events-none select-none"
          src={leftUrl}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ clipPath: `inset(0 0 0 ${Math.round(dividerX * 100)}%)` }}
        >
          <img alt="right" className="block w-full h-auto" src={rightUrl} />
        </div>

        {/* Divider */}
        <div
          className="absolute top-0 bottom-0"
          style={{ left: `${dividerX * 100}%`, transform: "translateX(-50%)" }}
        >
          <div className="w-0.5 h-full bg-white/80 shadow-[0_0_0_1px_rgba(0,0,0,0.5)]" />
          <button
            aria-label="Перетащите для сравнения"
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center shadow"
            type="button"
          >
            ||
          </button>
        </div>
      </div>
    </div>
  );
};
