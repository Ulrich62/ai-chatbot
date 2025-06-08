'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { getChatHistory } from '@/apis/chat-api';

interface UseInfiniteChatHistoryOptions {
  enabled?: boolean;
  search?: string;
}

const DEFAULT_PAGE_SIZE = 20;

export function useInfiniteChatHistory({
  enabled = true,
  search,
}: UseInfiniteChatHistoryOptions = {}) {
  const [refreshing, setRefreshing] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isLoading,
    isError,
    error,
    ...rest
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
      // If current page is less than total pages, return next page number
      if (lastPage.page < lastPage.pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled,
  });

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (!isFetchingNextPage && hasNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Manual load more for when viewport trigger doesn't work
  const handleManualLoadMore = useCallback(async () => {
    if (!isFetchingNextPage && hasNextPage) {
      await fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Flatten all chat items from all pages
  const chats = data?.pages.flatMap((page) => page.items) ?? [];

  // Get total count from first page
  const total = data?.pages?.[0]?.total ?? 0;

  // Check if we have reached the end
  const hasReachedEnd = !hasNextPage;

  // Check if chat history is empty
  const hasEmptyChatHistory = !isLoading && chats.length === 0;

  // Check if we need manual load more (not enough content to fill viewport)
  const needsManualLoad =
    hasNextPage && !isFetchingNextPage && chats.length < 15;

  return {
    // Data
    chats,
    total,

    // Loading states
    isLoading,
    isFetchingNextPage,
    refreshing,

    // Error states
    isError,
    error,

    // Status flags
    hasNextPage,
    hasReachedEnd,
    hasEmptyChatHistory,
    needsManualLoad,

    // Actions
    fetchNextPage,
    handleLoadMore,
    handleManualLoadMore,
    handleRefresh,
    refetch,

    // Raw data (if needed)
    data,
    ...rest,
  } as const;
}
