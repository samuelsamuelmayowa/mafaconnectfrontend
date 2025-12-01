import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_HOME_OO;

export function useRewardRedemption() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ===========================
  // GET USER REDEMPTIONS
  // ===========================
  const { data: redemptions, isLoading: isLoadingRedemptions } = useQuery({
    queryKey: ["reward-redemptions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const res = await fetch(`${API_BASE}/loyalty/rewards/redemptions/${user.id}`);
      if (!res.ok) throw new Error("Failed to fetch redemptions");

      return res.json();
    },
    enabled: !!user?.id,
  });

  // ===========================
  // REDEEM A REWARD
  // ===========================
  const redeemReward = useMutation({
    mutationFn: async ({ rewardId }) => {
      if (!user?.id) {
        throw new Error("You must be logged in to redeem rewards");
      }

      const res = await fetch(`${API_BASE}/loyalty/rewards/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rewardId,
          customerId: user.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Backend should send { message: "" }
        throw new Error(data.message || "Failed to redeem reward");
      }

      return data;
    },

    onSuccess: () => {
      // Invalidate all loyalty-related queries
      queryClient.invalidateQueries({ queryKey: ["reward-redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["loyalty-account"] });
      queryClient.invalidateQueries({ queryKey: ["loyalty-transactions"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });

      toast.success("Reward redeemed successfully!");
    },

    onError: (error) => {
      toast.error(error.message || "Failed to redeem reward");
    },
  });

  return {
    redemptions,
    isLoadingRedemptions,
    redeemReward: redeemReward.mutateAsync,
    isRedeeming: redeemReward.isPending,
    isAuthenticated: !!user?.id,
  };
}
