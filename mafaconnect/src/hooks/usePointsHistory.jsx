import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import * as React from "react";

export function usePointsHistory({
  accountId,
  filters = {},
  pageSize = 20,
  enabled = true,
}) {
  const [page, setPage] = React.useState(0);

  // MAIN PAGINATED QUERY
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["points-history", accountId, filters, page],
    queryFn: async () => {
      if (!accountId) return { transactions: [], hasMore: false, totalCount: 0 };

      const response = await axios.get(
        `${import.meta.env.VITE_HOME_OO}/loyalty/history`,
        {
          params: {
            accountId,
            page,
            pageSize,
            type: filters.type,
            startDate: filters.startDate,
            endDate: filters.endDate,
          },
        }
      );

      return {
        transactions: response.data.transactions || [],
        hasMore: response.data.hasMore || false,
        totalCount: response.data.totalCount || 0,
      };
    },
    enabled: !!accountId && enabled,
    staleTime: 30000, // 30s
  });

  // LIFETIME SUMMARY QUERY
  const { data: lifetimeStats } = useQuery({
    queryKey: ["lifetime-points-stats", accountId],
    queryFn: async () => {
      if (!accountId)
        return { totalEarned: 0, totalSpent: 0, totalExpired: 0 };

      const response = await axios.get(
        `${import.meta.env.VITE_HOME_OO}/loyalty/history/summary`,
        { params: { accountId } }
      );

      return response.data || {
        totalEarned: 0,
        totalSpent: 0,
        totalExpired: 0,
      };
    },
    enabled: !!accountId && enabled,
    staleTime: 60000, // 1 min
  });

  // Pagination handler
  const fetchNextPage = React.useCallback(() => {
    if (data?.hasMore) {
      setPage((prev) => prev + 1);
    }
  }, [data?.hasMore]);

  return {
    transactions: data?.transactions || [],
    totalCount: data?.totalCount || 0,
    summary: lifetimeStats || {
      totalEarned: 0,
      totalSpent: 0,
      totalExpired: 0,
    },
    isLoading,
    fetchNextPage,
    hasNextPage: data?.hasMore || false,
    isFetchingNextPage: isFetching && page > 0,
  };
}

// NON-PAGINATED SIMPLE VERSION
export function useRecentPointsHistory(accountId, limit = 10) {
  return useQuery({
    queryKey: ["recent-points-history", accountId, limit],
    queryFn: async () => {
      if (!accountId) return [];

      const response = await axios.get(
        `${import.meta.env.VITE_HOME_OO}/loyalty/history/recent`,
        { params: { accountId, limit } }
      );

      return response.data || [];
    },
    enabled: !!accountId,
    staleTime: 30000,
  });
}
