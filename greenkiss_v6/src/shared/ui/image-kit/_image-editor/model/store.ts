"use client";

import { create } from "zustand";
import { compressImageFile } from "../lib/image-compression";
import type { EditableImage } from "./types";

export type ImageEditorState = {
  items: EditableImage[];
  initialItems: EditableImage[];
  isDialogOpen: boolean;
  isCompressing: boolean;
  hasCountError: boolean;
  hasSizeError: boolean;
  activeCompressionItemId: string | null;
  compressedPreviewFile: File | null;

  // для валидации нужны лимиты
  minImages: number;
  maxImages: number;
  minSize: number;
  maxSize: number;

  // чтобы различать "первое возникновение" ошибок
  _wasCountErrorShown: boolean;
  _wasSizeErrorShown: boolean;
};

export type ImageEditorActions = {
  initFromProps: (params: {
    items: EditableImage[];
    minImages: number;
    maxImages: number;
    minSize: number;
    maxSize: number;
  }) => void;
  openDialog: () => void;
  closeDialog: () => void;
  setItems: (items: EditableImage[]) => void;
  moveItemUp: (id: string) => void;
  moveItemDown: (id: string) => void;
  removeItem: (id: string) => void;
  addItemsFromFiles: (files: File[]) => void;
  startCompression: (id: string) => Promise<void>;
  cancelCompression: () => void;
  saveCompression: () => void;
  validateItems: () => void;
  resetToInitial: () => void;
};

export type ImageEditorStore = ImageEditorState & ImageEditorActions;

function normalizeOrder(items: EditableImage[]): EditableImage[] {
  return [...items]
    .sort((a, b) => a.order - b.order)
    .map((item, index) => ({ ...item, order: index }));
}

export const useImageEditorStore = create<ImageEditorStore>((set, get) => ({
  items: [],
  initialItems: [],
  isDialogOpen: false,
  isCompressing: false,
  hasCountError: false,
  hasSizeError: false,
  activeCompressionItemId: null,
  compressedPreviewFile: null,

  minImages: 0,
  maxImages: Infinity,
  minSize: 0,
  maxSize: Infinity,

  _wasCountErrorShown: false,
  _wasSizeErrorShown: false,

  initFromProps: ({ items, minImages, maxImages, minSize, maxSize }) => {
    const normalized = normalizeOrder(items);
    set({
      items: normalized,
      initialItems: normalized,
      minImages,
      maxImages,
      minSize,
      maxSize,
    });
  },

  openDialog: () => {
    set({ isDialogOpen: true });
  },

  closeDialog: () => {
    const { isCompressing } = get();
    if (isCompressing) {
      // ignore close while compressing
      return;
    }
    set({ isDialogOpen: false });
  },

  setItems: (items: EditableImage[]) => {
    set({ items: normalizeOrder(items) });
  },

  moveItemUp: (id: string) => {
    const { items } = get();
    const sorted = normalizeOrder(items);
    const index = sorted.findIndex((item) => item.id === id);
    if (index <= 0) return;

    const newItems = [...sorted];
    const tmp = newItems[index - 1];
    newItems[index - 1] = { ...newItems[index], order: tmp.order };
    newItems[index] = { ...tmp, order: newItems[index].order };

    set({ items: normalizeOrder(newItems) });
  },

  moveItemDown: (id: string) => {
    const { items } = get();
    const sorted = normalizeOrder(items);
    const index = sorted.findIndex((item) => item.id === id);
    if (index === -1 || index >= sorted.length - 1) return;

    const newItems = [...sorted];
    const tmp = newItems[index + 1];
    newItems[index + 1] = { ...newItems[index], order: tmp.order };
    newItems[index] = { ...tmp, order: newItems[index].order };

    set({ items: normalizeOrder(newItems) });
  },

  removeItem: (id: string) => {
    const { items } = get();
    const newItems = items.filter((item) => item.id !== id);
    set({ items: normalizeOrder(newItems) });
  },

  addItemsFromFiles: (files: File[]) => {
    const { items } = get();
    const maxOrder =
      items.length === 0
        ? -1
        : Math.max(...items.map((item) => item.order ?? 0));
    const newItems: EditableImage[] = files.map((file, idx) => ({
      id: crypto.randomUUID(),
      file,
      order: maxOrder + 1 + idx,
    }));
    set({ items: normalizeOrder([...items, ...newItems]) });
  },

  startCompression: async (id: string) => {
    const { items, isCompressing, minSize, maxSize } = get();
    if (isCompressing) return;

    const target = items.find((item) => item.id === id);
    if (!target) {
      console.error("ImageEditor: item for compression not found");
      return;
    }

    set({
      isCompressing: true,
      activeCompressionItemId: id,
      compressedPreviewFile: null,
    });

    try {
      // simple heuristic: try to make file smaller but still reasonable quality
      const maxSizeMB =
        Math.max(minSize, Math.min(target.file.size, maxSize)) / 1024 / 1024;

      const compressed = await compressImageFile(target.file, {
        maxSizeMB: maxSizeMB || 1,
        maxWidthOrHeight: 2048,
        initialQuality: 0.8,
        useWebWorker: true,
      });

      set({ compressedPreviewFile: compressed });
    } catch (error) {
      console.error("Image compression failed", error);
      // showErrorToast("Не удалось сжать изображение. Попробуйте ещё раз.");
      set({
        isCompressing: false,
        activeCompressionItemId: null,
        compressedPreviewFile: null,
      });
    }
  },

  cancelCompression: () => {
    const { isCompressing } = get();
    if (!isCompressing) return;
    set({
      isCompressing: false,
      activeCompressionItemId: null,
      compressedPreviewFile: null,
    });
  },

  saveCompression: () => {
    const { items, activeCompressionItemId, compressedPreviewFile } = get();

    if (!activeCompressionItemId || !compressedPreviewFile) {
      console.error("ImageEditor: no active compression item or preview file");
      set({
        isCompressing: false,
        activeCompressionItemId: null,
        compressedPreviewFile: null,
      });
      return;
    }

    const newItems = items.map((item) =>
      item.id === activeCompressionItemId
        ? {
            ...item,
            file: compressedPreviewFile,
          }
        : item,
    );

    set({
      items: normalizeOrder(newItems),
      isCompressing: false,
      activeCompressionItemId: null,
      compressedPreviewFile: null,
    });
  },

  validateItems: () => {
    const {
      items,
      minImages,
      maxImages,
      minSize,
      maxSize,
      hasCountError,
      hasSizeError,
      _wasCountErrorShown,
      _wasSizeErrorShown,
    } = get();

    const countError = items.length < minImages || items.length > maxImages;
    const sizeError = items.some(
      (item) => item.file.size < minSize || item.file.size > maxSize,
    );

    const nextState: Partial<ImageEditorState> = {};

    if (hasCountError !== countError) {
      nextState.hasCountError = countError;
    }

    if (hasSizeError !== sizeError) {
      nextState.hasSizeError = sizeError;
    }

    if (!hasCountError && countError && !_wasCountErrorShown) {
      nextState._wasCountErrorShown = true;
    }

    if (!hasSizeError && sizeError && !_wasSizeErrorShown) {
      nextState._wasSizeErrorShown = true;
    }

    if (Object.keys(nextState).length > 0) {
      set(nextState as ImageEditorState);
    }
  },

  resetToInitial: () => {
    const { initialItems } = get();
    set({
      items: normalizeOrder(initialItems),
      isCompressing: false,
      activeCompressionItemId: null,
      compressedPreviewFile: null,
    });
  },
}));
