import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useAdminDashboard(token) {
  return useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const res = await axios.get(`${import.meta.env.VITE_HOME_OO}/admin/overview/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    staleTime: 30000
  });
}
