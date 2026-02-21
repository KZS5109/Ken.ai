import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Attachment {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'file';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  toolCall?: {
    name: string;
    status: 'pending' | 'success' | 'error';
    result?: any;
  };
}

export interface ToolSchema {
  name: string;
  description: string;
  endpoint: string;
  active: boolean;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  toolMode: boolean;
  availableTools: ToolSchema[];
  n8nConnected: boolean;
  attachments: Attachment[];
  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  toggleToolMode: () => void;
  setAvailableTools: (tools: ToolSchema[]) => void;
  setN8NConnected: (connected: boolean) => void;
  addAttachment: (attachment: Attachment) => void;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      error: null,
      toolMode: false,
      availableTools: [],
      n8nConnected: false,
      attachments: [],
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      updateMessage: (id, content) =>
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === id ? { ...m, content } : m
          ),
        })),
      clearMessages: () => set({ messages: [] }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      toggleToolMode: () => set((state) => ({ toolMode: !state.toolMode })),
      setAvailableTools: (tools) => set({ availableTools: tools }),
      setN8NConnected: (connected) => set({ n8nConnected: connected }),
      addAttachment: (attachment) =>
        set((state) => ({ attachments: [...state.attachments, attachment] })),
      removeAttachment: (id) =>
        set((state) => ({
          attachments: state.attachments.filter((a) => a.id !== id),
        })),
      clearAttachments: () => set({ attachments: [] }),
    }),
    {
      name: 'gwen-chat',
      partialize: (state) => ({ toolMode: state.toolMode }),
    }
  )
);
