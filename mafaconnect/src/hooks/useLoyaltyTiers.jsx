import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_HOME_OO;

export function useLoyaltyTiers() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem("ACCESS_TOKEN");

  // Helper function to attach token to headers
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ===============================
  // GET TIERS
  // ===============================
  const { data: tiers, isLoading } = useQuery({
    queryKey: ["loyalty_tiers"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/tiers`, axiosConfig);
      return data;
    },
  });

  // ===============================
  // CREATE TIER
  // ===============================
  const createTier = useMutation({
    mutationFn: async (tierData) => {
      await axios.post(`${API_BASE}/tiers`, tierData, axiosConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["loyalty_tiers"]);
      toast.success("Tier created successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to create tier");
    },
  });

  // ===============================
  // UPDATE TIER
  // ===============================
  const updateTier = useMutation({
    mutationFn: async ({ id, ...data }) => {
      await axios.put(`${API_BASE}/tiers/${id}`, {
        ...data,
        updated_at: new Date().toISOString(),
      }, axiosConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["loyalty_tiers"]);
      toast.success("Tier updated successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update tier");
    },
  });

  // ===============================
  // DELETE TIER
  // ===============================
  const deleteTier = useMutation({
    mutationFn: async (id) => {
      await axios.delete(`${API_BASE}/tiers/${id}`, axiosConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["loyalty_tiers"]);
      toast.success("Tier deleted successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to delete tier");
    },
  });

  // ===============================
  // TOGGLE ACTIVE / INACTIVE
  // ===============================
  const toggleTierStatus = useMutation({
    mutationFn: async ({ id, active }) => {
      await axios.patch(`${API_BASE}/tiers/${id}/status`, {
        active,
        updated_at: new Date().toISOString(),
      }, axiosConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["loyalty_tiers"]);
      toast.success("Tier status updated");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update tier status");
    },
  });

  return {
    tiers,
    isLoading,

    createTier: createTier.mutate,
    updateTier: updateTier.mutate,
    deleteTier: deleteTier.mutate,
    toggleTierStatus: toggleTierStatus.mutate,

    isCreating: createTier.isPending,
    isUpdating: updateTier.isPending,
    isDeleting: deleteTier.isPending,
  };
}


// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import axios from "axios";
// import { toast } from "sonner";

// const API_BASE = import.meta.env.VITE_HOME_OO;
//   const token = localStorage.getItem("ACCESS_TOKEN");
// export function useLoyaltyTiers() {
//   const queryClient = useQueryClient();

//   // ===============================
//   // GET TIERS
//   // ===============================
//   const { data: tiers, isLoading } = useQuery({
//     queryKey: ["loyalty_tiers"],
//     queryFn: async () => {
//       const { data } = await axios.get(`${API_BASE}/api/loyalty/tiers`);
//       return data;
//     },
//   });

//   // ===============================
//   // CREATE TIER
//   // ===============================
//   const createTier = useMutation({
//     mutationFn: async (tierData) => {
//       await axios.post(`${API_BASE}/api/loyalty/tiers`, tierData);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(["loyalty_tiers"]);
//       toast.success("Tier created successfully");
//     },
//     onError: (error) => {
//       toast.error(error?.response?.data?.message || "Failed to create tier");
//     },
//   });

//   // ===============================
//   // UPDATE TIER
//   // ===============================
//   const updateTier = useMutation({
//     mutationFn: async ({ id, ...data }) => {
//       await axios.put(`${API_BASE}/api/loyalty/tiers/${id}`, {
//         ...data,
//         updated_at: new Date().toISOString(),
//       });
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(["loyalty_tiers"]);
//       toast.success("Tier updated successfully");
//     },
//     onError: (error) => {
//       toast.error(error?.response?.data?.message || "Failed to update tier");
//     },
//   });

//   // ===============================
//   // DELETE TIER
//   // ===============================
//   const deleteTier = useMutation({
//     mutationFn: async (id) => {
//       await axios.delete(`${API_BASE}/api/loyalty/tiers/${id}`);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(["loyalty_tiers"]);
//       toast.success("Tier deleted successfully");
//     },
//     onError: (error) => {
//       toast.error(error?.response?.data?.message || "Failed to delete tier");
//     },
//   });

//   // ===============================
//   // TOGGLE ACTIVE / INACTIVE
//   // ===============================
//   const toggleTierStatus = useMutation({
//     mutationFn: async ({ id, active }) => {
//       await axios.patch(`${API_BASE}/api/loyalty/tiers/${id}/status`, {
//         active,
//         updated_at: new Date().toISOString(),
//       });
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries(["loyalty_tiers"]);
//       toast.success("Tier status updated");
//     },
//     onError: (error) => {
//       toast.error(error?.response?.data?.message || "Failed to update tier status");
//     },
//   });

//   return {
//     tiers,
//     isLoading,

//     createTier: createTier.mutate,
//     updateTier: updateTier.mutate,
//     deleteTier: deleteTier.mutate,
//     toggleTierStatus: toggleTierStatus.mutate,

//     isCreating: createTier.isPending,
//     isUpdating: updateTier.isPending,
//     isDeleting: deleteTier.isPending,
//   };
// }
