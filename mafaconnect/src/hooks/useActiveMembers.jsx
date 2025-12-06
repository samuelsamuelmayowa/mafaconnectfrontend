import { useQuery } from "@tanstack/react-query";
import axios from "axios";
export function useActiveMembers(API_BASE, token) {
  return useQuery({
    queryKey: ["active-members"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/dashboard/members/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.activeMembers ?? 0;
    },
  });
}