import { useQuery } from "@tanstack/react-query";

export function useLocationBankDetails(locationId) {
  const token = localStorage.getItem("ACCESS_TOKEN");

  return useQuery({
    queryKey: ["location-bank-details", locationId],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_HOME_OO}/locations/${locationId}/bank-details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch bank details");
      }

      const data = await res.json();
      return data.data;
    },
    enabled: !!locationId,
  });
}
