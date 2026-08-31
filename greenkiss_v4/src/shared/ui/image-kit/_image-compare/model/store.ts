"use client";

import type { StoreApi } from "zustand/vanilla";
import { createStore } from "zustand/vanilla";
import type { LoadedImage } from "./types";

export type ImageCompareState = {
  slider: number; // 0–100
  error: string | null;
  leftImg: LoadedImage | null;
  rightImg: LoadedImage | null;
  aspectRatio: number | null;
};

export type ImageCompareActions = {
  setSlider: (value: number) => void;
  setError: (error: string | null) => void;
  setLeftImg: (img: LoadedImage | null) => void;
  setRightImg: (img: LoadedImage | null) => void;
  setAspectRatio: (ratio: number | null) => void;
};

export type ImageCompareStore = ImageCompareState & ImageCompareActions;

export type ImageCompareStoreApi = StoreApi<ImageCompareStore>;

export const createImageCompareStore = (): ImageCompareStoreApi =>
  createStore<ImageCompareStore>()((set, get) => ({
    // RUNTIME STATE
    slider: 50,
    error: null,
    leftImg: null,
    rightImg: null,
    aspectRatio: null,

    setSlider: (value: number) => {
      if (value < 0 || value > 100) return;
      if (value === get().slider) return;

      set({ slider: value });
    },

    setError: (error: string | null) => {
      set({ error });
    },

    setLeftImg: (img: LoadedImage | null) => {
      set({ leftImg: img });
    },

    setRightImg: (img: LoadedImage | null) => {
      set({ rightImg: img });
    },

    setAspectRatio: (ratio: number | null) => {
      set({ aspectRatio: ratio });
    },
  }));
