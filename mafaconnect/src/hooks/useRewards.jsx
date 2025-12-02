
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function useRewards() {
  const { isStaff } = useAuth();
  const queryClient = useQueryClient();

  const API_URL = import.meta.env.VITE_HOME_OO;
  const token = localStorage.getItem("ACCESS_TOKEN");

  // ================================
  // GET REWARDS
  // ================================
  const { data: rewards, isLoading } = useQuery({
    queryKey: ["rewards", isStaff],
    // Staff see ALL rewards, customers only see active
    queryFn: async () => {
      const url = isStaff
        ? `${API_URL}/rewards` // staff sees all
        : `${API_URL}/rewards?active=true`; // customers only see active reward

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch rewards (HTTP ${res.status})`);

      return await res.json();
    },
  });

  // ================================
  // UPDATE REWARD
  // ================================
  const updateReward = useMutation({
    mutationFn: async ({ id, ...data }) => {
      const res = await fetch(`${API_URL}/rewards/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update reward");
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      toast.success("Reward updated successfully");
    },

    onError: (error) => {
      toast.error(error.message || "Failed to update reward");
    },
  });

  // ================================
  // DELETE REWARD
  // ================================
  const deleteReward = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`${API_URL}/rewards/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete reward");
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      toast.success("Reward deleted successfully");
    },

    onError: (error) => {
      toast.error(error.message || "Failed to delete reward");
    },
  });

  // ================================
  // TOGGLE ACTIVE STATUS
  // ================================
  const toggleRewardStatus = useMutation({
    mutationFn: async ({ id, active }) => {
      const res = await fetch(`${API_URL}/rewards/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({ active }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update reward status");
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      toast.success("Reward status updated");
    },

    onError: (error) => {
      toast.error(error.message || "Failed to update reward status");
    },
  });

  return {
    rewards,
    isLoading,
    updateReward: updateReward.mutate,
    deleteReward: deleteReward.mutate,
    toggleRewardStatus: toggleRewardStatus.mutate,
    isUpdating: updateReward.isPending,
    isDeleting: deleteReward.isPending,
  };
}

// import { useQuery } from "@tanstack/react-query";

// export function useRewards() {
//   const API_URL = import.meta.env.VITE_HOME_OO;
//   const token = localStorage.getItem("ACCESS_TOKEN");
//   const { data: rewards, isLoading } = useQuery({
//     queryKey: ["rewards"],
//     queryFn: async () => {
//       const res = await fetch(`${API_URL}/rewards`, {
//         method: "GET",
//          headers: {
//           "Content-Type": "application/json",
//           Authorization: token ? `Bearer ${token}` : "",
//         },
//         credentials: "include",
//       });

//       if (!res.ok) throw new Error(`Failed to fetch rewards (HTTP ${res.status})`);

//       const data = await res.json();
//       return data;
//     },
//   });

//   return { rewards, isLoading };
// }
