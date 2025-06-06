import { create } from 'zustand';

type ChatState = {
  messages: Message[];
  currentChat: Chat | null;
};

type ChatActions = {
  addMessages: (msgList: Message[]) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  replaceMessageId: (oldId: string, newId: string) => void;
  setCurrentChat: (chat: Chat) => void;
  clearMessages: () => void;
  setMessages: (messages: Message[]) => void;
};

export const useChatStore = create<ChatState & ChatActions>((set) => ({
  messages: [],
  currentChat: null,
  addMessages: (msgList) =>
    set((state) => ({
      messages: [...state.messages, ...msgList],
    })),
  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg,
      ),
    })),
  replaceMessageId: (oldId, newId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === oldId ? { ...msg, id: newId } : msg,
      ),
    })),
  setCurrentChat: (chat) => set({ currentChat: chat }),
  clearMessages: () => set({ messages: [] }),
  setMessages: (messages: Message[]) => set({ messages }),
}));
