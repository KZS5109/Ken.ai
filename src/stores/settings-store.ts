import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  n8nEndpoint: string;
  n8nApiKey: string;
  theme: 'light' | 'dark';
  setN8NEndpoint: (endpoint: string) => void;
  setN8NApiKey: (key: string) => void;
  toggleTheme: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      n8nEndpoint: 'https://kzs5109-n8n.hf.space',
      n8nApiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhOWEzYTEwZS1kMzMxLTQyMzMtOTA4Yi1jNGRmYmY0OGM2MWMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiYjc1NGJjZmMtYzU5Yi00NDIyLWFhMzAtMjU5ZTNiZTliMDZjIiwiaWF0IjoxNzcxNjAyOTE5fQ.E6WZ4-7RDjKbXpzjzT1qgySaZqcq2SRaH2GPHwVUUzg',
      theme: 'dark',
      setN8NEndpoint: (endpoint) => set({ n8nEndpoint: endpoint }),
      setN8NApiKey: (key) => set({ n8nApiKey: key }),
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'gwen-settings',
    }
  )
);
