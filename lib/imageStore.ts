// stores/useImageStore.ts
import { create } from 'zustand';

type ImageItem = {
  name: string;
  url: string;
};

type ImageStore = {
  images: ImageItem[];
  setImages: (imgs: ImageItem[]) => void;
  notifyUpdate: boolean;
  setNotifyUpdate: (value: boolean) => void;
};

export const useImageStore = create<ImageStore>((set) => ({
  images: [],
  setImages: (imgs) => set({ images: imgs }),
  notifyUpdate: false,
  setNotifyUpdate: (value) => set({ notifyUpdate: value }),
}));
