import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { createChat as createChatApi, getChatHistory } from '@/apis/chat-api';
import { toast } from '@/components/toast';
import { useChatStore } from '@/store/chat-store';
import { useMessageStore } from '@/store/message-store';
import { useStreaming } from './use-streaming';
import { useAuth } from './use-auth';
import { useApi } from './use-api';
import { STREAM_STATUS } from '@/enums';
import type { NewChat, Chat, PaginationParams, NewChatPayload, PaginatedResponse } from '@/types';

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
  const { user } = useAuth();
  const { get } = useApi();

  const createChat = useCallback(
    async (newChat: NewChat) => {
      if (!user) {
        toast({
          type: 'error',
          description: 'Informations utilisateur non disponibles',
        });
        return;
      }

      try {
        clearMessages();

        const payload: NewChatPayload = {
          title: newChat.title,
          messages: [{ content: newChat.title, is_user: true }],
        };
        await startStreaming(
          () => createChatApi(payload, user, []),
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
    [startStreaming, clearMessages, user],
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
    queryFn: async ({ pageParam }: { pageParam?: number | string }) => {
      const pageSize = DEFAULT_PAGE_SIZE;
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        ...(pageParam && { start_id: pageParam.toString() }),
        ...(search && { search }),
      });

      const response = await get<PaginatedResponse<Chat>>(`/api/chat?${params}`);
      
      if (!response.success) {
        throw new Error(response.error || 'Erreur lors de la récupération de l\'historique');
      }
      
      return response.data!;
    },
    getNextPageParam: (lastPage: PaginatedResponse<Chat>) => {
      if (lastPage.has_more && lastPage.items.length > 0) {
        // Utiliser l'ID du dernier chat comme start_id pour la prochaine requête
        const lastChat = lastPage.items[lastPage.items.length - 1];
        return lastChat.id;
      }
      return undefined;
    },
    initialPageParam: undefined,
    enabled,
  });

  // Get all chats from React Query data
  const allChatsFromQuery = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.items);
  }, [data]);

  // Sync fetched data with chat store - but only for non-search scenarios
  useEffect(() => {
    if (data?.pages && !search) {
      const allChats = data.pages.flatMap((page) => page.items);

      // Only add chats that aren't already in the store to avoid duplicates
      const existingChatIds = new Set(chats.map((chat) => chat.id));
      const newChats = allChats.filter((chat) => !existingChatIds.has(chat.id));

      if (newChats.length > 0) {
        addChatsToEnd(newChats);
      }
    }
  }, [data, chats, addChatsToEnd, search]);

  // Clear store when search changes (but not on initial load)
  useEffect(() => {
    if (search !== undefined && search !== '') {
      // For search, we'll use the query data directly instead of the store
      return;
    }
  }, [search]);

  // Reset store when search is cleared to show all chats again
  useEffect(() => {
    if (search === '') {
      // When search is cleared, we should show all chats from the store
      // The store will be populated by the first useEffect when data is loaded
    }
  }, [search]);

  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Use chats from query when searching, otherwise from store
  const displayChats = search ? allChatsFromQuery : chats;

  // Use chats from store instead of React Query data
  const hasReachedEnd = !hasNextPage;
  const hasEmptyChatHistory = !isLoading && chats.length === 0;
  const needsManualLoad =
    hasNextPage && !isFetchingNextPage && displayChats.length < 15;

  return {
    createChat,
    isCreateChatPending:
      streamStatus === STREAM_STATUS.STREAMING || streamStatus === STREAM_STATUS.STARTING || streamStatus === STREAM_STATUS.TRANSITIONING,
    chatMessages,

    chats: displayChats,
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
