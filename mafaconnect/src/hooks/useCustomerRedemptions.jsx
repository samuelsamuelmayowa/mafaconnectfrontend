import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useCustomerRedemptions(API_BASE, token) {
  return useQuery({
    queryKey: ["customer-redemptions"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/redemptions/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      console.log("data from here ........... ",res.data.data)
      return res.data.data || []; // return array only
      //   return res.data; // returns formatted array
    },
  });
}
