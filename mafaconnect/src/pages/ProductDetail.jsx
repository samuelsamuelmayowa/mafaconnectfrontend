import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { AddToCartButton } from "@/components/AddToCartButton";
import { formatCurrency } from "@/lib/transactionUtils";
import { ArrowLeft, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function ProductDetail() {
  const { productid } = useParams();
  const { isStaff } = useAuth();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const API_URL = import.meta.env.VITE_HOME_OO;
  // ✅ Get token
  const token = localStorage.getItem("ACCESS_TOKEN");

  // 🔥 React Query Fetch
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["product", productid],
    queryFn: async () => {
      const res = await axios.get(
        // `${API_URL}/api/products/${id}?staff=${isStaff}`
        `${API_URL}/products/${productid}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ Token added here
          },
        }
      );
      return res.data.data;
    },
    enabled: !!productid,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="aspect-square rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The product you're looking for doesn't exist.
        </p>
        <Button asChild>
          <Link to="/shop">Browse Products</Link>
        </Button>
      </div>
    );
  }

  const isLowStock = product.stock_qty > 0 && product.stock_qty <= 10;
  const isOutOfStock = product.stock_qty === 0;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button variant="ghost" asChild>
        <Link to="/shop">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shop
        </Link>
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
          {product.images?.length > 0 ? (
            <img
              src={product.images[0].image_url}
              alt={product.name}
              className="h-full w-full object-cover rounded-lg"
            />
          ) : (
            <div className="text-6xl font-bold text-muted-foreground">
              {product.name.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-muted-foreground">SKU: {product.sku}</p>
          </div>

          {/* Price & Stock */}
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-3xl font-bold">
              {formatCurrency(product.sale_price)}
              {/* ₦  { product.sale_price} */}
            </span>

            {isLowStock && (
              <Badge variant="destructive">
                Only {product.stock_qty} left!
              </Badge>
            )}

            {isOutOfStock && <Badge variant="outline">Out of Stock</Badge>}

            {!isLowStock && !isOutOfStock && (
              <Badge variant="default">In Stock ({product.stock_qty})</Badge>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Product Details */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Product Details</h3>

              <dl className="space-y-2">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">SKU</dt>
                  <dd className="font-medium">{product.sku}</dd>
                </div>

                {isStaff && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Cost Price</dt>
                    <dd className="font-medium">
                      {formatCurrency(product.cost_price)}
                    </dd>
                  </div>
                )}

                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Sale Price</dt>
                  <dd className="font-medium">
                    {formatCurrency(product.sale_price)}
                  </dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Stock Quantity</dt>
                  <dd className="font-medium">{product.stock_qty}</dd>
                </div>

                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Reorder Level</dt>
                  <dd className="font-medium">{product.reorder_level}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Quantity Selector */}
          <div className="flex gap-4">
            <div className="flex items-center gap-2 border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </Button>

              <span className="w-12 text-center font-medium">{quantity}</span>

              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  setQuantity(Math.min(product.stock_qty, quantity + 1))
                }
                disabled={quantity >= product.stock_qty}
              >
                +
              </Button>
            </div>
            {/* <AddToCartButton
  product={product}
  stockQty={product.stock_qty}
/> */}

            <AddToCartButton
              productId={product}
              stockQty={product.stock_qty}
              defaultQuantity={quantity}
              size="lg"
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
