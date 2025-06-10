import { create } from 'zustand';

type ChatState = {
  chats: Chat[];
  currentChat: Chat | null;
};

type ChatActions = {
  setChats: (chats: Chat[]) => void;
  addChat: (chat: Chat) => void;
  addChatsToEnd: (chats: Chat[]) => void;
  updateChat: (id: string, updates: Partial<Chat>) => void;
  setCurrentChat: (chat: Chat | null) => void;
  clearChats: () => void;
};

export const useChatStore = create<ChatState & ChatActions>((set) => ({
  chats: [],
  currentChat: null,

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

  setCurrentChat: (chat) => set({ currentChat: chat }),

  clearChats: () => set({ chats: [] }),
}));
