import { create } from 'zustand';

type ChatState = {
  chats: Chat[];
};

type ChatActions = {
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  addChatsToEnd: (chats: Chat[]) => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  clearChats: () => void;
};

export const useChatStore = create<ChatState & ChatActions>((set) => ({
  chats: [],

  setChats: (chats) => set({ chats }),

  addChat: (chat) =>
    set((state) => ({
      chats: [chat, ...state.chats], // Add to top for newest first
    })),

  addChatsToEnd: (chats) =>
    set((state) => ({
      chats: [...state.chats, ...chats], // Add to end for pagination
    })),

  updateChat: (id, updates) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === id ? { ...chat, ...updates } : chat,
      ),
    })),

  clearChats: () => set({ chats: [] }),
}));
