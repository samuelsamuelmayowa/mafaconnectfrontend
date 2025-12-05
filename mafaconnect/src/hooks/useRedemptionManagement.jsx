import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_HOME_OO;
const token = localStorage.getItem("ACCESS_TOKEN");
export function useRedemptionManagement() {
  const queryClient = useQueryClient();

  // -------------------------------------------------------
  // FETCH ALL REDEMPTIONS
  // -------------------------------------------------------
  const { data: redemptions, isLoading } = useQuery({
    queryKey: ["redemption-management"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/loyalty/redemptions/admin`,{
         headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
      });

      // Backend returns: redemption + reward + customer info
      // alert('Hel')
      return res.data;
    },
  });

  // -------------------------------------------------------
  // MARK AS USED
  // -------------------------------------------------------
  const markAsUsed = useMutation({
    mutationFn: async (redemptionId) => {
      await axios.put(`${API_BASE}/api/loyalty/redemptions/${redemptionId}/use`,{
         headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["redemption-management"]);
      toast.success("Redemption marked as used");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Failed to mark redemption as used";
      toast.error(msg);
    },
  });

  // -------------------------------------------------------
  // CANCEL REDEMPTION + REFUND POINTS
  // -------------------------------------------------------
  const cancelRedemption = useMutation({
    mutationFn: async (redemptionId) => {
      await axios.put(`${API_BASE}/api/loyalty/redemptions/${redemptionId}/cancel`,{
         headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["redemption-management"]);
      queryClient.invalidateQueries(["loyalty-stats"]);
      queryClient.invalidateQueries(["rewards"]);
      toast.success("Redemption cancelled and points refunded");
    },
    onError: (err) => {
      const msg = err?.response?.data?.message || "Failed to cancel redemption";
      toast.error(msg);
    },
  });

  // -------------------------------------------------------
  // RETURN HOOK API
  // -------------------------------------------------------
  return {
    redemptions,
    isLoading,

    // actions
    markAsUsed: markAsUsed.mutate,
    cancelRedemption: cancelRedemption.mutate,

    // loading states
    isMarkingUsed: markAsUsed.isPending,
    isCancelling: cancelRedemption.isPending,
  };
}
