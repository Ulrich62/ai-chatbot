import {
  createChat,
  getChat,
  getChatHistory,
  getChatMessages,
  sendMessage,
} from '@/apis/chat-api';
import { DEFAULT_PAGE_SIZE } from '@/constants/global';
import { createQueryKeyStore } from '@lukemorales/query-key-factory';

interface BasePaginationParams {
  page?: number;
  page_size?: number;
  search?: string;
}

const createPaginatedQueryFn = <T, P extends BasePaginationParams>(
  fetcher: (params: P) => Promise<PaginateList<T>>,
  params?: P,
) => {
  return ({ pageParam = 1 }: { pageParam: number }) => {
    return fetcher({
      ...(params as P),
      page: pageParam,
      limit: DEFAULT_PAGE_SIZE,
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
      mutationFn: (newChat: NewChatPayload) => createChat(newChat),
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
      mutationFn: (message: NewMessage) => sendMessage(chatId, [message]),
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
