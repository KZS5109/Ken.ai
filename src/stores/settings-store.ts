import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PreviewItem {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'code' | 'file';
  content: string;
  language?: string;
}

interface SettingsState {
  theme: 'light' | 'dark';
  showPreviewPanel: boolean;
  previewItems: PreviewItem[];
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  togglePreviewPanel: () => void;
  setPreviewPanel: (show: boolean) => void;
  addPreviewItem: (item: PreviewItem) => void;
  removePreviewItem: (id: string) => void;
  clearPreviewItems: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'dark',
      showPreviewPanel: false,
      previewItems: [],
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
      setTheme: (theme) => set({ theme }),
      togglePreviewPanel: () =>
        set((state) => ({ showPreviewPanel: !state.showPreviewPanel })),
      setPreviewPanel: (show) => set({ showPreviewPanel: show }),
      addPreviewItem: (item) =>
        set((state) => ({ previewItems: [...state.previewItems, item] })),
      removePreviewItem: (id) =>
        set((state) => ({ previewItems: state.previewItems.filter((i) => i.id !== id) })),
      clearPreviewItems: () => set({ previewItems: [] }),
    }),
    {
      name: 'gwen-settings',
    }
  )
);
