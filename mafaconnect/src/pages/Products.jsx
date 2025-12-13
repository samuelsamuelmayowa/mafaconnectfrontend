import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Package,
  Search,
  Plus,
  AlertCircle,
  Loader2,
  MapPin,
  Edit,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useProducts } from "@/hooks/useProducts";
import { useAuth } from "@/hooks/useAuth";
import { ProductDialog } from "@/components/ProductDialog";
import { ProductLocationStockDialog } from "@/components/ProductLocationStockDialog";
import { usePagination } from "@/hooks/usePagination";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/* -------- Pagination Numbers Helper -------- */
function generatePageNumbers(currentPage, totalPages) {
  const pages = [];

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  pages.push(1);
  if (currentPage > 3) pages.push("ellipsis");

  for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i++
  ) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) pages.push("ellipsis");
  pages.push(totalPages);

  return pages;
}

export default function Products() {
console.log('hello ')
  const [showDialog, setShowDialog] = useState(false);
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const pagination = usePagination({ initialPageSize: 24 });
  const debouncedSearch = useDebouncedValue(searchQuery, 500);

  const { products, totalCount, isLoading } = useProducts({
    page: pagination.currentPage,
    pageSize: pagination.pageSize,
  });

  const { isStaff } = useAuth();

  useEffect(() => {
    pagination.resetPage();
  }, [debouncedSearch]);

  const filteredProducts = products?.filter((product) => {
    if (!debouncedSearch) return true;

    return (
      product.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      product.sku?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-8 p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">
            {isStaff ? "Products" : "Product Catalog"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {isStaff
              ? "Manage your inventory and product catalog"
              : "Browse our available products"}
          </p>
        </div>

        {isStaff && (
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-gradient-primary shadow-md hover:shadow-lg transition-all h-11 w-full sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        )}
      </div>

      {/* PRODUCT MODAL */}
      {isStaff && (
        <ProductDialog
          open={showDialog}
          onOpenChange={(open) => {
            setShowDialog(open);
            if (!open) setEditingProduct(null);
          }}
          product={editingProduct}
        />
      )}

      {/* MAIN CARD */}
      <Card className="shadow-card">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <CardTitle className="text-lg sm:text-xl">
              {isStaff ? "Product Inventory" : "Available Products"}
            </CardTitle>

            <div className="flex items-center gap-3">
              {isStaff && (
                <Select
                  value={pagination.pageSize.toString()}
                  onValueChange={(value) => {
                    pagination.setPageSize(Number(value));
                    pagination.resetPage();
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 per page</SelectItem>
                    <SelectItem value="24">24 per page</SelectItem>
                    <SelectItem value="48">48 per page</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-10 h-11"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* PRODUCTS */}
          <div className="space-y-4">
            {filteredProducts?.map((product) => (
              <div
                key={product.id}
                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                {/* Image */}
                <div className="flex items-center gap-4 flex-1">
                  {product.images?.[0]?.image_url ? (
                    <img
                      src={product.images[0].image_url}
                      alt={product.name}
                      
                      className="w-28 h-28 rounded-lg object-cover border"
                    />
                  ) : (
                    <div className="p-3 rounded-lg bg-gradient-primary">
                      <Package className="h-5 w-5 text-primary-foreground" />
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-semibold text-foreground">
                        {product.name}
                      </p>

                      {isStaff &&
                        product.stock_qty <=
                          product.reorder_level && (
                          <Badge
                            variant="outline"
                            className="bg-warning/10 text-warning border-warning/20"
                          >
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Low Stock
                          </Badge>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      SKU: {product.sku}
                    </p>
                  </div>
                </div>

                {/* STATS */}
                <div
                  className={`grid ${
                    isStaff ? "grid-cols-3" : "grid-cols-1"
                  } gap-8 text-right`}
                >
                  {isStaff && (
                    <div>
                      <p className="text-xs font-bold">Stock</p>
                      <p className="font-semibold">
                        {product.stock_qty} units 
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-bold">Price</p>
                    <p className="font-semibold">
                      ₦{Number(product.sale_price).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* ACTIONS */}
                {isStaff && (
                  <div className="flex gap-2 sm:ml-4 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingProduct(product);
                        setShowDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowLocationDialog(true);
                      }}
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Locations
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* PAGINATION */}
          {totalCount > pagination.pageSize && (
            <div className="mt-6 pt-4 border-t">
              <Pagination>
                <PaginationContent>
                  <PaginationPrevious onClick={pagination.previousPage} />

                  {generatePageNumbers(
                    pagination.currentPage,
                    Math.ceil(totalCount / pagination.pageSize)
                  ).map((page, index) =>
                    page === "ellipsis" ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => pagination.goToPage(page)}
                          isActive={page === pagination.currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationNext onClick={pagination.nextPage} />
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>

      {/* LOCATION DIALOG */}
      {selectedProduct && (
        <ProductLocationStockDialog
          open={showLocationDialog}
          onOpenChange={setShowLocationDialog}
          product={selectedProduct}
        />
      )}
    </div>
  );
}



// import React, { useState, useMemo } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { Package, Search, Plus, AlertCircle, Loader2, MapPin } from "lucide-react";
// import { Badge } from "@/components/ui/Badge";
// import { useProducts } from "@/hooks/useProducts";
// import { useAuth } from "@/hooks/useAuth";
// import { ProductDialog } from "@/components/ProductDialog";
// import { ProductLocationStockDialog } from "@/components/ProductLocationStockDialog";

// export default function Products() {
//   const { products, isLoading } = useProducts();
//   const { isStaff } = useAuth();

//   const [showDialog, setShowDialog] = useState(false);
//   const [showLocationDialog, setShowLocationDialog] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");

//   // 🔹 Filter products by search term
//   const filteredProducts = useMemo(() => {
//     if (!products) return [];
//     return products.filter(
//       (p) =>
//         p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         p.sku?.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   }, [products, searchQuery]);

//   // 🔹 Loading state
//   // if (isLoading) {
//   //   return (
//   //     <div className="flex items-center justify-center h-64">
//   //       <Loader2 className="h-12 w-12 animate-spin text-primary" />
//   //     </div>
//   //   );
//   // }

//   return (
//     <div className="space-y-4 sm:space-y-8 p-4 sm:p-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//         <div>
//           <h1 className="text-2xl sm:text-4xl font-bold text-foreground mb-2">
//             {isStaff ? "Products" : "Product Catalog"}
//           </h1>
//           <p className="text-sm sm:text-base text-muted-foreground">
//             {isStaff
//               ? "Manage your inventory and product catalog"
//               : "Browse our available products"}
//           </p>
//         </div>

//         {isStaff && (
//           <Button
//             onClick={() => setShowDialog(true)}
//             className="bg-gradient-primary shadow-md hover:shadow-lg transition-all h-11 w-full sm:w-auto"
//           >
//             <Plus className="mr-2 h-4 w-4" />
//             Add Product
//           </Button>
//         )}
//       </div>

//       {/* Product creation dialog */}
//       {isStaff && <ProductDialog open={showDialog} onOpenChange={setShowDialog} />}

//       {/* Product List */}
//       <Card className="shadow-card">
//         <CardHeader>
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//             <CardTitle className="text-lg sm:text-xl">
//               {isStaff ? "Product Inventory" : "Available Products"}
//             </CardTitle>

//             <div className="relative w-full sm:w-64">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search products..."
//                 className="pl-10 h-11"
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//           </div>
//         </CardHeader>

//         <CardContent>
//           {filteredProducts?.length === 0 ? (
//             <div className="text-center py-8 text-muted-foreground">
//               No products found.
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {filteredProducts.map((product) => (
//                 <div
//                   key={product.id}
//                   className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
//                 >
//                   <div className="flex items-center gap-4 flex-1">
//                     <div className="p-3 rounded-lg bg-gradient-primary">
//                       {/* <Package className="h-5 w-5 text-primary-foreground" /> */}
//                       {/* <img src={`${product.image}`}/> */}
//                         <img
//     src={product.images?.[0]?.image_url}
//     alt={product.name}
//     className="h-12 w-12 rounded-md object-cover"
//   />
//                     </div>

//                     <div className="flex-1">
//                       <div className="flex items-center gap-3 mb-1">
//                         <p className="font-semibold text-foreground">
//                           {product.name}
//                         </p>

//                         {isStaff && product.stock_qty <= product.reorder_level && (
//                           <Badge
//                             variant="outline"
//                             className="bg-warning/10 text-warning border-warning/20"
//                           >
//                             <AlertCircle className="h-3 w-3 mr-1" />
//                             Low Stock
//                           </Badge>
//                         )}
//                       </div>

//                       {product.description && (
//                         <p className="text-sm text-muted-foreground mb-1">
//                           {product.description}
//                         </p>
//                       )}
//                       <p className="text-sm text-muted-foreground">
//                         SKU: {product.sku}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Product Stats */}
//                   <div
//                     className={`grid ${
//                       isStaff ? "grid-cols-3" : "grid-cols-1"
//                     } gap-8 text-right`}
//                   >
//                     {isStaff && (
//                       <div>
//                         <p className="text-xs text-muted-foreground mb-1">
//                           Stock
//                         </p>
//                         <p className="font-semibold text-foreground">
//                           {product.stock_qty} units
//                         </p>
//                       </div>
//                     )}

//                     <div>
//                       <p className="text-xs text-muted-foreground mb-1">Price</p>
//                       <p className="font-semibold text-foreground">
//                         ₦{Number(product.sale_price).toLocaleString()}
//                       </p>
//                     </div>

//                     {isStaff && product.cost_price && (
//                       <div>
//                         <p className="text-xs text-muted-foreground mb-1">
//                           Margin
//                         </p>
//                         <p className="font-semibold text-success">
//                           {Math.round(
//                             ((Number(product.sale_price) -
//                               Number(product.cost_price)) /
//                               Number(product.sale_price)) *
//                               100
//                           )}
//                           %
//                         </p>
//                       </div>
//                     )}

//                     {!isStaff && product.stock_qty > 0 && (
//                       <div className="flex items-center justify-end">
//                         <Badge
//                           variant="outline"
//                           className="bg-success/10 text-success"
//                         >
//                           Available
//                         </Badge>
//                       </div>
//                     )}
//                     {!isStaff && product.stock_qty === 0 && (
//                       <div className="flex items-center justify-end">
//                         <Badge
//                           variant="outline"
//                           className="bg-destructive/10 text-destructive"
//                         >
//                           Out of Stock
//                         </Badge>
//                       </div>
//                     )}
//                   </div>

//                   {/* Staff actions */}
//                   {isStaff && (
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => {
//                         setSelectedProduct(product);
//                         setShowLocationDialog(true);
//                       }}
//                       className="sm:ml-4 h-11 w-full sm:w-auto"
//                     >
//                       <MapPin className="h-4 w-4 mr-2" />
//                       Locations
//                     </Button>
//                   )}
//                 </div>
//               ))}
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Stock per Location dialog */}
//       {selectedProduct && (
//         <ProductLocationStockDialog
//           open={showLocationDialog}
//           onOpenChange={setShowLocationDialog}
//           product={selectedProduct}
//         />
//       )}
//     </div>
//   );
// }
