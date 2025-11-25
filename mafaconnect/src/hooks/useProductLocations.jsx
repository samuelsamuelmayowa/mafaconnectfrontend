import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
const API_URL = import.meta.env.VITE_HOME_OO;
const token = localStorage.getItem("ACCESS_TOKEN");
// ✅ Base API helper
async function fetchAPI(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP error ${res.status}`);
  }
  return res.json();
}

export function useProductLocations() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // 🔹 Get all product-location mappings
  const { data: productLocations, isLoading } = useQuery({
    queryKey: ["product-locations"],
    queryFn: async () => {
      const res  = await fetchAPI(`${API_URL}/product-locations`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
    return res.data || []; // ✅ FIXED
 // Expect: [{ id, product_id, location_id, stock_qty, reorder_level, ... }]
    },
      initialData: [], // ✅ Prevents undefined
  });

  // 🔹 Optional: Detailed stock with product/location info
  const getProductLocationStock = useQuery({
    queryKey: ["product-location-stock"],
    queryFn: async () => {
      const data = await fetchAPI("/api/product-locations/stock", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      return data; // Expect: [{ id, product: { name }, location: { name, state }, stock_qty }]
    },
  });

  // 🔹 Update or assign stock to a location
  // const updateProductLocationStock = useMutation({
  //   mutationFn: async ({ productId, locationId, stockQty, reorderLevel }) => {
  //     const payload = {
  //       product_id: productId,
  //       location_id: locationId,
  //       ...(stockQty !== undefined ? { stock_qty: stockQty } : {}),
  //       ...(reorderLevel !== undefined ? { reorder_level: reorderLevel } : {}),
  //     };
  //     await fetchAPI(`${API_URL}/locations/stock`, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //       method: "POST",
  //       body: JSON.stringify(payload),
  //     });
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ["product-locations"] });
  //     queryClient.invalidateQueries({ queryKey: ["product-location-stock"] });
  //     toast({
  //       title: "Stock Updated",
  //       description: "Location stock has been updated successfully.",
  //     });
  //   },
  //   onError: (error) => {
  //     toast({
  //       title: "Error Updating Stock",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   },
  // });
  const updateProductLocationStock = useMutation({
  mutationFn: async ({ productId, locationId, stockQty, reorderLevel }) => {
    const payload = {
      product_id: productId,
      location_id: locationId,
      stock_qty: stockQty,
      reorder_level: reorderLevel,
    };

    const res = await fetchAPI(`${API_URL}/locations/stock`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return res; // ✅ important so we read message
  },

  onSuccess: (data) => {
    toast({
      title: "✅ Assignment Successful",
      description: data.message || "Product assigned to location successfully.",
    });

    queryClient.invalidateQueries({ queryKey: ["product-locations"] });
    queryClient.invalidateQueries({ queryKey: ["product-location-stock"] });
  },

  onError: async (error) => {
    // Try to extract backend error message
    const message =
      error?.message ||
      "❌ Failed to assign product to location. Try again.";

    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  },
});


  // 🔹 Adjust existing stock (add/remove)
  const adjustLocationStock = useMutation({
    mutationFn: async ({ productId, locationId, adjustment, reason }) => {
      const payload = { productId, locationId, adjustment, reason };
      await fetchAPI("/api/product-locations/adjust", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product-locations"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements"] });
      toast({
        title: "Stock Adjusted",
        description: "Stock quantity has been adjusted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error Adjusting Stock",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    productLocations,
    isLoading,
    productLocationStock: getProductLocationStock.data,
    // updateProductLocationStock: updateProductLocationStock.mutate,
    updateProductLocationStock,

    adjustLocationStock: adjustLocationStock.mutate,
  };
}
