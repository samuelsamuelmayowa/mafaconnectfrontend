import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export function useLocationProducts(locationId) {
  const { data, isLoading } = useQuery({
    queryKey: ["location-products", locationId],
    enabled: !!locationId,
    queryFn: async () => {
      const res = await apiGet(`/locations/${locationId}/products`);
      return res.data.data;
    },
  });

  return {
    products: data || [],
    isLoading,
  };
}
