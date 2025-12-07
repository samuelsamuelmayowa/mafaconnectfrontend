import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const API = import.meta.env.VITE_HOME_OO;

/******************************
 🔥 MAIN FILTERABLE HISTORY API
*******************************/
export function useLoyaltyHistory({ token, filters = {}, enabled = true }) {
  return useQuery({
    queryKey: ["loyalty-history", filters],
    enabled,
    queryFn: async () => {
      const res = await axios.get(`${API}/loyalty/customer/overview`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          status: filters.status || "all",
          startDate: filters.startDate || null,
          endDate: filters.endDate || null,
        },
      });

      return res.data; // MUST return summary + transactions
    },
    staleTime: 30000,
  });
}

/******************************
 🔥 RECENT REDEMPTIONS ONLY
*******************************/
export function useRecentRedemptions({ token, limit = 10 }) {
  return useQuery({
    queryKey: ["recent-redemptions", limit],
    queryFn: async () => {
      const res = await axios.get(`${API}/redemptions/me`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit }
      });

      return res.data?.data || [];
    },
    enabled: !!token,
    staleTime: 20000,
  });
}
