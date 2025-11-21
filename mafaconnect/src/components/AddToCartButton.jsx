// import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

export function AddToCartButton({ product, className }) {
  const { addToCart } = useCart();

  const stockQty = Number(product?.stock_qty ?? 0);

  const handleAddToCart = () => {
    if (stockQty <= 0) return;
    addToCart({ product });
  };

  if (stockQty <= 0) {
    return <button disabled>Out of Stock</button>;
  }

  return (
    <button onClick={handleAddToCart} className={className}>
      Add To Cart
    </button>
  );
}




// import { useState } from "react";
// import { Button } from "@/components/ui/Button";
// import { ShoppingCart, Check } from "lucide-react";
// import { useCart } from "@/hooks/useCart";
// import { cn } from "@/lib/utils";

// export function AddToCartButton({ product, className }) {
//   const { addToCart, isAddingToCart } = useCart();
//   const [showSuccess, setShowSuccess] = useState(false);

//   const stockQty = product?.stock_qty || 0;

//   const handleAddToCart = () => {
//     if (stockQty <= 0) return;

//     addToCart({ product });

//     setShowSuccess(true);
//     setTimeout(() => setShowSuccess(false), 1500);
//   };

//   if (stockQty === 0) {
//     return (
//       <Button variant="outline" disabled className={className}>
//         Out of Stock
//       </Button>
//     );
//   }

//   if (showSuccess) {
//     return (
//       <Button disabled className={cn("gap-2", className)}>
//         <Check className="h-4 w-4" />
//         Added
//       </Button>
//     );
//   }

//   return (
//     <Button
//       onClick={handleAddToCart}
//       disabled={isAddingToCart}
//       className={cn("gap-2", className)}
//     >
//       <ShoppingCart className="h-4 w-4" />
//       Add to Cart
//     </Button>
//   );
// }

// // import { useState } from "react";
// // import { Button } from "@/components/ui/Button";
// // import { ShoppingCart, Check } from "lucide-react";
// // import { useCart } from "@/hooks/useCart";
// // import { cn } from "@/lib/utils";

// // export function AddToCartButton({
// //   product,
// //   stockQty,
// //   className,
// // }) {
// //   const { addToCart } = useCart();
// //   const [showSuccess, setShowSuccess] = useState(false);

// //   const handleAddToCart = () => {
// //     if (stockQty <= 0) return;

// //     addToCart({ product });

// //     setShowSuccess(true);
// //     setTimeout(() => setShowSuccess(false), 2000);
// //   };

// //   if (stockQty === 0) {
// //     return (
// //       <Button variant="outline" disabled className={className}>
// //         Out of Stock
// //       </Button>
// //     );
// //   }

// //   if (showSuccess) {
// //     return (
// //       <Button disabled className={cn("gap-2", className)}>
// //         <Check className="h-4 w-4" />
// //         Added
// //       </Button>
// //     );
// //   }

// //   return (
// //     <Button onClick={handleAddToCart} className={cn("gap-2", className)}>
// //       <ShoppingCart className="h-4 w-4" />
// //       Add to Cart
// //     </Button>
// //   );
// // }

// // // export function AddToCartButton({
// // //   productId,
// // //   stockQty,
// // //   defaultQuantity = 1,
// // //   variant = "default",
// // //   size = "default",
// // //   className,
// // // }) {
// // //   const { addToCart, isAddingToCart } = useCart();
// // //   const [showSuccess, setShowSuccess] = useState(false);

// // //   const handleAddToCart = () => {
// // //     console.log("🛒 Adding to cart:", productId);

// // //     if (!productId) {
// // //       console.error("❌ productId missing");
// // //       return;
// // //     }

// // //     if (stockQty < defaultQuantity) return;

// // //     addToCart({
// // //       productId,
// // //       quantity: defaultQuantity,
// // //     });

// // //     setShowSuccess(true);
// // //     setTimeout(() => setShowSuccess(false), 2000);
// // //   };

// // //   const isOutOfStock = stockQty === 0;

// // //   if (isOutOfStock) {
// // //     return (
// // //       <Button variant="outline" size={size} disabled className={className}>
// // //         Out of Stock
// // //       </Button>
// // //     );
// // //   }

// // //   if (showSuccess) {
// // //     return (
// // //       <Button variant="default" size={size} disabled className={cn("gap-2", className)}>
// // //         <Check className="h-4 w-4" />
// // //         Added
// // //       </Button>
// // //     );
// // //   }

// // //   return (
// // //     <Button
// // //       variant={variant}
// // //       size={size}
// // //       onClick={handleAddToCart}
// // //       disabled={isAddingToCart}
// // //       className={cn("gap-2", className)}
// // //     >
// // //       <ShoppingCart className="h-4 w-4" />
// // //       Add to Cart
// // //     </Button>
// // //   );
// // // }


// // // import { useState } from "react";
// // // import { Button } from "@/components/ui/Button";
// // // import { ShoppingCart, Check } from "lucide-react";
// // // import { useCart } from "@/hooks/useCart";
// // // import { cn } from "@/lib/utils";

// // // export function AddToCartButton({
// // //   productId,
// // //   stockQty,
// // //   defaultQuantity = 1,
// // //   variant = "default",
// // //   size = "default",
// // //   className,
// // // }) {
// // //   const { addToCart, isAddingToCart } = useCart();
// // //   const [showSuccess, setShowSuccess] = useState(false);

// // //   const handleAddToCart = () => {
// // //     if (stockQty < defaultQuantity) return;

// // //     addToCart({
// // //       productId,
// // //       // productid
// // //       quantity: defaultQuantity,
// // //     });

// // //     setShowSuccess(true);
// // //     setTimeout(() => setShowSuccess(false), 2000);
// // //   };

// // //   const isOutOfStock = stockQty === 0;

// // //   if (isOutOfStock) {
// // //     return (
// // //       <Button
// // //         variant="outline"
// // //         size={size}
// // //         disabled
// // //         className={className}
// // //       >
// // //         Out of Stock
// // //       </Button>
// // //     );
// // //   }

// // //   if (showSuccess) {
// // //     return (
// // //       <Button
// // //         variant="default"
// // //         size={size}
// // //         disabled
// // //         className={cn("gap-2", className)}
// // //       >
// // //         <Check className="h-4 w-4" />
// // //         Added
// // //       </Button>
// // //     );
// // //   }

// // //   return (
// // //     <Button
// // //       variant={variant}
// // //       size={size}
// // //       onClick={handleAddToCart}
// // //       disabled={isAddingToCart}
// // //       className={cn("gap-2", className)}
// // //     >
// // //       <ShoppingCart className="h-4 w-4" />
// // //       Add to Cart
// // //     </Button>
// // //   );
// // // }
