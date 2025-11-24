import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api"; //

export function useLocationStats() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["location-stats"],
    queryFn: async () => {
      const res = await apiGet("/locations/stats"); 
      return res.data.data; // IMPORTANT ✅
    },
  });

  return {
    locationStats: data || [],
    isLoading,
    error,
  };
}

// // src/hooks/useLocationStats.jsx
// import { useQuery } from "@tanstack/react-query";
// import { apiGet } from "@/lib/api"; //

// export function useLocationStats() {
//   const { data, isLoading, error } = useQuery({
//     queryKey: ["location-stats"],
//     queryFn: async () => {
//       const res = await apiGet("/locations/stats"); 
//       return res.data; 
//     },
//   });

//   return {
//     locationStats: data || [],
//     isLoading,
//     error,
//   };
// }
