import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Loader2, Search, FileText } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_HOME_OO;

// ✅ Token Helper
const getToken = () => {
  return localStorage.getItem("ACCESS_TOKEN");
};

// ✅ Fetch orders
const fetchCustomerOrders = async () => {
  const token = getToken();

  const res = await axios.get(`${API_BASE}/customer/orders`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data?.data || [];
};

// ✅ Fetch invoices
const fetchCustomerInvoices = async () => {
  const token = getToken();

  const res = await axios.get(`${API_BASE}/customer/invoices`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data?.data || [];
};

export default function CustomerOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("");

  // 🟢 Orders Query
  const { data: orders, isLoading } = useQuery({
    queryKey: ["customer-orders", user?.id],
    queryFn: fetchCustomerOrders,
    enabled: !!user?.id,
  });

  // 🟢 Invoices Query
  const { data: invoices } = useQuery({
    queryKey: ["customer-invoices", user?.id],
    queryFn: fetchCustomerInvoices,
    enabled: !!user?.id,
  });
  const formatSafeDate = (date) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (isNaN(parsed.getTime())) {
      console.warn("Invalid date received:", date);
      return "N/A";
    }

    return format(parsed, "MMM d, yyyy 'at' h:mm a");
  };

  // 🔎 Filter Orders
  const filteredOrders = React.useMemo(() => {
    if (!orders) return [];
    if (!searchQuery) return orders;

    const lower = searchQuery.toLowerCase();

    return orders.filter(
      (order) =>
        order.order_number?.toLowerCase().includes(lower) ||
        order.payment_method?.toLowerCase().includes(lower) ||
        order.order_status?.toLowerCase().includes(lower)        // status 
    );    
  }, [orders, searchQuery]);

  // 🔗 Match Invoice to Order
  const getInvoiceForOrder = (order) => {
    if (!invoices) return null;
    // return invoices.find((inv) => inv.order_number === orderNumber);
    return invoices.find((inv) => inv.order_id === order.id);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          View your purchase history
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
        </CardHeader>

        <CardContent>
          {filteredOrders.length > 0 ? (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const orderInvoice = getInvoiceForOrder(order);

                return (
                  <Card key={order.order_number}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div>
                          <CardTitle className="text-base sm:text-lg">
                            Order #{order.order_number}
                          </CardTitle>
                         
                          <CardDescription className="text-xs sm:text-sm">
                            {formatSafeDate(order.createdAt)}
                          </CardDescription>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Badge
                            variant={
                              order.payment_status === "paid"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {order.payment_status}
                          </Badge>
                          <Badge
                            variant={
                              order.status === "delivered"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-2">
                        {order.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex justify-between text-sm"
                          >
                            <span>
                              {item.product?.name} (x{item.quantity})
                            </span>
                            <span className="font-medium">
                              ₦{Number(item.total_price).toLocaleString()}
                            </span>
                          </div>
                        ))}

                        <div className="flex justify-between pt-2 border-t font-bold">
                          <span>Total</span>
                          <span>
                            ₦{Number(order.total_amount).toLocaleString()}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Payment Method</span>
                          <span className="capitalize">
                            {order.payment_method?.replace("_", " ")}
                          </span>
                        </div>

                        {orderInvoice && order.payment_status === "paid" && (
                          <div className="pt-2 border-t">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                            onClick={() =>
                                navigate(
                                  `/customer-invoices`
                                )
                              }
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              View Invoice ({orderInvoice.invoice_number})
                            </Button>
                          </div>
                        )} 
                     {/* {orderInvoice && order.payment_status === "paid" && (
  <Button
    variant="outline"
    size="sm"
    className="w-full"
    onClick={() =>
      window.open(
        `${API_BASE}/customer/invoice/${orderInvoice.invoice_number}/download`,
        "_blank"
      )
    }
  >
    <FileText className="h-4 w-4 mr-2" />
    Download Invoice
  </Button>
)} */}
{/* {orderInvoice && order.payment_status === "paid" && (
  <Button
    variant="outline"
    size="sm"
    className="w-full"
       onClick={() =>
      window.open(
        `${API_BASE}/customer/invoice/${orderInvoice.invoice_number}/download`,
        "_blank"
      )}
    // onClick={() => downloadInvoice(orderInvoice.invoice_number)}
    // onClick={() => navigate(`customer-invoices`)}
  >
    <FileText className="h-4 w-4 mr-2" />
    View Invoice
  </Button>
)} */}


                        {/* ✅ Track Order Button */}
                        {/* <div className="pt-2 border-t">
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() =>
                              navigate(`/orders/${order.order_number}`)
                            }
                          >
                            Track Order
                          </Button>
                        </div> */}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              {searchQuery
                ? "No orders found matching your search"
                : "No orders yet"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// import React from "react";
// import { useAuth } from "@/hookss/useAuth";
// import { useQuery } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/uimain/card";
// import { Badge } from "@/components/uimain/Badge";
// import { Input } from "@/components/uimain/Input";
// import { Button } from "@/components/uimain/button";
// import { Loader2, Search, FileText } from "lucide-react";
// import { format } from "date-fns";
// import { useNavigate } from "react-router-dom";

// export default function CustomerOrders() {
//   const { user } = useAuth();
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = React.useState("");

//   const { data: orders, isLoading } = useQuery({
//     queryKey: ["customer-orders", user?.id],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("customer_orders")
//         .select(`
//           *,
//           customer_order_items(
//             *,
//             products(name, sku)
//           )
//         `)
//         .eq("customer_id", user?.id)
//         .order("created_at", { ascending: false });
//       if (error) throw error;
//       return data;
//     },
//     enabled: !!user?.id,
//   });

//   const { data: invoices } = useQuery({
//     queryKey: ["order-invoices", user?.id],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("invoices")
//         .select("invoice_number, sales(customer_orders(id))")
//         .eq("customer_id", user?.id);
//       if (error) throw error;
//       return data;
//     },
//     enabled: !!user?.id,
//   });

//   const filteredOrders = React.useMemo(() => {
//     if (!orders) return [];
//     if (!searchQuery) return orders;

//     return orders.filter((order) => {
//       const searchLower = searchQuery.toLowerCase();
//       return (
//         order.order_number.toLowerCase().includes(searchLower) ||
//         order.payment_method.toLowerCase().includes(searchLower) ||
//         order.status.toLowerCase().includes(searchLower)
//       );
//     });
//   }, [orders, searchQuery]);

//   const getInvoiceForOrder = (orderId) => {
//     return invoices?.find(inv =>
//       inv.sales?.customer_orders?.some((co) => co.id === orderId)
//     );
//   };

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <Loader2 className="h-12 w-12 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
//       <div>
//         <h1 className="text-2xl sm:text-3xl font-bold">My Orders</h1>
//         <p className="text-sm sm:text-base text-muted-foreground">View your purchase history</p>
//       </div>

//       <Card>
//         <CardHeader>
//           <div className="relative w-full">
//             <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
//             <Input
//               placeholder="Search orders..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10 h-11"
//             />
//           </div>
//         </CardHeader>
//         <CardContent>
//           {filteredOrders.length > 0 ? (
//             <div className="space-y-4">
//               {filteredOrders.map((order) => {
//                 const orderInvoice = getInvoiceForOrder(order.id);
//                 return (
//                   <Card key={order.id}>
//                     <CardHeader>
//                       <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
//                         <div>
//                           <CardTitle className="text-base sm:text-lg">
//                             Order #{order.order_number}
//                           </CardTitle>
//                           <CardDescription className="text-xs sm:text-sm">
//                             {format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
//                           </CardDescription>
//                         </div>
//                         <div className="flex gap-2 flex-wrap">
//                           <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
//                             {order.payment_status}
//                           </Badge>
//                           <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
//                             {order.status}
//                           </Badge>
//                         </div>
//                       </div>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="space-y-2">
//                         {order.customer_order_items?.map((item) => (
//                           <div key={item.id} className="flex justify-between text-sm">
//                             <span>
//                               {item.product_name} (x{item.quantity})
//                             </span>
//                             <span className="font-medium">
//                               ₦{Number(item.line_total).toLocaleString()}
//                             </span>
//                           </div>
//                         ))}
//                         <div className="flex justify-between pt-2 border-t font-bold">
//                           <span>Total</span>
//                           <span>₦{Number(order.total_amount).toLocaleString()}</span>
//                         </div>
//                         <div className="flex justify-between text-sm text-muted-foreground">
//                           <span>Payment Method</span>
//                           <span className="capitalize">{order.payment_method.replace("_", " ")}</span>
//                         </div>
//                         {orderInvoice && order.payment_status === "paid" && (
//                           <div className="pt-2 border-t">
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               className="w-full"
//                               onClick={() => navigate("/customer-invoices")}
//                             >
//                               <FileText className="h-4 w-4 mr-2" />
//                               View Invoice ({orderInvoice.invoice_number})
//                             </Button>
//                           </div>
//                         )}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 );
//               })}
//             </div>
//           ) : (
//             <p className="text-center text-muted-foreground py-8">
//               {searchQuery ? "No orders found matching your search" : "No orders yet"}
//             </p>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
