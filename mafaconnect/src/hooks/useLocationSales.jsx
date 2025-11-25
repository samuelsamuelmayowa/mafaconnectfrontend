import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

export function useLocationSales() {
  const { data } = useQuery({
    queryKey: ["location-sales"],
    queryFn: async () => {
      const res = await apiGet("/locations/sales");
      return res.data.data; // { locationId: { count, total } }
    },
  });

  return data || {};
}
