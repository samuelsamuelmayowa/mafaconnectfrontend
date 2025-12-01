import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "./useAuth";

const API_BASE = import.meta.env.VITE_HOME_OO;

export function useExpiringPoints() {
  const { user } = useAuth();

  const { data: expiringPoints, isLoading } = useQuery({
    queryKey: ["expiring-points", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return null;

      // Fetch expiring points from backend
      const res = await axios.get(`${API_BASE}/api/loyalty/expiring-points/${user.id}`);

      return res.data; // Must match backend structure
    },
  });

  return {
    expiringPoints,
    isLoading,
  };
}
