import { useInfiniteQuery, useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { createChat as createChatApi, getChatHistory } from '@/apis/chat-api';
import { toast } from '@/components/toast';
import { TEMP_MSG_ID_PREFIX } from '@/constants';
import { useChatStore } from '@/store/chat-store';
import { useMessageStore } from '@/store/message-store';

const DEFAULT_PAGE_SIZE = 20;

interface UseChatOptions {
  enabled?: boolean;
  search?: string;
}

export const useChat = ({ enabled = true, search }: UseChatOptions = {}) => {
  const { chats, addChat, addChatsToEnd, setChats, clearChats } = useChatStore();

  const {
    messages: chatMessages,
    addMessages,
    clearMessages,
  } = useMessageStore.getState();

  const { mutateAsync: createChat, isPending: isCreateChatPending } =
    useMutation<Chat, Error, NewChat>({
      mutationFn: (newChat: NewChat) => {
        // Generate a unique temporary ID
        const tempId = `${TEMP_MSG_ID_PREFIX}_${Date.now()}`;

        clearMessages();

        // Add current message to UI immediately
        addMessages([
          {
            id: tempId,
            content: newChat.title,
            is_user: true,
            created_at: new Date().toISOString(),
          },
        ]);

        // Create payload with pending messages
        const payload: NewChatPayload = {
          title: newChat.title,
          messages: [
            {
              content: newChat.title,
              is_user: true,
            },
          ],
        };

        return createChatApi(payload);
      },
      onSuccess: (data) => {
        addChat(data);

        if (data?.messages) {
          const reply = data?.messages.find((message) => !message.is_user);
          reply && addMessages([reply]);
        }
      },
      onError: (error) => {
        console.error(error);

        toast({
          type: 'error',
          description:
            'Une erreur est survenue lors de la création de la conversation',
        });
      },
    });

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

  const hasEmptyChatHistory = !isLoading && displayChats.length === 0;

  const needsManualLoad =
    hasNextPage && !isFetchingNextPage && displayChats.length < 15;

  return {
    createChat,
    isCreateChatPending,
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
  } as const;
};
