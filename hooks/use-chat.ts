import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { createChat as createChatApi, getChatHistory } from '@/apis/chat-api';
import { toast } from '@/components/toast';
import { useChatStore } from '@/store/chat-store';
import { useMessageStore } from '@/store/message-store';
import { useStreaming } from './use-streaming';
import { STREAM_STATUS } from '@/enums';

const DEFAULT_PAGE_SIZE = 20;

interface UseChatOptions {
  enabled?: boolean;
  search?: string;
}

export const useChat = ({ enabled = true, search }: UseChatOptions = {}) => {
  const { chats, addChatsToEnd } = useChatStore();
  const {
    messages: chatMessages,
    clearMessages,
    streamStatus,
  } = useMessageStore();
  const { startStreaming } = useStreaming();

  const createChat = useCallback(
    async (newChat: NewChat) => {
      try {
        clearMessages();

        const payload: NewChatPayload = {
          title: newChat.title,
          messages: [{ content: newChat.title, is_user: true }],
        };
        await startStreaming(
          () => createChatApi(payload),
          newChat.title,
        );
      } catch (error) {
        console.error(error);
        toast({
          type: 'error',
          description:
            'Une erreur est survenue lors de la création de la conversation',
        });
      }
    },
    [startStreaming, clearMessages],
  );

  // Infinite chat history query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['chat', 'history', { search }],
    queryFn: ({ pageParam = 1 }: { pageParam: number }) => {
      const pageSize = DEFAULT_PAGE_SIZE;

      return getChatHistory({
        search,
        page: pageParam,
        limit: pageSize,
      });
    },
    getNextPageParam: (lastPage: PaginateList<Chat>) => {
      if (lastPage.page < lastPage.pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled,
  });

  // Sync fetched data with chat store
  useEffect(() => {
    if (data?.pages) {
      const allChats = data.pages.flatMap((page) => page.items);

      // Only add chats that aren't already in the store to avoid duplicates
      const existingChatIds = new Set(chats.map((chat) => chat.id));
      const newChats = allChats.filter((chat) => !existingChatIds.has(chat.id));

      if (newChats.length > 0) {
        addChatsToEnd(newChats);
      }
    }
  }, [data, chats, addChatsToEnd]);

  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Use chats from store instead of React Query data
  const hasReachedEnd = !hasNextPage;
  const hasEmptyChatHistory = !isLoading && chats.length === 0;
  const needsManualLoad =
    hasNextPage && !isFetchingNextPage && chats.length < 15;

  return {
    createChat,
    isCreateChatPending:
      streamStatus === STREAM_STATUS.STREAMING || streamStatus === STREAM_STATUS.STARTING || streamStatus === STREAM_STATUS.TRANSITIONING,
    chatMessages,

    chats,
    isLoading,
    isFetchingNextPage,
    hasReachedEnd,
    hasEmptyChatHistory,
    needsManualLoad,
    handleLoadMore,
    refetch,
    isError,
    error,
    streamStatus,
  } as const;
};
