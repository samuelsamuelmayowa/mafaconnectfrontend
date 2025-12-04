import * as React from "react";
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
import { TierProgressCard } from "@/components/TierProgressCard";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";

export default function CustomerDashboard() {
  const { user } = useAuth();
  const { data: kycStatus } = useKYCStatus();

  const API_BASE = import.meta.env.VITE_HOME_OO;
  const token = localStorage.getItem("ACCESS_TOKEN");

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` },
    withCredentials: true,
  };

  // -----------------------------------------
  // CUSTOMER PROFILE
  // -----------------------------------------
  const { data: profile } = useQuery({
    queryKey: ["customer-profile", user?.id],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/auth/me`, authHeaders);
      return res.data.user;
    },
    enabled: !!user?.id,
  });

  // -----------------------------------------
  // LOYALTY ACCOUNT
  // -----------------------------------------
  const { data: loyaltyAccount } = useQuery({
    queryKey: ["customer-loyalty", user?.id],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/loyalty/${user?.id}`, authHeaders);
      return res.data;
    },
    enabled: !!user?.id,
  });

  // -----------------------------------------
  // LOYALTY TIERS
  // -----------------------------------------
  const { data: tiers = [] } = useQuery({
    queryKey: ["loyalty-tiers"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/loyalty/tiers`, authHeaders);
      return res.data.data || [];
    },
  });

  // -----------------------------------------
  // REWARDS
  // -----------------------------------------
  const { data: rewards = [] } = useQuery({
    queryKey: ["loyalty-rewards"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/loyalty/rewards`, authHeaders);
      return res.data;
    },
  });

  // -----------------------------------------
  // RECENT ORDERS
  // -----------------------------------------
  const { data: recentOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ["customer-recent-orders", user?.id],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/orders/user/${user?.id}`, authHeaders);
      return res.data.data || [];
    },
    enabled: !!user?.id,
  });

  // -----------------------------------------
  // PENDING INVOICES
  // -----------------------------------------
  const { data: pendingInvoices = [] } = useQuery({
    queryKey: ["customer-pending-invoices", user?.id],
    queryFn: async () => {
      const res = await axios.get(
        `${API_BASE}/invoices/${user?.id}?status=pending`,
        authHeaders
      );
      return res.data.data || [];
    },
    enabled: !!user?.id,
  });

  // -----------------------------------------
  // ORDER STATS
  // -----------------------------------------
  const { data: orderStats } = useQuery({
    queryKey: ["customer-order-stats", user?.id],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/orders/stats/${user?.id}`, authHeaders);
      return res.data.data;
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

  // Normalize tiers
  const normalizedTiers = tiers.map((t) => ({
    ...t,
    benefits:
      typeof t.benefits === "string" ? JSON.parse(t.benefits) : t.benefits || [],
    multiplier: t.multiplier || 1,
    sort_order: t.sort_order ?? t.min_points ?? 0,
  }));

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">
          Welcome, {profile?.name || "Customer"}!
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

      {/* TIER PROGRESS */}


          {loyaltyAccount && (
        <TierProgressCard
          tiers={normalizedTiers}
          currentPoints={loyaltyAccount.points_balance}
          currentTierName={loyaltyAccount.tier}
        />
      )}

      {/* REWARDS CTA */}
      {loyaltyAccount && rewards?.length > 0 && (
        <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Redeem Your Points
                </CardTitle>
                <CardDescription>
                  You have {loyaltyAccount.points_balance.toLocaleString()} points available
                </CardDescription>
              </div>

              <Badge variant="secondary">
                {
                  rewards.filter(
                    (r) =>
                      r.active && r.points_cost <= loyaltyAccount.points_balance
                  ).length
                }{" "}
                Available
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Explore rewards and redeem points.
            </p>

            <Link to="/loyalty">
              <Button className="w-full sm:w-auto">Browse Rewards</Button>
            </Link>
          </CardContent>
        </Card>
      )}
      {/* {loyaltyAccount && (
        <TierProgressCard
          tiers={normalizedTiers}
          currentPoints={loyaltyAccount.points_balance}
          currentTierName={loyaltyAccount.tier}
        />
      )} */}

      {/* REWARDS CTA */}
      {/* {loyaltyAccount && rewards?.length > 0 && (
        <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Redeem Your Points
                </CardTitle>
                <CardDescription>
                  You have {loyaltyAccount.points_balance.toLocaleString()} points available
                </CardDescription>
              </div>

              <Badge variant="secondary">
                {
                  rewards.filter(
                    (r) =>
                      r.active && r.points_cost <= loyaltyAccount.points_balance
                  ).length
                }{" "}
                Available
              </Badge>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Explore rewards and redeem points.
            </p>

            <Link to="/loyalty">
              <Button className="w-full sm:w-auto">Browse Rewards</Button>
            </Link>
          </CardContent>
        </Card>
      )} */}

      {/* STATS CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

        {/* Total Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{orderStats?.totalOrders || 0}</div>
          </CardContent>
        </Card>

        {/* Loyalty Points */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">
              {loyaltyAccount?.points_balance || 0}
            </div>
          </CardContent>
        </Card>

        {/* Tier */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Tier</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{loyaltyAccount?.tier || "Bronze"}</div>
          </CardContent>
        </Card>

        {/* Pending Invoices */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders 
              
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold">{pendingInvoices?.length || 0}</div>
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
          {recentOrders?.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      Order #{order.order_number}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.createdAt), "MMM d, yyyy")}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">
                      ₦{Number(order.total_amount).toLocaleString()}
                    </p>

                    <Badge
                      variant={
                        order.order_status === "completed"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {order.order_status}
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

// import * as React from "react";
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
// import { TierProgressCard } from "@/components/TierProgressCard";
// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/Button";

// export default function CustomerDashboard() {
//   const { user } = useAuth();
//   const { data: kycStatus } = useKYCStatus();
//   const API_BASE = import.meta.env.VITE_HOME_OO;

//   const token = localStorage.getItem("ACCESS_TOKEN");

//   const authHeaders = {
//     headers: { Authorization: `Bearer ${token}` },
//     withCredentials: true,
//   };

//   // -----------------------------------------
//   // CUSTOMER PROFILE
//   // -----------------------------------------
//   const { data: profile } = useQuery({
//     queryKey: ["customer-profile", user?.id],
//     queryFn: async () => {
//       const res = await axios.get(`${API_BASE}/auth/me`, authHeaders);
//       return res.data.user;
//     },
//     enabled: !!user?.id,
//   });

//   // -----------------------------------------
//   // LOYALTY ACCOUNT
//   // -----------------------------------------
//   const { data: loyaltyAccount } = useQuery({
//     queryKey: ["customer-loyalty", user?.id],
//     queryFn: async () => {
//       const res = await axios.get(`${API_BASE}/loyalty/${user?.id}`, authHeaders);
//       return res.data;
//     },
//     enabled: !!user?.id,
//   });

//   // -----------------------------------------
//   // LOYALTY TIERS
//   // -----------------------------------------
//   const { data: tiers = [] } = useQuery({
//     queryKey: ["loyalty-tiers"],
//     queryFn: async () => {
//       const res = await axios.get(`${API_BASE}/loyalty/tiers`, authHeaders);
//       return res.data.data || [];
//     },
//   });

//   // -----------------------------------------
//   // REWARDS
//   // -----------------------------------------
//   const { data: rewards = [] } = useQuery({
//     queryKey: ["loyalty-rewards"],
//     queryFn: async () => {
//       const res = await axios.get(`${API_BASE}/loyalty/rewards`, authHeaders);
//       return res.data;
//     },
//   });

//   // -----------------------------------------
//   // RECENT ORDERS
//   // -----------------------------------------
//   const { data: ordersRes, isLoading: loadingOrders } = useQuery({
//     queryKey: ["customer-recent-orders", user?.id],
//     queryFn: async () => {
//       const res = await axios.get(`${API_BASE}/orders/${user?.id}`, authHeaders);
//       return res.data.data || res.data;
//     },
//     enabled: !!user?.id,
//   });

//   const recentOrders = Array.isArray(ordersRes) ? ordersRes : ordersRes?.data || [];

//   // -----------------------------------------
//   // PENDING INVOICES
//   // -----------------------------------------
//   const { data: pendingInvoices } = useQuery({
//     queryKey: ["customer-pending-invoices", user?.id],
//     queryFn: async () => {
//       const res = await axios.get(
//         `${API_BASE}/invoices/${user?.id}?status=pending`,
//         authHeaders
//       );
//       return res.data.data || [];
//     },
//     enabled: !!user?.id,
//   });

//   // -----------------------------------------
//   // ORDER STATS
//   // -----------------------------------------
//   const { data: orderStats } = useQuery({
//     queryKey: ["customer-order-stats", user?.id],
//     queryFn: async () => {
//       const res = await axios.get(`${API_BASE}/orders/stats/${user?.id}`, authHeaders);
//       return res.data.data;
//     },
//     enabled: !!user?.id,
//   });

//   // -----------------------------------------
//   // LOADING STATE
//   // -----------------------------------------
//   if (loadingOrders) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <Loader2 className="h-12 w-12 animate-spin text-primary" />
//       </div>
//     );
//   }

//   // -----------------------------------------
//   // NORMALIZED TIERS
//   // -----------------------------------------
//   const normalizedTiers = tiers.map((t) => ({
//     ...t,
//     benefits: typeof t.benefits === "string" ? JSON.parse(t.benefits) : t.benefits || [],
//     multiplier: t.multiplier || 1,
//     sort_order: t.sort_order ?? t.min_points ?? 0,
//   }));

//   return (
//     <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
//       {/* HEADER */}
//       <div>
//         <h1 className="text-2xl sm:text-3xl font-bold">
//           Welcome, {profile?.name || "Customer"}!
//         </h1>
//         <p className="text-sm sm:text-base text-muted-foreground">
//           Here's your account overview
//         </p>
//       </div>

//       {/* KYC CARD */}
//       {kycStatus && (
//         <KYCStatusCard
//           kycStatus={kycStatus.kyc_status}
//           customerType={kycStatus.customer_type}
//           kycNotes={kycStatus.kyc_notes}
//         />
//       )}

//       {/* TIER PROGRESS */}
//       {loyaltyAccount && (
//         <TierProgressCard
//           tiers={normalizedTiers}
//           currentPoints={loyaltyAccount.points_balance}
//           currentTierName={loyaltyAccount.tier}
//         />
//       )}

//       {/* REDEEM CTA */}
//       {loyaltyAccount && rewards?.length > 0 && (
//         <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
//           <CardHeader>
//             <div className="flex items-start justify-between">
//               <div>
//                 <CardTitle className="flex items-center gap-2">
//                   <Gift className="h-5 w-5 text-primary" />
//                   Redeem Your Points
//                 </CardTitle>
//                 <CardDescription>
//                   You have {loyaltyAccount.points_balance.toLocaleString()} points available
//                 </CardDescription>
//               </div>

//               <Badge variant="secondary">
//                 {rewards.filter(
//                   (r) => r.active && r.points_cost <= loyaltyAccount.points_balance
//                 ).length}{" "}
//                 Available
//               </Badge>
//             </div>
//           </CardHeader>

//           <CardContent>
//             <p className="text-sm text-muted-foreground mb-4">
//               Explore our rewards catalog and redeem your points for exclusive benefits.
//             </p>

//             <Link to="/loyalty">
//               <Button className="w-full sm:w-auto">Browse Rewards</Button>
//             </Link>
//           </CardContent>
//         </Card>
//       )}

//       {/* STATS CARDS */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         {/* Total Orders */}
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
//             <ShoppingBag className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>

//           <CardContent>
//             <div className="text-2xl font-bold">{orderStats?.totalOrders || 0}</div>
//           </CardContent>
//         </Card>

//         {/* Loyalty Points */}
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
//             <Gift className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>

//           <CardContent>
//             <div className="text-2xl font-bold">
//               {loyaltyAccount?.points_balance || 0}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Loyalty Tier */}
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Loyalty Tier</CardTitle>
//             <Award className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>

//           <CardContent>
//             <div className="text-2xl font-bold">{loyaltyAccount?.tier || "Bronze"}</div>
//           </CardContent>
//         </Card>

//         {/* Pending Invoices */}
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
//             <FileText className="h-4 w-4 text-muted-foreground" />
//           </CardHeader>

//           <CardContent>
//             <div className="text-2xl font-bold">
//               {pendingInvoices?.length || 0}
//             </div>
//           </CardContent>
//         </Card>
//       </div>

//       {/* RECENT ORDERS */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Recent Orders</CardTitle>
//           <CardDescription>Your latest purchases</CardDescription>
//         </CardHeader>

//         <CardContent>
//           {recentOrders?.length > 0 ? (
//             <div className="space-y-3">
//               {recentOrders.map((order) => (
//                 <div
//                   key={order.id}
//                   className="flex items-center justify-between p-3 border rounded-lg"
//                 >
//                   <div>
//                     <p className="font-medium">Order #{order.order_number}</p>
//                     <p className="text-sm text-muted-foreground">
//                       {format(new Date(order.createdAt), "MMM d, yyyy")}
//                     </p>
//                   </div>

//                   <div className="text-right">
//                     <p className="font-bold">
//                       ₦{Number(order.total_amount).toLocaleString()}
//                     </p>

//                     <Badge
//                       variant={
//                         order.order_status === "completed" ? "default" : "secondary"
//                       }
//                     >
//                       {order.order_status}
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

// // import React from "react";
// // import { useAuth } from "@/hooks/useAuth";
// // import { useQuery } from "@tanstack/react-query";
// // import axios from "axios";

// // import {
// //   Card,
// //   CardContent,
// //   CardDescription,
// //   CardHeader,
// //   CardTitle,
// // } from "@/components/ui/Card";

// // import { Badge } from "@/components/ui/Badge";
// // import { Loader2, ShoppingBag, FileText, Gift, Award } from "lucide-react";
// // import { format } from "date-fns";

// // import { useKYCStatus } from "@/hooks/useKYC";
// // import { KYCStatusCard } from "@/components/KYCStatusCard";
// // import { TierProgressCard } from "@/components/TierProgressCard";
// // import { useRewards } from "@/hooks/useRewards";

// // export default function CustomerDashboard() {
// //   const token = localStorage.getItem("ACCESS_TOKEN");
// //   const { user } = useAuth();
// //   const { data: kycStatus } = useKYCStatus();
// //   const API_BASE = import.meta.env.VITE_HOME_OO;

// //   const authHeaders = {
// //     headers: { Authorization: `Bearer ${token}` },
// //     credentials: "include",
// //   };

// //   // -----------------------------------------
// //   // CUSTOMER PROFILE
// //   // -----------------------------------------
// //   const { data: profile } = useQuery({
// //     queryKey: ["customer-profile", user?.id],
// //     queryFn: async () => {
// //       const { data } = await axios.get(`${API_BASE}/auth/me`, authHeaders);
// //       return data.user;
// //     },
// //     enabled: !!user?.id,
// //   });

// //   // -----------------------------------------
// //   // RECENT ORDERS
// //   // -----------------------------------------
// //   const { data: recentOrdersRes, isLoading: loadingOrders } = useQuery({
// //     queryKey: ["customer-recent-orders", user?.id],
// //     queryFn: async () => {
// //       const { data } = await axios.get(
// //         `${API_BASE}/orders/${user?.id}`,
// //         authHeaders
// //       );
// //       return data.data || data; // support both formats
// //     },
// //     enabled: !!user?.id,
// //   });

// //   const recentOrders = Array.isArray(recentOrdersRes)
// //     ? recentOrdersRes
// //     : recentOrdersRes?.data || [];

// //   // -----------------------------------------
// //   // PENDING INVOICES
// //   // -----------------------------------------
// //   const { data: pendingInvoices } = useQuery({
// //     queryKey: ["customer-pending-invoices", user?.id],
// //     queryFn: async () => {
// //       const { data } = await axios.get(
// //         `${API_BASE}/invoices/${user?.id}?status=pending`,
// //         authHeaders
// //       );
// //       return data; // { success, data }
// //     },
// //     enabled: !!user?.id,
// //   });

// //   // -----------------------------------------
// //   // ORDER STATS
// //   // -----------------------------------------
// //   const { data: orderStats } = useQuery({
// //     queryKey: ["customer-order-stats", user?.id],
// //     queryFn: async () => {
// //       const { data } = await axios.get(
// //         `${API_BASE}/orders/stats/${user?.id}`,
// //         authHeaders
// //       );
// //       return data; // { success, data: {...} }
// //     },
// //     enabled: !!user?.id,
// //   });

// //   // -----------------------------------------
// //   // LOYALTY ACCOUNT
// //   // -----------------------------------------
// //   const { data: loyaltyAccount, isLoading: loadingAccount } = useQuery({
// //     queryKey: ["customer-loyalty", user?.id],
// //     queryFn: async () => {
// //       const { data } = await axios.get(`${API_BASE}/loyalty/${user?.id}`);
// //       return data;
// //     },
// //     enabled: !!user?.id,
// //   });

// //   const { data: tiers = [], isLoading: loadingTiers } = useQuery({
// //     queryKey: ["loyalty-tiers"],
// //     queryFn: async () => {
// //       const { data } = await axios.get(`${API_BASE}/loyalty/tiers`);
// //       return data.data || [];
// //     },
// //   });

// //   const { data: rewards = [], isLoading: loadingRewards } = useQuery({
// //     queryKey: ["loyalty-rewards"],
// //     queryFn: async () => {
// //       const { data } = await axios.get(`${API_BASE}/loyalty/rewards`);
// //       return data;
// //     },
// //   });

// //   const normalizedTiers = Array.isArray(tiers)
// //     ? tiers.map((t) => ({
// //         ...t,
// //         benefits:
// //           typeof t.benefits === "string"
// //             ? JSON.parse(t.benefits || "[]")
// //             : t.benefits || [],
// //         multiplier: t.multiplier || 1,
// //         sort_order: t.sort_order ?? t.min_points ?? 0,
// //       }))
// //     : [];

// //   if (loadingOrders) {
// //     return (
// //       <div className="flex items-center justify-center h-96">
// //         <Loader2 className="h-12 w-12 animate-spin text-primary" />
// //       </div>
// //     );
// //   }

// //   if (loadingAccount || loadingTiers || loadingRewards) {
// //     return <p>Loading...</p>;
// //   }

// //   return (
// //     <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">

// //       {/* WELCOME */}
// //       <h1 className="text-2xl sm:text-3xl font-bold">
// //         Welcome, {user?.name || "Customer"}!
// //       </h1>

// //       {/* KYC */}
// //       {kycStatus && (
// //         <KYCStatusCard
// //           kycStatus={kycStatus.kyc_status}
// //           customerType={kycStatus.customer_type}
// //           kycNotes={kycStatus.kyc_notes}
// //         />
// //       )}

// //       {/* TIER */}
// //       {loyaltyAccount && (
// //         <TierProgressCard
// //           tiers={normalizedTiers}
// //           currentPoints={loyaltyAccount.points_balance}
// //           currentTierName={loyaltyAccount.tier}
// //         />
// //       )}

// //       {/* STATS */}
// //       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
// //         <Card>
// //           <CardHeader className="flex flex-row items-center justify-between">
// //             <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
// //             <ShoppingBag className="h-4 w-4 text-muted-foreground" />
// //           </CardHeader>
// //           <CardContent>
// //             <div className="text-2xl font-bold">
// //               {orderStats?.data?.totalOrders || 0}
// //             </div>
// //           </CardContent>
// //         </Card>

// //         <Card>
// //           <CardHeader className="flex flex-row items-center justify-between">
// //             <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
// //             <FileText className="h-4 w-4 text-muted-foreground" />
// //           </CardHeader>
// //           <CardContent>
// //             <div className="text-2xl font-bold">
// //               {pendingInvoices?.data?.length || 0}
// //             </div>
// //           </CardContent>
// //         </Card>
// //       </div>

// //       {/* RECENT ORDERS */}
// //       <Card>
// //         <CardHeader>
// //           <CardTitle>Recent Orders</CardTitle>
// //           <CardDescription>Your latest purchases</CardDescription>
// //         </CardHeader>

// //         <CardContent>
// //           {recentOrders?.length > 0 ? (
// //             <div className="space-y-3">
// //               {recentOrders.map((order) => (
// //                 <div
// //                   key={order.id}
// //                   className="flex items-center justify-between p-3 border rounded-lg"
// //                 >
// //                   <div>
// //                     <p className="font-medium">Order #{order.order_number}</p>
// //                     <p className="text-sm text-muted-foreground">
// //                       {format(new Date(order.createdAt), "MMM d, yyyy")}
// //                     </p>
// //                   </div>

// //                   <div className="text-right">
// //                     <p className="font-bold">
// //                       ₦{Number(order.total_amount).toLocaleString()}
// //                     </p>
// //                     <Badge
// //                       variant={
// //                         order.order_status === "completed"
// //                           ? "default"
// //                           : "secondary"
// //                       }
// //                     >
// //                       {order.order_status}
// //                     </Badge>
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           ) : (
// //             <p className="text-muted-foreground text-center py-8">
// //               No orders yet
// //             </p>
// //           )}
// //         </CardContent>
// //       </Card>
// //     </div>
// //   );
// // }

// // // import React from "react";
// // // import { useAuth } from "@/hooks/useAuth";
// // // import { useQuery } from "@tanstack/react-query";
// // // import axios from "axios";

// // // import {
// // //   Card,
// // //   CardContent,
// // //   CardDescription,
// // //   CardHeader,
// // //   CardTitle,
// // // } from "@/components/ui/Card";

// // // import { Badge } from "@/components/ui/Badge";
// // // import { Loader2, ShoppingBag, FileText, Gift, Award } from "lucide-react";
// // // import { format } from "date-fns";

// // // import { useKYCStatus } from "@/hooks/useKYC";
// // // import { KYCStatusCard } from "@/components/KYCStatusCard";

// // // // import { TierProgressCard } from "@/components/TierProgressCard"; // <-- RESTORED

// // // import { TierProgressCard } from "@/components/TierProgressCard";
// // // import { useRewards } from "@/hooks/useRewards";
// // // export default function CustomerDashboard() {
// // //     const token = localStorage.getItem("ACCESS_TOKEN");
// // //   const { user } = useAuth();
// // //   const { data: kycStatus } = useKYCStatus();
// // //   const API_BASE = import.meta.env.VITE_HOME_OO;
// // //   // const { rewards } = useRewards();
// // //   // -----------------------------------------
// // //   // CUSTOMER PROFILE
// // //   // -----------------------------------------
// // //   const { data: profile } = useQuery({
// // //     queryKey: ["customer-profile", user?.id],
// // //     queryFn: async () => {
// // //       const { data } = await axios.get(`${API_BASE}/auth/me`, {  headers: { Authorization: `Bearer ${token}` },
// // //     credentials: "include",});
// // //       return data.user;
// // //     },
// // //     enabled: !!user?.id,
// // //   });

// // //   // -----------------------------------------
// // //   // LOYALTY ACCOUNT
// // //   // -----------------------------------------
// // //   // const { data: loyaltyAccount } = useQuery({
// // //   //   queryKey: ["customer-loyalty", user?.id],
// // //   //   queryFn: async () => {
// // //   //     const { data } = await axios.get(`${API_BASE}/loyalty/${user?.id}`);
// // //   //     return data;
// // //   //   },
// // //   //   enabled: !!user?.id,
// // //   // });

// // //   // -----------------------------------------
// // //   // RECENT ORDERS
// // //   // -----------------------------------------
// // //   const { data: recentOrders, isLoading: loadingOrders } = useQuery({
// // //     queryKey: ["customer-recent-orders", user?.id],
// // //     queryFn: async () => {
// // //       const { data } = await axios.get(
// // //         `${API_BASE}/orders/${user?.id}`,
// // //         {  headers: { Authorization: `Bearer ${token}` },
// // //     credentials: "include",}
// // //         //  `${API_BASE}orders/${user?.id}?limit=5`
// // //       );
// // //       return data;
// // //     },
// // //     enabled: !!user?.id,
// // //   });

// // //   // -----------------------------------------
// // //   // PENDING INVOICES
// // //   // -----------------------------------------
// // //   const { data: pendingInvoices } = useQuery({
// // //     queryKey: ["customer-pending-invoices", user?.id],
// // //     queryFn: async () => {
// // //       const { data } = await axios.get(
// // //         `${API_BASE}/invoices/${user?.id}?status=pending`,
// // //         {  headers: { Authorization: `Bearer ${token}` },
// // //     credentials: "include",}
// // //       );
// // //       return data;
// // //     },
// // //     enabled: !!user?.id,
// // //   });

// // //   // -----------------------------------------
// // //   // ORDER STATS
// // //   // -----------------------------------------
// // //   const { data: orderStats } = useQuery({
// // //     queryKey: ["customer-order-stats", user?.id],
// // //     queryFn: async () => {
// // //       const { data } = await axios.get(
// // //         `${API_BASE}/orders/stats/${user?.id}`,{
// // //             headers: { Authorization: `Bearer ${token}` },
// // //     credentials: "include",
// // //         }
// // //       );
// // //       return data;
// // //     },
// // //     enabled: !!user?.id,
// // //   });

// // //   // -----------------------------------------
// // //   // LOADING STATE
// // //   // -----------------------------------------
// // //   const { data: loyaltyAccount, isLoading: loadingAccount } = useQuery({
// // //     queryKey: ["customer-loyalty", user?.id],
// // //     queryFn: async () => {
// // //       const { data } = await axios.get(`${API_BASE}/loyalty/${user?.id}`);
// // //       console.log("form here ",data)
// // //       return data;
// // //     },
// // //     enabled: !!user?.id,
// // //   });

// // //   const { data: tiers = [], isLoading: loadingTiers } = useQuery({
// // //     queryKey: ["loyalty-tiers"],
// // //     queryFn: async () => {
// // //       const { data } = await axios.get(`${API_BASE}/loyalty/tiers`);
// // //       return data.data || []; // backend returns { data: [...] }
// // //     },
// // //   });

// // //   const { data: rewards = [], isLoading: loadingRewards } = useQuery({
// // //     queryKey: ["loyalty-rewards"],
// // //     queryFn: async () => {
// // //       const { data } = await axios.get(`${API_BASE}/loyalty/rewards`);
// // //       return data;
// // //     },
// // //   });

// // //   const normalizedTiers = Array.isArray(tiers)
// // //     ? tiers.map((t) => ({
// // //         ...t,
// // //         // Backend sends benefits as JSON string → parse safely
// // //         benefits:
// // //           typeof t.benefits === "string"
// // //             ? JSON.parse(t.benefits || "[]")
// // //             : t.benefits || [],

// // //         // Fallback for multiplier
// // //         multiplier: t.multiplier || 1,

// // //         // Ensure sort order exists (otherwise dashboard crashes)
// // //         sort_order: t.sort_order ?? t.min_points ?? 0,
// // //       }))
// // //     : [];
// // //   if (loadingOrders) {
// // //     return (
// // //       <div className="flex items-center justify-center h-96">
// // //         <Loader2 className="h-12 w-12 animate-spin text-primary" />
// // //       </div>
// // //     );
// // //   }

// // //   // -----------------------------------------
// // //   // UI OUTPUT
// // //   // -----------------------------------------
// // //   if (loadingAccount || loadingTiers || loadingRewards) {
// // //     return <p>Loading...</p>;
// // //   }
// // //   return (
// // //     <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
// // //       {/* WELCOME HEADER */}
// // //       <div>
// // //         <h1 className="text-2xl sm:text-3xl font-bold">
// // //           Welcome, {user?.name || "Customer"}!
// // //         </h1>
// // //         <p className="text-sm sm:text-base text-muted-foreground">
// // //           Here's your account overview
// // //         </p>
// // //       </div>

// // //       {/* KYC STATUS */}
// // //       {kycStatus && (
// // //         <KYCStatusCard
// // //           kycStatus={kycStatus.kyc_status}
// // //           customerType={kycStatus.customer_type}
// // //           kycNotes={kycStatus.kyc_notes}
// // //         />
// // //       )}

// // //       {/* TIER PROGRESS CARD */}
// // //       {loyaltyAccount && (
       
// // //         <TierProgressCard
// // //           tiers={normalizedTiers}
// // //           currentPoints={loyaltyAccount.points_balance}
// // //           currentTierName={loyaltyAccount.tier}
// // //         />
// // //       )}

// // //       {/* Redeem Rewards CTA */}
// // //       {loyaltyAccount && rewards && rewards.length > 0 && (
// // //         <Card className="border-primary/50 bg-gradient-to-r from-primary/5 to-primary/10">
// // //           <CardHeader>
// // //             <div className="flex items-start justify-between">
// // //               <div>
// // //                 <CardTitle className="flex items-center gap-2">
// // //                   <Gift className="h-5 w-5 text-primary" />
// // //                   Redeem Your Points
// // //                 </CardTitle>
// // //                 <CardDescription>
// // //                   You have {loyaltyAccount.points_balance.toLocaleString()}{" "}
// // //                   points available
// // //                 </CardDescription>
// // //               </div>
// // //               <Badge variant="secondary">
// // //                 {
// // //                   rewards.filter(
// // //                     (r) =>
// // //                       r.active && r.points_cost <= loyaltyAccount.points_balance
// // //                   ).length
// // //                 }{" "}
// // //                 Available
// // //               </Badge>
// // //             </div>
// // //           </CardHeader>
// // //           <CardContent>
// // //             <p className="text-sm text-muted-foreground mb-4">
// // //               Explore our rewards catalog and redeem your points for exclusive
// // //               benefits, discounts, and special offers.
// // //             </p>
// // //             <Link to="/loyalty">
// // //               <Button className="w-full sm:w-auto">Browse Rewards</Button>
// // //             </Link>
// // //           </CardContent>
// // //         </Card>
// // //       )}

// // //       {/* STATS CARDS */}
// // //       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
// // //         {/* Total Orders */}
// // //         <Card>
// // //           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// // //             <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
// // //             <ShoppingBag className="h-4 w-4 text-muted-foreground" />
// // //           </CardHeader>
// // //           <CardContent>
// // //             <div className="text-2xl font-bold">
// // //               {orderStats?.totalOrders || 0}
// // //             </div>
// // //             <p className="text-xs text-muted-foreground">
// // //               {orderStats?.monthlyOrders || 0} this month
// // //             </p>
// // //           </CardContent>
// // //         </Card>

// // //         {/* Loyalty Points */}
// // //         <Card>
// // //           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// // //             <CardTitle className="text-sm font-medium">
// // //               Loyalty Points
// // //             </CardTitle>
// // //             <Gift className="h-4 w-4 text-muted-foreground" />
// // //           </CardHeader>
// // //           <CardContent>
// // //             <div className="text-2xl font-bold">
// // //               {loyaltyAccount?.points_balance || 0}
// // //             </div>
// // //             <p className="text-xs text-muted-foreground">Available to redeem</p>
// // //           </CardContent>
// // //         </Card>

// // //         {/* Tier */}
// // //         <Card>
// // //           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// // //             <CardTitle className="text-sm font-medium">Loyalty Tier</CardTitle>
// // //             <Award className="h-4 w-4 text-muted-foreground" />
// // //           </CardHeader>
// // //           <CardContent>
// // //             <div className="text-2xl font-bold">
// // //               {loyaltyAccount?.tier || "Bronze"}
// // //             </div>
// // //             <p className="text-xs text-muted-foreground">Member status</p>
// // //           </CardContent>
// // //         </Card>

// // //         {/* Pending Invoices */}
// // //         <Card>
// // //           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// // //             <CardTitle className="text-sm font-medium">
// // //               Pending Invoices
// // //             </CardTitle>
// // //             <FileText className="h-4 w-4 text-muted-foreground" />
// // //           </CardHeader>
// // //           <CardContent>
// // //             <div className="text-2xl font-bold">
// // //               {pendingInvoices?.length || 0}
// // //             </div>
// // //             <p className="text-xs text-muted-foreground">Awaiting payment</p>
// // //           </CardContent>
// // //         </Card>
// // //       </div>

// // //       {/* RECENT ORDERS */}
// // //       <Card>
// // //         <CardHeader>
// // //           <CardTitle>Recent Orders</CardTitle>
// // //           <CardDescription>Your latest purchases</CardDescription>
// // //         </CardHeader>
// // //         <CardContent>
// // //           {recentOrders && recentOrders.length > 0 ? (
// // //             <div className="space-y-3">
// // //               {recentOrders.map((order) => (
// // //                 <div
// // //                   key={order.id}
// // //                   className="flex items-center justify-between p-3 border rounded-lg"
// // //                 >
// // //                   <div>
// // //                     <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
// // //                     <p className="text-sm text-muted-foreground">
// // //                       {format(new Date(order.created_at), "MMM d, yyyy")}
// // //                     </p>
// // //                   </div>

// // //                   <div className="text-right">
// // //                     <p className="font-bold">
// // //                       ₦{Number(order.total_amount).toLocaleString()}
// // //                     </p>
// // //                     <Badge
// // //                       variant={
// // //                         order.status === "completed" ? "default" : "secondary"
// // //                       }
// // //                     >
// // //                       {order.status}
// // //                     </Badge>
// // //                   </div>
// // //                 </div>
// // //               ))}
// // //             </div>
// // //           ) : (
// // //             <p className="text-muted-foreground text-center py-8">
// // //               No orders yet
// // //             </p>
// // //           )}
// // //         </CardContent>
// // //       </Card>
// // //     </div>
// // //   );
// // // }

// // // // import React from "react";
// // // // import { useAuth } from "@/hooks/useAuth";
// // // // import { useQuery } from "@tanstack/react-query";
// // // // import axios from "axios";
// // // // import {
// // // //   Card,
// // // //   CardContent,
// // // //   CardDescription,
// // // //   CardHeader,
// // // //   CardTitle,
// // // // } from "@/components/ui/Card";

// // // // import { Badge } from "@/components/ui/Badge";
// // // // import { Loader2, ShoppingBag, FileText, Gift, Award } from "lucide-react";
// // // // import { format } from "date-fns";
// // // // import { useKYCStatus } from "@/hooks/useKYC";
// // // // import { KYCStatusCard } from "@/components/KYCStatusCard";

// // // // export default function CustomerDashboard() {
// // // //   const { user } = useAuth();
// // // //   const { data: kycStatus } = useKYCStatus();
// // // //   const API_BASE = import.meta.env.VITE_HOME_OO;

// // // //   // ✅ Fetch customer profile
// // // //   const { data: profile } = useQuery({
// // // //     queryKey: ["customer-profile", user?.id],
// // // //     queryFn: async () => {
// // // //       const { data } = await axios.get(`${API_BASE}/api/customers/${user?.id}`);
// // // //       return data;
// // // //     },
// // // //     enabled: !!user?.id,
// // // //   });

// // // //   // ✅ Fetch loyalty account
// // // //   const { data: loyaltyAccount } = useQuery({
// // // //     queryKey: ["customer-loyalty", user?.id],
// // // //     queryFn: async () => {
// // // //       const { data } = await axios.get(`${API_BASE}/api/loyalty/${user?.id}`);
// // // //       return data;
// // // //     },
// // // //     enabled: !!user?.id,
// // // //   });

// // // //   // ✅ Fetch recent orders
// // // //   const { data: recentOrders, isLoading: loadingOrders } = useQuery({
// // // //     queryKey: ["customer-recent-orders", user?.id],
// // // //     queryFn: async () => {
// // // //       const { data } = await axios.get(
// // // //         `${API_BASE}/api/orders/${user?.id}?limit=5`
// // // //       );
// // // //       return data;
// // // //     },
// // // //     enabled: !!user?.id,
// // // //   });

// // // //   // ✅ Fetch pending invoices
// // // //   const { data: pendingInvoices } = useQuery({
// // // //     queryKey: ["customer-pending-invoices", user?.id],
// // // //     queryFn: async () => {
// // // //       const { data } = await axios.get(
// // // //         `${API_BASE}/api/invoices/${user?.id}?status=pending`
// // // //       );
// // // //       return data;
// // // //     },
// // // //     enabled: !!user?.id,
// // // //   });

// // // //   // ✅ Fetch order stats
// // // //   const { data: orderStats } = useQuery({
// // // //     queryKey: ["customer-order-stats", user?.id],
// // // //     queryFn: async () => {
// // // //       const { data } = await axios.get(
// // // //         `${API_BASE}/api/orders/stats/${user?.id}`
// // // //       );
// // // //       return data;
// // // //     },
// // // //     enabled: !!user?.id,
// // // //   });
// // // //   console.log("USER KYC STATUS:", user?.kyc_status);
// // // // console.log("PROFILE KYC STATUS:", profile?.kyc_status);

// // // //   if (loadingOrders) {
// // // //     return (
// // // //       <div className="flex items-center justify-center h-96">
// // // //         <Loader2 className="h-12 w-12 animate-spin text-primary" />
// // // //       </div>
// // // //     );
// // // //   }

// // // //   // ✅ Layout
// // // //   return (
// // // //     <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
// // // //       <div>
// // // //         <h1 className="text-2xl sm:text-3xl font-bold">
// // // //           Welcome, {user?.name || "Customer"}!
// // // //         </h1>
// // // //         <p className="text-sm sm:text-base text-muted-foreground">
// // // //           Here's your account overview
// // // //         </p>
// // // //       </div>

// // // //       {/* ✅ Stats Cards */}
// // // //       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
// // // //         <Card>
// // // //           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// // // //             <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
// // // //             <ShoppingBag className="h-4 w-4 text-muted-foreground" />
// // // //           </CardHeader>
// // // //           <CardContent>
// // // //             <div className="text-2xl font-bold">
// // // //               {orderStats?.totalOrders || 0}
// // // //             </div>
// // // //             <p className="text-xs text-muted-foreground">
// // // //               {orderStats?.monthlyOrders || 0} this month
// // // //             </p>
// // // //           </CardContent>
// // // //         </Card>

// // // //         <Card>
// // // //           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// // // //             <CardTitle className="text-sm font-medium">
// // // //               Loyalty Points
// // // //             </CardTitle>
// // // //             <Gift className="h-4 w-4 text-muted-foreground" />
// // // //           </CardHeader>
// // // //           <CardContent>
// // // //             <div className="text-2xl font-bold">
// // // //               {loyaltyAccount?.points_balance || 0}
// // // //             </div>
// // // //             <p className="text-xs text-muted-foreground">Available to redeem</p>
// // // //           </CardContent>
// // // //         </Card>

// // // //         <Card>
// // // //           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// // // //             <CardTitle className="text-sm font-medium">Loyalty Tier</CardTitle>
// // // //             <Award className="h-4 w-4 text-muted-foreground" />
// // // //           </CardHeader>
// // // //           <CardContent>
// // // //             <div className="text-2xl font-bold">
// // // //               {loyaltyAccount?.tier || "Silver"}
// // // //             </div>
// // // //             <p className="text-xs text-muted-foreground">Member status</p>
// // // //           </CardContent>
// // // //         </Card>

// // // //         <Card>
// // // //           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// // // //             <CardTitle className="text-sm font-medium">
// // // //               Pending Invoices
// // // //             </CardTitle>
// // // //             <FileText className="h-4 w-4 text-muted-foreground" />
// // // //           </CardHeader>
// // // //           <CardContent>
// // // //             <div className="text-2xl font-bold">
// // // //               {pendingInvoices?.length || 0}
// // // //             </div>
// // // //             <p className="text-xs text-muted-foreground">Awaiting payment</p>
// // // //           </CardContent>
// // // //         </Card>
// // // //       </div>

// // // //       {/* ✅ Recent Orders */}
// // // //       <Card>
// // // //         <CardHeader>
// // // //           <CardTitle>Recent Orders</CardTitle>
// // // //           <CardDescription>Your latest purchases</CardDescription>
// // // //         </CardHeader>
// // // //         <CardContent>
// // // //           {recentOrders && recentOrders.length > 0 ? (
// // // //             <div className="space-y-3">
// // // //               {recentOrders.map((order) => (
// // // //                 <div
// // // //                   key={order.id}
// // // //                   className="flex items-center justify-between p-3 border rounded-lg"
// // // //                 >
// // // //                   <div>
// // // //                     <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
// // // //                     <p className="text-sm text-muted-foreground">
// // // //                       {format(new Date(order.created_at), "MMM d, yyyy")}
// // // //                     </p>
// // // //                   </div>
// // // //                   <div className="text-right">
// // // //                     <p className="font-bold">
// // // //                       ₦{Number(order.total_amount).toLocaleString()}
// // // //                     </p>
// // // //                     <Badge
// // // //                       variant={
// // // //                         order.status === "completed" ? "default" : "secondary"
// // // //                       }
// // // //                     >
// // // //                       {order.status}
// // // //                     </Badge>
// // // //                   </div>
// // // //                 </div>
// // // //               ))}
// // // //             </div>
// // // //           ) : (
// // // //             <p className="text-muted-foreground text-center py-8">
// // // //               No orders yet
// // // //             </p>
// // // //           )}
// // // //         </CardContent>
// // // //       </Card>
// // // //     </div>
// // // //   );
// // // // }

// // // // import React from "react";
// // // // import { useAuth } from "@/hookss/useAuth";
// // // // import { useQuery } from "@tanstack/react-query";
// // // // import { supabase } from "@/integrations/supabase/client";
// // // // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/uimain/card";
// // // // import { Badge } from "@/components/uimain/Badge";
// // // // import { Loader2, ShoppingBag, FileText, Gift, Award } from "lucide-react";
// // // // import { format } from "date-fns";
// // // // import { useKYCStatus } from "@/hooks/useKYC";
// // // // import { KYCStatusCard } from "@/components/KYCStatusCard";

// // // // export default function CustomerDashboard() {
// // // //   const { user } = useAuth();
// // // //   const { data: kycStatus } = useKYCStatus();

// // // //   // Fetch customer profile
// // // //   const { data: profile } = useQuery({
// // // //     queryKey: ["customer-profile", user?.id],
// // // //     queryFn: async () => {
// // // //       const { data, error } = await supabase
// // // //         .from("profiles")
// // // //         .select("*")
// // // //         .eq("id", user?.id)
// // // //         .single();
// // // //       if (error) throw error;
// // // //       return data;
// // // //     },
// // // //     enabled: !!user?.id,
// // // //   });

// // // //   // Fetch loyalty account
// // // //   const { data: loyaltyAccount } = useQuery({
// // // //     queryKey: ["customer-loyalty", user?.id],
// // // //     queryFn: async () => {
// // // //       const { data, error } = await supabase
// // // //         .from("loyalty_accounts")
// // // //         .select("*")
// // // //         .eq("customer_id", user?.id)
// // // //         .maybeSingle();
// // // //       if (error) throw error;
// // // //       return data;
// // // //     },
// // // //     enabled: !!user?.id,
// // // //   });

// // // //   // Fetch recent orders
// // // //   const { data: recentOrders, isLoading: loadingOrders } = useQuery({
// // // //     queryKey: ["customer-recent-orders", user?.id],
// // // //     queryFn: async () => {
// // // //       const { data, error } = await supabase
// // // //         .from("sales")
// // // //         .select("*")
// // // //         .eq("customer_id", user?.id)
// // // //         .order("created_at", { ascending: false })
// // // //         .limit(5);
// // // //       if (error) throw error;
// // // //       return data;
// // // //     },
// // // //     enabled: !!user?.id,
// // // //   });

// // // //   // Fetch pending invoices
// // // //   const { data: pendingInvoices } = useQuery({
// // // //     queryKey: ["customer-pending-invoices", user?.id],
// // // //     queryFn: async () => {
// // // //       const { data, error } = await supabase
// // // //         .from("invoices")
// // // //         .select("*")
// // // //         .eq("customer_id", user?.id)
// // // //         .in("status", ["draft", "sent"])
// // // //         .order("created_at", { ascending: false });
// // // //       if (error) throw error;
// // // //       return data;
// // // //     },
// // // //     enabled: !!user?.id,
// // // //   });

// // // //   // Calculate stats
// // // //   const { data: orderStats } = useQuery({
// // // //     queryKey: ["customer-order-stats", user?.id],
// // // //     queryFn: async () => {
// // // //       const { data, error } = await supabase
// // // //         .from("sales")
// // // //         .select("total_amount, created_at")
// // // //         .eq("customer_id", user?.id);
// // // //       if (error) throw error;

// // // //       const now = new Date();
// // // //       const thisMonth = data?.filter(sale => {
// // // //         const saleDate = new Date(sale.created_at);
// // // //         return saleDate.getMonth() === now.getMonth() &&
// // // //                saleDate.getFullYear() === now.getFullYear();
// // // //       }) || [];

// // // //       const totalSpent = data?.reduce((sum, sale) => sum + Number(sale.total_amount), 0) || 0;
// // // //       const monthlySpent = thisMonth.reduce((sum, sale) => sum + Number(sale.total_amount), 0);

// // // //       return {
// // // //         totalOrders: data?.length || 0,
// // // //         monthlyOrders: thisMonth.length,
// // // //         totalSpent,
// // // //         monthlySpent,
// // // //       };
// // // //     },
// // // //     enabled: !!user?.id,
// // // //   });

// // // //   if (loadingOrders) {
// // // //     return (
// // // //       <div className="flex items-center justify-center h-96">
// // // //         <Loader2 className="h-12 w-12 animate-spin text-primary" />
// // // //       </div>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
// // // //       <div>
// // // //         <h1 className="text-2xl sm:text-3xl font-bold">Welcome, {profile?.full_name || "Customer"}!</h1>
// // // //         <p className="text-sm sm:text-base text-muted-foreground">Here's your account overview</p>
// // // //       </div>

// // // //       {kycStatus && (
// // // //         <KYCStatusCard
// // // //           kycStatus={kycStatus.kyc_status}
// // // //           customerType={kycStatus.customer_type}
// // // //           kycNotes={kycStatus.kyc_notes}
// // // //         />
// // // //       )}

// // // //       {/* Stats Cards */}
// // // //       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
// // // //         <Card>
// // // //           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// // // //             <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
// // // //             <ShoppingBag className="h-4 w-4 text-muted-foreground" />
// // // //           </CardHeader>
// // // //           <CardContent>
// // // //             <div className="text-2xl font-bold">{orderStats?.totalOrders || 0}</div>
// // // //             <p className="text-xs text-muted-foreground">
// // // //               {orderStats?.monthlyOrders || 0} this month
// // // //             </p>
// // // //           </CardContent>
// // // //         </Card>

// // // //         <Card>
// // // //           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// // // //             <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
// // // //             <Gift className="h-4 w-4 text-muted-foreground" />
// // // //           </CardHeader>
// // // //           <CardContent>
// // // //             <div className="text-2xl font-bold">{loyaltyAccount?.points_balance || 0}</div>
// // // //             <p className="text-xs text-muted-foreground">Available to redeem</p>
// // // //           </CardContent>
// // // //         </Card>

// // // //         <Card>
// // // //           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// // // //             <CardTitle className="text-sm font-medium">Loyalty Tier</CardTitle>
// // // //             <Award className="h-4 w-4 text-muted-foreground" />
// // // //           </CardHeader>
// // // //           <CardContent>
// // // //             <div className="text-2xl font-bold">{loyaltyAccount?.tier || "Silver"}</div>
// // // //             <p className="text-xs text-muted-foreground">Member status</p>
// // // //           </CardContent>
// // // //         </Card>

// // // //         <Card>
// // // //           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
// // // //             <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
// // // //             <FileText className="h-4 w-4 text-muted-foreground" />
// // // //           </CardHeader>
// // // //           <CardContent>
// // // //             <div className="text-2xl font-bold">{pendingInvoices?.length || 0}</div>
// // // //             <p className="text-xs text-muted-foreground">Awaiting payment</p>
// // // //           </CardContent>
// // // //         </Card>
// // // //       </div>

// // // //       {/* Recent Orders */}
// // // //       <Card>
// // // //         <CardHeader>
// // // //           <CardTitle>Recent Orders</CardTitle>
// // // //           <CardDescription>Your latest purchases</CardDescription>
// // // //         </CardHeader>
// // // //         <CardContent>
// // // //           {recentOrders && recentOrders.length > 0 ? (
// // // //             <div className="space-y-3">
// // // //               {recentOrders.map((order) => (
// // // //                 <div
// // // //                   key={order.id}
// // // //                   className="flex items-center justify-between p-3 border rounded-lg"
// // // //                 >
// // // //                   <div>
// // // //                     <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
// // // //                     <p className="text-sm text-muted-foreground">
// // // //                       {format(new Date(order.created_at), "MMM d, yyyy")}
// // // //                     </p>
// // // //                   </div>
// // // //                   <div className="text-right">
// // // //                     <p className="font-bold">₦{Number(order.total_amount).toLocaleString()}</p>
// // // //                     <Badge variant={order.status === "completed" ? "default" : "secondary"}>
// // // //                       {order.status}
// // // //                     </Badge>
// // // //                   </div>
// // // //                 </div>
// // // //               ))}
// // // //             </div>
// // // //           ) : (
// // // //             <p className="text-muted-foreground text-center py-8">No orders yet</p>
// // // //           )}
// // // //         </CardContent>
// // // //       </Card>
// // // //     </div>
// // // //   );
// // // // }
