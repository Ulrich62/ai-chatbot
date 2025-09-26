import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Chat } from '@/types';

interface ChatState {
  chats: Chat[];
  selectedChatId: string | null;
  isLoading: boolean;
}

interface ChatActions {
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  addChatsToEnd: (chats: Chat[]) => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  deleteChat: (id: string) => void;
  clearChats: () => void;
  setSelectedChatId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
}

// Selectors for optimized re-renders
export const chatSelectors = {
  chats: (state: ChatState) => state.chats,
  selectedChatId: (state: ChatState) => state.selectedChatId,
  isLoading: (state: ChatState) => state.isLoading,
  selectedChat: (state: ChatState) => state.chats.find(chat => chat.id === state.selectedChatId),
  recentChats: (state: ChatState) => state.chats.slice(0, 10), // First 10 chats
  hasChats: (state: ChatState) => state.chats.length > 0,
  chatCount: (state: ChatState) => state.chats.length,
};

export const useChatStore = create<ChatState & ChatActions>()(
  subscribeWithSelector(
    immer((set) => ({
      chats: [],
      selectedChatId: null,
      isLoading: false,

      setChats: (chats) =>
        set((state) => {
          state.chats = chats;
        }),

      addChat: (chat) =>
        set((state) => {
          state.chats.unshift(chat); // Add to beginning for newest first
        }),

      addChatsToEnd: (chats) =>
        set((state) => {
          state.chats.push(...chats); // Add to end for pagination
        }),

      updateChat: (id, updates) =>
        set((state) => {
          const chatIndex = state.chats.findIndex((chat) => chat.id === id);
          if (chatIndex !== -1) {
            Object.assign(state.chats[chatIndex], updates);
          }
        }),

      deleteChat: (id) =>
        set((state) => {
          state.chats = state.chats.filter((chat) => chat.id !== id);
          if (state.selectedChatId === id) {
            state.selectedChatId = null;
          }
        }),

      clearChats: () =>
        set((state) => {
          state.chats = [];
          state.selectedChatId = null;
        }),

      setSelectedChatId: (id) =>
        set((state) => {
          state.selectedChatId = id;
        }),

      setLoading: (loading) =>
        set((state) => {
          state.isLoading = loading;
        }),
    }))
  )
);
