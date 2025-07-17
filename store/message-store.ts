import { create } from 'zustand';
import { STREAM_STATUS } from '@/enums';

type MessageState = {
  messages: Message[];
  streamStatus: STREAM_STATUS;
  currentStreamingMessageId: string | null;
};

type MessageActions = {
  addMessages: (msgList: Message[]) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  updateStreamingMessage: (id: string, content: string) => void;
  replaceMessageId: (oldId: string, newId: string) => void;
  clearMessages: () => void;
  setMessages: (messages: Message[]) => void;
  setStreamStatus: (status: STREAM_STATUS) => void;
  setCurrentStreamingMessageId: (id: string | null) => void;
  completeStreamingMessage: (id: string, finalContent: string) => void;
};

export const useMessageStore = create<MessageState & MessageActions>((set) => ({
  messages: [],
  streamStatus: STREAM_STATUS.IDLE,
  currentStreamingMessageId: null,

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

  updateStreamingMessage: (id, content) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id
          ? { ...msg, content, isLoading: false }
          : msg,
      ),
    })),

  replaceMessageId: (oldId, newId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === oldId ? { ...msg, id: newId } : msg,
      ),
    })),

  clearMessages: () =>
    set({
      messages: [],
      streamStatus: STREAM_STATUS.IDLE,
      currentStreamingMessageId: null,
    }),

  setMessages: (messages: Message[]) => set({ messages }),

  setStreamStatus: (status: STREAM_STATUS) => set({ streamStatus: status }),

  setCurrentStreamingMessageId: (id: string | null) =>
    set({ currentStreamingMessageId: id }),

  completeStreamingMessage: (id, finalContent) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id
          ? {
              ...msg,
              content: finalContent,
              isStreaming: false,
              isComplete: true,
            }
          : msg,
      ),
      streamStatus: STREAM_STATUS.COMPLETED,
      currentStreamingMessageId: null,
    })),
}));
