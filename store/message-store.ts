import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { STREAM_STATUS } from '@/enums';
import type { Message } from '@/types';

interface MessageState {
  messages: Message[];
  streamStatus: STREAM_STATUS;
  currentStreamingMessageId: string | null;
}

interface MessageActions {
  addMessages: (msgList: Message[]) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
  updateStreamingMessage: (id: string, content: string) => void;
  replaceMessageId: (oldId: string, newId: string) => void;
  clearMessages: () => void;
  setMessages: (messages: Message[]) => void;
  setStreamStatus: (status: STREAM_STATUS) => void;
  setCurrentStreamingMessageId: (id: string | null) => void;
  completeStreamingMessage: (id: string, finalContent: string) => void;
}

// Selectors for optimized re-renders
export const messageSelectors = {
  messages: (state: MessageState) => state.messages,
  streamStatus: (state: MessageState) => state.streamStatus,
  currentStreamingMessageId: (state: MessageState) => state.currentStreamingMessageId,
  lastMessage: (state: MessageState) => state.messages[state.messages.length - 1],
  userMessages: (state: MessageState) => state.messages.filter(msg => msg.is_user),
  botMessages: (state: MessageState) => state.messages.filter(msg => !msg.is_user),
  isLoading: (state: MessageState) => state.streamStatus === STREAM_STATUS.STREAMING || state.streamStatus === STREAM_STATUS.STARTING,
  hasMessages: (state: MessageState) => state.messages.length > 0,
};

export const useMessageStore = create<MessageState & MessageActions>()(
  subscribeWithSelector(
    immer((set) => ({
      messages: [],
      streamStatus: STREAM_STATUS.IDLE,
      currentStreamingMessageId: null,

      addMessages: (msgList) =>
        set((state) => {
          state.messages.push(...msgList);
        }),

      updateMessage: (id, updates) =>
        set((state) => {
          const messageIndex = state.messages.findIndex((msg) => msg.id === id);
          if (messageIndex !== -1) {
            Object.assign(state.messages[messageIndex], updates);
          }
        }),

      updateStreamingMessage: (id, content) =>
        set((state) => {
          const messageIndex = state.messages.findIndex((msg) => msg.id === id);
          if (messageIndex !== -1) {
            state.messages[messageIndex].content = content;
            state.messages[messageIndex].isLoading = false;
          }
        }),

      replaceMessageId: (oldId, newId) =>
        set((state) => {
          const messageIndex = state.messages.findIndex((msg) => msg.id === oldId);
          if (messageIndex !== -1) {
            state.messages[messageIndex].id = newId;
          }
        }),

      clearMessages: () =>
        set((state) => {
          state.messages = [];
          state.streamStatus = STREAM_STATUS.IDLE;
          state.currentStreamingMessageId = null;
        }),

      setMessages: (messages) =>
        set((state) => {
          state.messages = messages;
        }),

      setStreamStatus: (status) =>
        set((state) => {
          state.streamStatus = status;
        }),

      setCurrentStreamingMessageId: (id) =>
        set((state) => {
          state.currentStreamingMessageId = id;
        }),

      completeStreamingMessage: (id, finalContent) =>
        set((state) => {
          const messageIndex = state.messages.findIndex((msg) => msg.id === id);
          if (messageIndex !== -1) {
            state.messages[messageIndex].content = finalContent;
            state.messages[messageIndex].isStreaming = false;
            state.messages[messageIndex].isComplete = true;
          }
          state.streamStatus = STREAM_STATUS.COMPLETED;
          state.currentStreamingMessageId = null;
        }),
    }))
  )
);
