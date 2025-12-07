


// -------------------------------------------------------
// import { Link } from "react-router-dom";
// import { Card, CardContent, CardFooter } from "@/components/ui/Card";
// import { Badge } from "@/components/ui/Badge";
// import { AddToCartButton } from "./AddToCartButton";
// import { formatCurrency } from "@/lib/transactionUtils";
// import { useAuth } from "@/hooks/useAuth";

// export function ProductCard({ product }) {
//   const { user } = useAuth();

//   const isStaff =
//     user?.role === "admin" ||
//     user?.role === "manager" ||
//     user?.role === "sales_agent";
//  const qty = Number(product.stock_qty);

//   const isOutOfStock = qty <= 0; // Now TRUE only when zero
//   const isLowStock = qty <= 10 && qty > 0;
//   // const isLowStock = product.stock_qty > 0 && product.stock_qty <= 10;
//   // const isOutOfStock = product.stock_qty === 0;

//   return (
//     <Card className="group hover:shadow-lg transition-shadow">
//       {/* PRODUCT IMAGE */}
//       <Link to={`/products/${product.productid}`}>
//            <div className="aspect-square bg-muted flex items-center justify-center rounded-t-lg overflow-hidden relative">
//           {product.image_url ? (
//             <img
//               src={product.image_url}
//               alt={product.name}
//               loading="lazy"
//               className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
//             />
//           ) : (
//             <div className="text-muted-foreground text-sm font-medium">
//               {product.name?.substring(0, 2)?.toUpperCase()}
//             </div>
//           )}
//         </div>
//       </Link>

//       {/* PRODUCT DETAILS */}
//       <CardContent className="p-3 sm:p-4">
//         <Link to={`/products/${product.id}`} className="hover:underline">
//           <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-1">
//             {product.name}
//           </h3>
//         </Link>

//         <p className="text-xs sm:text-sm text-muted-foreground mb-2">
//           SKU: {product.sku}
//         </p>

//         {/* PRICE + STOCK STATUS */}
//         <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
//           <span className="text-base sm:text-lg font-bold">
//             {formatCurrency(product.sale_price)}
//           </span>

//           {/* Stock conditions */}
//           {isOutOfStock ? (
//             <Badge variant="outline" className="text-xs">Out of Stock</Badge>
//           ) : isLowStock ? (
//             <Badge variant="destructive" className="text-xs">
//               Low Stock {isStaff && `(${product.stock_qty})`}
//             </Badge>
//           ) : (
//             <Badge variant="default" className="text-xs">
//               {isStaff ? `In Stock (${product.stock_qty})` : "Available"}
//             </Badge>
//           )}
//         </div>
//       </CardContent>

//       {/* ADD TO CART BUTTON */}
//       <CardFooter className="p-3 sm:p-4 pt-0">
//         <AddToCartButton
//           productId={product.id}
//           stockQty={product.stock_qty}
//           className="w-full h-10 sm:h-11 text-sm sm:text-base"
//         />
//       </CardFooter>
//     </Card>
//   );
// }

// ---------------------------------------------------------------------------------------------------------------

import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AddToCartButton } from "./AddToCartButton";
import { formatCurrency } from "@/lib/transactionUtils";
import { useAuth } from "@/hooks/useAuth";

export function ProductCard({ product }) {
  const { user } = useAuth();

  const isLowStock = product.stock_qty > 0 && product.stock_qty <= 10;
  const isOutOfStock = product.stock_qty === 0;
  const isStaff =
    user?.role === "admin" || user?.role === "manager" || user?.role === "staff";

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <Link to={`/products/${product.productid}`}>
        <div className="aspect-square bg-muted flex items-center justify-center rounded-t-lg overflow-hidden">
          {product.images?.[0]?.image_url ? (
            <img
              src={product.images[0].image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-muted-foreground text-sm font-semibold">
              {product.name?.substring(0, 2)?.toUpperCase()}
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-3 sm:p-4">
        <Link to={`/products/${product.productid}`} className="hover:underline">
          <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-1">
            {product.name}
          </h3>
        </Link>

        <p className="text-xs sm:text-sm text-muted-foreground mb-2">
          SKU: {product.sku}
        </p>

        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <span className="text-base sm:text-lg font-bold">
            {formatCurrency(product.sale_price)}
          </span>

          {/* ===== ROLE BASED STOCK VIEW ===== */}
          {isStaff ? (
            // STAFF / ADMIN sees quantity numbers
            <>
              {isLowStock && (
                <Badge variant="destructive" className="text-xs">
                  Low Stock ({product.stock_qty})
                </Badge>
              )}

              {isOutOfStock && (
                <Badge variant="outline" className="text-xs">
                  Out of Stock
                </Badge>
              )}

              {!isLowStock && !isOutOfStock && (
                <Badge variant="outline" className="text-xs">
                  In Stock ({product.stock_qty})
                </Badge>
              )}
            </>
          ) : (
            // CUSTOMERS see simple availability
            <>
              {isOutOfStock ? (
                <Badge variant="outline" className="text-xs">
                  Out of Stock
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs">
                  Available
                </Badge>
              )}
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-3 sm:p-4 pt-0">
        <AddToCartButton product={product} stockQty={product.stock_qty}   defaultQuantity={1}
  size="sm"
  variant="default"
  className="w-full"
 />
      </CardFooter>
    </Card>
  );
}



// import { Link } from "react-router-dom";
// import { Card, CardContent, CardFooter } from "@/components/ui/Card";
// import { Badge } from "@/components/ui/Badge";
// import { AddToCartButton } from "./AddToCartButton";
// import { formatCurrency } from "@/lib/transactionUtils";

// export function ProductCard({ product }) {
//   const isLowStock = product.stock_qty > 0 && product.stock_qty <= 10;
//   const isOutOfStock = product.stock_qty === 0;

//   return (
//     <Card className="group hover:shadow-lg transition-shadow">
//       <Link to={`/products/${product.productid}`}>
//         <div className="aspect-square bg-muted flex items-center justify-center rounded-t-lg overflow-hidden">
//           {product.images?.[0]?.image_url ? (
//             <img
//               src={product.images[0].image_url}
//               alt={product.name}
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="text-muted-foreground text-sm font-semibold">
//               {product.name?.substring(0, 2)?.toUpperCase()}
//             </div>
//           )}
//         </div>
//       </Link>

//       <CardContent className="p-3 sm:p-4">
//         <Link to={`/products/${product.productid}`} className="hover:underline">
//           <h3 className="font-semibold text-sm sm:text-base line-clamp-2 mb-1">
//             {product.name}  HELLO 
//           </h3>
//         </Link>

//         <p className="text-xs sm:text-sm text-muted-foreground mb-2">
//           SKU: {product.sku}
//         </p>

//         <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
//           <span className="text-base sm:text-lg font-bold">
//             {formatCurrency(product.sale_price)}
//           </span>

//           {isLowStock && (
//             <Badge variant="destructive" className="text-xs">
//               Low Stock
//             </Badge>
//           )}

//           {isOutOfStock && (
//             <Badge variant="outline" className="text-xs">
//               Out of Stock
//             </Badge>
//           )}

//           {!isLowStock && !isOutOfStock && (
//             <Badge variant="outline" className="text-xs">
//               In Stock ({product.stock_qty})
//             </Badge>
//           )}
//         </div>
//       </CardContent>

//       <CardFooter className="p-3 sm:p-4 pt-0">
//         <AddToCartButton product={product} stockQty={product.stock_qty} />
//       </CardFooter>
//     </Card>
//   );
// }
