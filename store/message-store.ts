import { create } from 'zustand';

type MessageState = {
  messages: Message[];
};

type MessageActions = {
  addMessages: (msgList: Message[]) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  replaceMessageId: (oldId: string, newId: string) => void;
  clearMessages: () => void;
  setMessages: (messages: Message[]) => void;
};

export const useMessageStore = create<MessageState & MessageActions>((set) => ({
  messages: [],

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

  clearMessages: () => set({ messages: [] }),

  setMessages: (messages: Message[]) => set({ messages }),
}));
