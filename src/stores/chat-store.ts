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
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  attachments?: Attachment[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

interface ChatState {
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  attachments: Attachment[];
  addConversation: () => string;
  switchConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, content: string) => void;
  setLoading: (loading: boolean) => void;
  addAttachment: (attachment: Attachment) => void;
  removeAttachment: (id: string) => void;
  clearAttachments: () => void;
  getCurrentConversation: () => Conversation | null;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      currentConversationId: null,
      isLoading: false,
      attachments: [],
      
      addConversation: () => {
        const id = `conv-${Date.now()}`;
        const newConversation: Conversation = {
          id,
          title: 'New Chat',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          currentConversationId: id,
        }));
        return id;
      },
      
      switchConversation: (id) => {
        set({ currentConversationId: id });
      },
      
      deleteConversation: (id) => {
        set((state) => {
          const newConversations = state.conversations.filter((c) => c.id !== id);
          return {
            conversations: newConversations,
            currentConversationId: state.currentConversationId === id 
              ? (newConversations[0]?.id || null) 
              : state.currentConversationId,
          };
        });
      },
      
      addMessage: (message) => {
        set((state) => {
          if (!state.currentConversationId) {
            // Auto-create conversation if none exists
            const convId = `conv-${Date.now()}`;
            const title = message.role === 'user' 
              ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
              : 'New Chat';
            const newConversation: Conversation = {
              id: convId,
              title,
              messages: [message],
              createdAt: Date.now(),
              updatedAt: Date.now(),
            };
            return {
              conversations: [newConversation, ...state.conversations],
              currentConversationId: convId,
            };
          }
          
          return {
            conversations: state.conversations.map((conv) =>
              conv.id === state.currentConversationId
                ? { 
                    ...conv, 
                    messages: [...conv.messages, message],
                    updatedAt: Date.now(),
                    title: conv.messages.length === 0 && message.role === 'user'
                      ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                      : conv.title,
                  }
                : conv
            ),
          };
        });
      },
      
      updateMessage: (id, content) => {
        set((state) => {
          if (!state.currentConversationId) return state;
          return {
            conversations: state.conversations.map((conv) =>
              conv.id === state.currentConversationId
                ? { 
                    ...conv, 
                    messages: conv.messages.map((m) =>
                      m.id === id ? { ...m, content } : m
                    ),
                  }
                : conv
            ),
          };
        });
      },
      
      setLoading: (isLoading) => set({ isLoading }),
      
      addAttachment: (attachment) =>
        set((state) => ({ attachments: [...state.attachments, attachment] })),
      
      removeAttachment: (id) =>
        set((state) => ({
          attachments: state.attachments.filter((a) => a.id !== id),
        })),
      
      clearAttachments: () => set({ attachments: [] }),
      
      getCurrentConversation: () => {
        const state = get();
        return state.conversations.find((c) => c.id === state.currentConversationId) || null;
      },
    }),
    {
      name: 'gwen-chat',
    }
  )
);
