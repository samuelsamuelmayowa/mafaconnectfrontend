import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_API_OO;

export function useSearchProducts(query) {
  return useQuery({
    queryKey: ["search-products", query],
    queryFn: async () => {
      if (!query || query.trim() === "") return [];

      const res = await fetch(
        `${API_BASE}/products/search?q=${query}`
      );
      const data = await res.json();
      console.log('this is from userprodut side ', data)

      return data.data || [];
    },
    enabled: !!query, // only run if query exists
    staleTime: 1000,  // cache for 1 second
  });
}
