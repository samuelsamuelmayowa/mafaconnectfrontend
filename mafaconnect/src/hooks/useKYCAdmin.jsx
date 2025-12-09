import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_HOME_OO;

const getToken = () => localStorage.getItem("ACCESS_TOKEN");

/* ---------------- GET ALL SUBMISSIONS ---------------- */
export function useKYCSubmissions() {
  return useQuery({
    queryKey: ["kyc-submissions"],
    queryFn: async () => {
      const token = getToken();
      const res = await axios.get(`${API_BASE}/kyc/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.data; // only the array
    },
  });
}

/* ---------------- APPROVE ---------------- */
export function useApproveKYC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, notes }) => {
      const token = getToken();
      await axios.post(
        `${API_BASE}/kyc/approve`,
        { userId, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      toast.success("KYC approved");
      queryClient.invalidateQueries(["kyc-submissions"]);
    },
  });
}

/* ---------------- REJECT ---------------- */
export function useRejectKYC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, notes }) => {
      const token = getToken();
      await axios.post(
        `${API_BASE}/kyc/reject`,
        { userId, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    },
    onSuccess: () => {
      toast.error("KYC rejected");
      queryClient.invalidateQueries(["kyc-submissions"]);
    },
  });
}
