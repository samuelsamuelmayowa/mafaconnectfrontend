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
import { Loader2, ShoppingBag, FileText, Gift, Award } from "lucide-react";
import { format } from "date-fns";

import { useKYCStatus } from "@/hooks/useKYC";
import { KYCStatusCard } from "@/components/KYCStatusCard";

// import { TierProgressCard } from "@/components/TierProgressCard"; // <-- RESTORED

import { TierProgressCard } from "@/components/TierProgressCard";
export default function CustomerDashboard() {
  const { user } = useAuth();
  const { data: kycStatus } = useKYCStatus();
  const API_BASE = import.meta.env.VITE_HOME_OO;

  // -----------------------------------------
  // CUSTOMER PROFILE
  // -----------------------------------------
  const { data: profile } = useQuery({
    queryKey: ["customer-profile", user?.id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/api/customers/${user?.id}`);
      return data;
    },
    enabled: !!user?.id,
  });

  // -----------------------------------------
  // LOYALTY ACCOUNT
  // -----------------------------------------
  const { data: loyaltyAccount } = useQuery({
    queryKey: ["customer-loyalty", user?.id],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/api/loyalty/${user?.id}`);
      return data;
    },
    enabled: !!user?.id,
  });

  // -----------------------------------------
  // RECENT ORDERS
  // -----------------------------------------
  const { data: recentOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ["customer-recent-orders", user?.id],
    queryFn: async () => {
      const { data } = await axios.get(
        `${API_BASE}/api/orders/${user?.id}?limit=5`
      );
      return data;
    },
    enabled: !!user?.id,
  });

  // -----------------------------------------
  // PENDING INVOICES
  // -----------------------------------------
  const { data: pendingInvoices } = useQuery({
    queryKey: ["customer-pending-invoices", user?.id],
    queryFn: async () => {
      const { data } = await axios.get(
        `${API_BASE}/api/invoices/${user?.id}?status=pending`
      );
      return data;
    },
    enabled: !!user?.id,
  });

  // -----------------------------------------
  // ORDER STATS
  // -----------------------------------------
  const { data: orderStats } = useQuery({
    queryKey: ["customer-order-stats", user?.id],
    queryFn: async () => {
      const { data } = await axios.get(
        `${API_BASE}/api/orders/stats/${user?.id}`
      );
      return data;
    },
    enabled: !!user?.id,
  });

  // -----------------------------------------
  // LOADING STATE
  // -----------------------------------------
  if (loadingOrders) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // -----------------------------------------
  // UI OUTPUT
  // -----------------------------------------
  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* WELCOME HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome, {user?.name || "Customer"}!
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Here's your account overview
        </p>
      </div>

      {/* KYC STATUS */}
      {kycStatus && (
        <KYCStatusCard
          kycStatus={kycStatus.kyc_status}
          customerType={kycStatus.customer_type}
          kycNotes={kycStatus.kyc_notes}
        />
      )}

      {/* TIER PROGRESS CARD */}
      {loyaltyAccount && (
        <TierProgressCard
          tiers={[
            {
              id: 1,
              name: "Bronze",
              min_points: 1,
              max_points: 500,
              multiplier: 1,
              benefits: ["Basic member benefits"],
              color: "text-amber-600",
              icon: null,
              sort_order: 1,
              active: true,
            },
            {
              id: 2,
              name: "Silver",
              min_points: 501,
              max_points: 1000,
              multiplier: 1.2,
              benefits: ["Priority support", "Faster rewards"],
              color: "text-slate-400",
              icon: null,
              sort_order: 2,
              active: true,
            },
            {
              id: 3,
              name: "Gold",
              min_points: 1001,
              max_points: 2000,
              multiplier: 1.5,
              benefits: ["VIP support", "Exclusive discounts"],
              color: "text-yellow-500",
              icon: null,
              sort_order: 3,
              active: true,
            },
          ]}
          currentPoints={loyaltyAccount.points_balance}
          currentTierName={loyaltyAccount.tier}
        />
      )}

      {/* STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {orderStats?.totalOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {orderStats?.monthlyOrders || 0} this month
            </p>
          </CardContent>
        </Card>

        {/* Loyalty Points */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Loyalty Points
            </CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loyaltyAccount?.points_balance || 0}
            </div>
            <p className="text-xs text-muted-foreground">Available to redeem</p>
          </CardContent>
        </Card>

        {/* Tier */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Tier</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loyaltyAccount?.tier || "Bronze"}
            </div>
            <p className="text-xs text-muted-foreground">Member status</p>
          </CardContent>
        </Card>

        {/* Pending Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Invoices
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingInvoices?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* RECENT ORDERS */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Your latest purchases</CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.created_at), "MMM d, yyyy")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">
                      ₦{Number(order.total_amount).toLocaleString()}
                    </p>
                    <Badge
                      variant={
                        order.status === "completed" ? "default" : "secondary"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No orders yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// import React from "react";
// import { useAuth } from "@/hooks/useAuth";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/Card";

// import { Badge } from "@/components/ui/Badge";
// import { Loader2, ShoppingBag, FileText, Gift, Award } from "lucide-react";
// import { format } from "date-fns";
// import { useKYCStatus } from "@/hooks/useKYC";
// import { KYCStatusCard } from "@/components/KYCStatusCard";

// export default function CustomerDashboard() {
//   const { user } = useAuth();
//   const { data: kycStatus } = useKYCStatus();
//   const API_BASE = import.meta.env.VITE_HOME_OO;

//   // ✅ Fetch customer profile
//   const { data: profile } = useQuery({
//     queryKey: ["customer-profile", user?.id],
//     queryFn: async () => {
//       const { data } = await axios.get(`${API_BASE}/api/customers/${user?.id}`);
//       return data;
//     },
//     enabled: !!user?.id,
//   });

//   // ✅ Fetch loyalty account
//   const { data: loyaltyAccount } = useQuery({
//     queryKey: ["customer-loyalty", user?.id],
//     queryFn: async () => {
//       const { data } = await axios.get(`${API_BASE}/api/loyalty/${user?.id}`);
//       return data;
//     },
//     enabled: !!user?.id,
//   });

//   // ✅ Fetch recent orders
//   const { data: recentOrders, isLoading: loadingOrders } = useQuery({
//     queryKey: ["customer-recent-orders", user?.id],
//     queryFn: async () => {
//       const { data } = await axios.get(
//         `${API_BASE}/api/orders/${user?.id}?limit=5`
//       );
//       return data;
//     },
//     enabled: !!user?.id,
//   });

//   // ✅ Fetch pending invoices
//   const { data: pendingInvoices } = useQuery({
//     queryKey: ["customer-pending-invoices", user?.id],
//     queryFn: async () => {
//       const { data } = await axios.get(
//         `${API_BASE}/api/invoices/${user?.id}?status=pending`
//       );
//       return data;
//     },
//     enabled: !!user?.id,
//   });

//   // ✅ Fetch order stats
//   const { data: orderStats } = useQuery({
//     queryKey: ["customer-order-stats", user?.id],
//     queryFn: async () => {
//       const { data } = await axios.get(
//         `${API_BASE}/api/orders/stats/${user?.id}`
//       );
//       return data;
//     },
//     enabled: !!user?.id,
//   });
//   console.log("USER KYC STATUS:", user?.kyc_status);
// console.log("PROFILE KYC STATUS:", profile?.kyc_status);

//   if (loadingOrders) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <Loader2 className="h-12 w-12 animate-spin text-primary" />
//       </div>
//     );
//   }

//   // ✅ Layout
//   return (
//     <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
//       <div>
//         <h1 className="text-2xl sm:text-3xl font-bold">
//           Welcome, {user?.name || "Customer"}!
//         </h1>
//         <p className="text-sm sm:text-base text-muted-foreground">
//           Here's your account overview
//         </p>
//       </div>

//       {/* ✅ Stats Cards */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
//             <ShoppingBag className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {orderStats?.totalOrders || 0}
//             </div>
//             <p className="text-xs text-muted-foreground">
//               {orderStats?.monthlyOrders || 0} this month
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Loyalty Points
//             </CardTitle>
//             <Gift className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {loyaltyAccount?.points_balance || 0}
//             </div>
//             <p className="text-xs text-muted-foreground">Available to redeem</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Loyalty Tier</CardTitle>
//             <Award className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {loyaltyAccount?.tier || "Silver"}
//             </div>
//             <p className="text-xs text-muted-foreground">Member status</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">
//               Pending Invoices
//             </CardTitle>
//             <FileText className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">
//               {pendingInvoices?.length || 0}
//             </div>
//             <p className="text-xs text-muted-foreground">Awaiting payment</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* ✅ Recent Orders */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Recent Orders</CardTitle>
//           <CardDescription>Your latest purchases</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {recentOrders && recentOrders.length > 0 ? (
//             <div className="space-y-3">
//               {recentOrders.map((order) => (
//                 <div
//                   key={order.id}
//                   className="flex items-center justify-between p-3 border rounded-lg"
//                 >
//                   <div>
//                     <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
//                     <p className="text-sm text-muted-foreground">
//                       {format(new Date(order.created_at), "MMM d, yyyy")}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-bold">
//                       ₦{Number(order.total_amount).toLocaleString()}
//                     </p>
//                     <Badge
//                       variant={
//                         order.status === "completed" ? "default" : "secondary"
//                       }
//                     >
//                       {order.status}
//                     </Badge>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-muted-foreground text-center py-8">
//               No orders yet
//             </p>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// import React from "react";
// import { useAuth } from "@/hookss/useAuth";
// import { useQuery } from "@tanstack/react-query";
// import { supabase } from "@/integrations/supabase/client";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/uimain/card";
// import { Badge } from "@/components/uimain/Badge";
// import { Loader2, ShoppingBag, FileText, Gift, Award } from "lucide-react";
// import { format } from "date-fns";
// import { useKYCStatus } from "@/hooks/useKYC";
// import { KYCStatusCard } from "@/components/KYCStatusCard";

// export default function CustomerDashboard() {
//   const { user } = useAuth();
//   const { data: kycStatus } = useKYCStatus();

//   // Fetch customer profile
//   const { data: profile } = useQuery({
//     queryKey: ["customer-profile", user?.id],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("profiles")
//         .select("*")
//         .eq("id", user?.id)
//         .single();
//       if (error) throw error;
//       return data;
//     },
//     enabled: !!user?.id,
//   });

//   // Fetch loyalty account
//   const { data: loyaltyAccount } = useQuery({
//     queryKey: ["customer-loyalty", user?.id],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("loyalty_accounts")
//         .select("*")
//         .eq("customer_id", user?.id)
//         .maybeSingle();
//       if (error) throw error;
//       return data;
//     },
//     enabled: !!user?.id,
//   });

//   // Fetch recent orders
//   const { data: recentOrders, isLoading: loadingOrders } = useQuery({
//     queryKey: ["customer-recent-orders", user?.id],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("sales")
//         .select("*")
//         .eq("customer_id", user?.id)
//         .order("created_at", { ascending: false })
//         .limit(5);
//       if (error) throw error;
//       return data;
//     },
//     enabled: !!user?.id,
//   });

//   // Fetch pending invoices
//   const { data: pendingInvoices } = useQuery({
//     queryKey: ["customer-pending-invoices", user?.id],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("invoices")
//         .select("*")
//         .eq("customer_id", user?.id)
//         .in("status", ["draft", "sent"])
//         .order("created_at", { ascending: false });
//       if (error) throw error;
//       return data;
//     },
//     enabled: !!user?.id,
//   });

//   // Calculate stats
//   const { data: orderStats } = useQuery({
//     queryKey: ["customer-order-stats", user?.id],
//     queryFn: async () => {
//       const { data, error } = await supabase
//         .from("sales")
//         .select("total_amount, created_at")
//         .eq("customer_id", user?.id);
//       if (error) throw error;

//       const now = new Date();
//       const thisMonth = data?.filter(sale => {
//         const saleDate = new Date(sale.created_at);
//         return saleDate.getMonth() === now.getMonth() &&
//                saleDate.getFullYear() === now.getFullYear();
//       }) || [];

//       const totalSpent = data?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
//       const monthlySpent = thisMonth.reduce((sum, sale) => sum + Number(sale.total_amount), 0);

//       return {
//         totalOrders: data?.length || 0,
//         monthlyOrders: thisMonth.length,
//         totalSpent,
//         monthlySpent,
//       };
//     },
//     enabled: !!user?.id,
//   });

//   if (loadingOrders) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <Loader2 className="h-12 w-12 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
//       <div>
//         <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {profile?.full_name || "Customer"}!</h1>
//         <p className="text-sm sm:text-base text-muted-foreground">Here's your account overview</p>
//       </div>

//       {kycStatus && (
//         <KYCStatusCard
//           kycStatus={kycStatus.kyc_status}
//           customerType={kycStatus.customer_type}
//           kycNotes={kycStatus.kyc_notes}
//         />
//       )}

//       {/* Stats Cards */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
//             <ShoppingBag className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{orderStats?.totalOrders || 0}</div>
//             <p className="text-xs text-muted-foreground">
//               {orderStats?.monthlyOrders || 0} this month
//             </p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
//             <Gift className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{loyaltyAccount?.points_balance || 0}</div>
//             <p className="text-xs text-muted-foreground">Available to redeem</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Loyalty Tier</CardTitle>
//             <Award className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{loyaltyAccount?.tier || "Silver"}</div>
//             <p className="text-xs text-muted-foreground">Member status</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
//             <FileText className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{pendingInvoices?.length || 0}</div>
//             <p className="text-xs text-muted-foreground">Awaiting payment</p>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Recent Orders */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Recent Orders</CardTitle>
//           <CardDescription>Your latest purchases</CardDescription>
//         </CardHeader>
//         <CardContent>
//           {recentOrders && recentOrders.length > 0 ? (
//             <div className="space-y-3">
//               {recentOrders.map((order) => (
//                 <div
//                   key={order.id}
//                   className="flex items-center justify-between p-3 border rounded-lg"
//                 >
//                   <div>
//                     <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
//                     <p className="text-sm text-muted-foreground">
//                       {format(new Date(order.created_at), "MMM d, yyyy")}
//                     </p>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-bold">₦{Number(order.total_amount).toLocaleString()}</p>
//                     <Badge variant={order.status === "completed" ? "default" : "secondary"}>
//                       {order.status}
//                     </Badge>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           ) : (
//             <p className="text-muted-foreground text-center py-8">No orders yet</p>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
