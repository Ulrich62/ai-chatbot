import {
  createChat,
  getChat,
  getChatHistory,
  getChatMessages,
  sendMessage,
} from '@/apis/chat-api';
import { DEFAULT_PAGE_SIZE } from '@/constants/global';
import { createQueryKeyStore } from '@lukemorales/query-key-factory';
import type { PaginationParams, PaginatedResponse, NewChat, NewChatPayload, NewMessage } from '@/types';

interface BasePaginationParams {
  limit?: number;
  start_id?: number;
  search?: string;
}

const createPaginatedQueryFn = <T, P extends PaginationParams>(
  fetcher: (params: P) => Promise<PaginatedResponse<T>>,
  params?: P,
) => {
  return ({ pageParam }: { pageParam?: number }) => {
    return fetcher({
      ...(params as P),
      limit: DEFAULT_PAGE_SIZE,
      ...(pageParam && { start_id: pageParam }),
    });
  };
};

export const queries = createQueryKeyStore({
  chat: {
    create: ({
      data,
      params,
    }: {
      data: NewChat;
      params: NewChat;
    }) => ({
      queryKey: ['chat', 'create', params, data] as const,
      mutationFn: (newChat: NewChatPayload) => createChat(newChat, {}, []),
    }),
    history: ({
      params,
    }: {
      params?: BasePaginationParams;
    }) => ({
      queryKey: ['chat', 'history', params] as const,
      queryFn: createPaginatedQueryFn(getChatHistory, params),
    }),
    detail: ({ id }: { id: string }) => ({
      queryKey: ['chat', 'detail', id],
      queryFn: () => getChat(id),
      enabled: !!id,
    }),

    sendMessage: ({
      chatId,
      message,
    }: { chatId: string; message: NewMessage }) => ({
      queryKey: ['chat', 'sendMessage', chatId, message],
      mutationFn: (message: NewMessage) => sendMessage({ chatId, messages: [message], userInfo: {}, existingMessages: [] }),
    }),

    messages: ({
      chatId,
      params,
    }: { chatId: string; params?: BasePaginationParams }) => ({
      queryKey: ['chat', 'messages', chatId, params],
      queryFn: createPaginatedQueryFn(
        (params) => getChatMessages(chatId, params),
        params,
      ),
    }),
  },
});
