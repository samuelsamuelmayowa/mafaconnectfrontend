import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useLoyaltyStats(API_BASE, token) {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["loyalty-stats"],

    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(res.data.data)

      // backend returns → data: { totalDistributed, totalRewardsRedeemed, pendingRedemptions, totalCancelled }
      const data = res.data.data;

      return {
        totalPointsDistributed: data.totalDistributed ?? 0,
        rewardsRedeemed: data.totalRewardsRedeemed ?? 0,
        pendingRedemptions: data.pendingRedemptions ?? 0,
        cancelledRedemptions: data.totalCancelled ?? 0,
      };
    }
  });

  return { stats, isLoading };
}

// import { useQuery } from "@tanstack/react-query";

// // 🔹 Generic API fetcher
// async function fetchAPI(url) {
//   const res = await fetch(url, {
//     headers: { "Content-Type": "application/json" },
//     credentials: "include",
//   });
//   if (!res.ok) throw new Error(`HTTP ${res.status}`);
//   return res.json();
// }

// export function useLoyaltyStats() {
//   const { data: stats, isLoading } = useQuery({
//     queryKey: ["loyalty-stats"],
//     queryFn: async () => {
//     const res = await axios.get(`${API_BASE}/api/loyalty/dashboard/stats`, {
//       headers: { Authorization: `Bearer ${token}` }
//     });
//     return res.data.data;
//   }

//     // queryFn: async () => {
//     //   // Call REST endpoint that aggregates loyalty stats
//     //   const data = await fetchAPI("/loyalty/stats");

//     //   // Expected response shape:
//       // {
//       //   totalPointsDistributed: number,
//       //   rewardsRedeemed: number,
//       //   activeMembers: number
//       // }

//       return {
//         totalPointsDistributed: data.totalPointsDistributed || 0,
//         rewardsRedeemed: data.rewardsRedeemed || 0,
//         activeMembers: data.activeMembers || 0,
//       };
//     },
//   });

//   return { stats, isLoading };
// }
