import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_HOME_OO; // your backend API base URL

export function useLoyaltyAnalytics(dateRange) {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["loyalty-analytics", dateRange],
    queryFn: async () => {
      const startDate = dateRange?.startDate
        ? dateRange.startDate.toISOString()
        : null;

      const endDate = dateRange?.endDate
        ? dateRange.endDate.toISOString()
        : null;

      const url = new URL(`${API_BASE}/loyalty/analytics`);

      if (startDate) url.searchParams.append("startDate", startDate);
      if (endDate) url.searchParams.append("endDate", endDate);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error("Failed to load loyalty analytics");

      return res.json();
    },
    staleTime: 60000,
  });

  return { analytics, isLoading };
}
