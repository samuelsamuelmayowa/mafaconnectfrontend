import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const CART_KEY = "MAFA_CART";

export function useCart() {
  const queryClient = useQueryClient();

  // 🛒 load cart from localStorage
  const { data: cart } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const saved = localStorage.getItem(CART_KEY);
      return saved ? JSON.parse(saved) : { items: [] };
    },
    initialData: { items: [] },
  });

  // 🔢 Cart summary
  const itemCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const cartTotal =
    cart?.items?.reduce(
      (sum, item) => sum + (item.product?.sale_price || 0) * item.quantity,
      0
    ) || 0;

  // ✅ Save cart to localStorage
  const saveCart = (updatedCart) => {
    localStorage.setItem(CART_KEY, JSON.stringify(updatedCart));
    queryClient.setQueryData(["cart"], updatedCart);
  };

  const addToCart = useMutation({
    mutationFn: async ({ product }) => {
      const currentCart = JSON.parse(localStorage.getItem(CART_KEY)) || {
        items: [],
      };
      const existingItem = currentCart.items.find(
  (item) => String(item.product.productid) === String(product.productid)
);

if (existingItem) {
  existingItem.quantity += 1;
} else {
  currentCart.items.push({
    id: crypto.randomUUID(),
    product: product, // ✅ ensure full product is stored
    quantity: 1,
  });
}



      saveCart(currentCart);
    },
  });

  // 🔁 Update quantity
  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }) => {
      const currentCart = JSON.parse(localStorage.getItem(CART_KEY)) || {
        items: [],
      };

      const item = currentCart.items.find((i) => i.id === itemId);
      if (!item) return;

      item.quantity = Math.max(1, quantity);

      // item.quantity = quantity;

      saveCart(currentCart);
    },
  });

  // ❌ Remove item
  const removeFromCart = useMutation({
    mutationFn: async (itemId) => {
      const currentCart = JSON.parse(localStorage.getItem(CART_KEY)) || {
        items: [],
      };

      const newItems = currentCart.items.filter((i) => i.id !== itemId);

      saveCart({ ...currentCart, items: newItems });
    },
  });

  // 🧹 Clear cart
  const clearCart = useMutation({
    mutationFn: async () => {
      saveCart({ items: [] });
    },
  });
  useEffect(() => {
    const syncCart = () => {
      const saved = localStorage.getItem(CART_KEY);
      const parsed = saved ? JSON.parse(saved) : { items: [] };
      queryClient.setQueryData(["cart"], parsed);
    };

    window.addEventListener("storage", syncCart);
    return () => window.removeEventListener("storage", syncCart);
  }, [queryClient]);

  return {
    cart,
    itemCount,
    cartTotal,

    addToCart: addToCart.mutate,
    updateQuantity: updateQuantity.mutate,
    removeFromCart: removeFromCart.mutate,
    clearCart: clearCart.mutate,

    isAddingToCart: addToCart.isPending,
  };
}




// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { useToast } from "@/hooks/use-toast";
// import { useAuth } from "./useAuth";
// import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api"; // your Node.js API helpers

// export function useCart() {
//   const { toast } = useToast();
//   const queryClient = useQueryClient();
//   const { user } = useAuth();

//   // 🛒 Fetch cart and its items from Node backend
//   const { data: cart, isLoading } = useQuery({
//     queryKey: ["cart", user?.id],
//     queryFn: async () => {
//       if (!user) return null;

//       const res = await apiGet(`/api/cart/${user.id}`);
//       if (!res || res.error) throw new Error(res?.error || "Failed to fetch cart");

//       return res.data;
//     },
//     enabled: !!user,
//   });

//   // 🔢 Cart summary
//   const itemCount =
//     cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

//   const cartTotal =
//     cart?.items?.reduce(
//       (sum, item) => sum + (item.product?.price || 0) * item.quantity,
//       0
//     ) || 0;

//   // ➕ Add to cart
//   const addToCart = useMutation({
//     mutationFn: async ({ productId, quantity }) => {
//       if (!user) throw new Error("User not logged in");

//       const res = await apiPost(`/api/cart/add`, {
//         userId: user.id,
//         productId,
//         quantity,
//       });

//       if (res.error) throw new Error(res.error);
//       return res.data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["cart"] });
//       toast({
//         title: "Added to cart",
//         description: "Product has been added to your cart.",
//       });
//     },
//     onError: (error) => {
//       toast({
//         title: "Error adding to cart",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   // 🔄 Update item quantity
//   const updateQuantity = useMutation({
//     mutationFn: async ({ itemId, quantity }) => {
//       const res = await apiPut(`/api/cart/update`, {
//         itemId,
//         quantity,
//       });
//       if (res.error) throw new Error(res.error);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["cart"] });
//     },
//     onError: (error) => {
//       toast({
//         title: "Error updating cart",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   // ❌ Remove item
//   const removeFromCart = useMutation({
//     mutationFn: async (itemId) => {
//       const res = await apiDelete(`/api/cart/item/${itemId}`);
//       if (res.error) throw new Error(res.error);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["cart"] });
//       toast({
//         title: "Removed from cart",
//         description: "Product has been removed from your cart.",
//       });
//     },
//     onError: (error) => {
//       toast({
//         title: "Error removing item",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   // 🧹 Clear all items
//   const clearCart = useMutation({
//     mutationFn: async () => {
//       if (!user) throw new Error("User not logged in");

//       const res = await apiDelete(`/api/cart/clear/${user.id}`);
//       if (res.error) throw new Error(res.error);
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["cart"] });
//       queryClient.invalidateQueries({ queryKey: ["products"] });
//       toast({
//         title: "Cart cleared",
//         description: "All items have been removed from your cart.",
//       });
//     },
//     onError: (error) => {
//       toast({
//         title: "Error clearing cart",
//         description: error.message,
//         variant: "destructive",
//       });
//     },
//   });

//   return {
//     cart,
//     itemCount,
//     cartTotal,
//     isLoading,
//     addToCart: addToCart.mutate,
//     updateQuantity: updateQuantity.mutate,
//     removeFromCart: removeFromCart.mutate,
//     clearCart: clearCart.mutate,
//     isAddingToCart: addToCart.isPending,
//   };
// }
