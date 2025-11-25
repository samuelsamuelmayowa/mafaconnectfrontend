
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { useLocations } from "@/hooks/useLocations";
import { useLocationStats } from "@/hooks/useLocationStats";
import {
  MapPin,
  Plus,
  Search,
  Package,
  TrendingUp,
  Warehouse,
  Edit,
  AlertTriangle,
  Boxes,
  ShoppingCart,
} from "lucide-react";
import { LocationDialog } from "@/components/LocationDialog";
import { useAuth } from "@/hooks/useAuth";

export default function Locations() {
  const navigate = useNavigate();
  const { locations, isLoading } = useLocations();
  const { hasRole } = useAuth();
  const { locationStats, locationSales } = useLocationStats();

  const [searchQuery, setSearchQuery] = React.useState("");
  const [showDialog, setShowDialog] = React.useState(false);
  const [editLocation, setEditLocation] = React.useState(null);
  const [groupBy, setGroupBy] = React.useState("all");

  const getLocationStats = (locationId) => {
    return locationStats?.find((stat) => stat.location_id === locationId);
  };

  const getLocationSales = (locationId) => {
    return locationSales?.[locationId] || { count: 0, total: 0 };
  };

  const getLocationTypeBadge = (type) => {
    const colors = {
      warehouse: "bg-blue-500/10 text-blue-500",
      depot: "bg-green-500/10 text-green-500",
      retail_store: "bg-purple-500/10 text-purple-500",
      distribution_center: "bg-orange-500/10 text-orange-500",
    };

    return colors[type] || colors.warehouse;
  };

  const filteredLocations = locations?.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.state?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedLocations = React.useMemo(() => {
    if (!filteredLocations) return {};

    if (groupBy === "state") {
      return filteredLocations.reduce((acc, loc) => {
        const key = loc.state || "Unknown";
        if (!acc[key]) acc[key] = [];
        acc[key].push(loc);
        return acc;
      }, {});
    }

    if (groupBy === "zone") {
      return filteredLocations.reduce((acc, loc) => {
        const key = loc.zone || "Unknown";
        if (!acc[key]) acc[key] = [];
        acc[key].push(loc);
        return acc;
      }, {});
    }

    return { "All Locations": filteredLocations };
  }, [filteredLocations, groupBy]);

  // const overallMetrics = React.useMemo(() => {
  //   if (!locationStats) return null;

  //   return locationStats.reduce(
  //     (acc, stat) => {
  //       acc.totalProducts += Number(stat.total_products) || 0;
  //       acc.totalUnits += Number(stat.total_units) || 0;
  //       acc.totalValue += Number(stat.total_stock_value) || 0;
  //       acc.lowStockItems += Number(stat.low_stock_items) || 0;
  //       return acc;
  //     },
  //     {
  //       totalProducts: 0,
  //       totalUnits: 0,
  //       totalValue: 0,
  //       lowStockItems: 0,
  //     }
  //   );
  // }, [locationStats]);
const overallMetrics = React.useMemo(() => {
  console.log("Location stats received:", locationStats);

  if (!locationStats || locationStats.length === 0) {
    return {
      totalProducts: 0,
      totalUnits: 0,
      totalValue: 0,
      lowStockItems: 0,
    };
  }

  return locationStats.reduce(
    (acc, stat) => {
      acc.totalProducts += Number(stat.total_products) || 0;
      acc.totalUnits += Number(stat.total_units) || 0;
      acc.totalValue += Number(stat.total_stock_value) || 0;
      acc.lowStockItems += Number(stat.low_stock_items) || 0;
      return acc;
    },
    {
      totalProducts: 0,
      totalUnits: 0,
      totalValue: 0,
      lowStockItems: 0,
    }
  );
}, [locationStats]);

  // const totalSales = React.useMemo(() => {
  //   if (!locationSales) return { count: 0, total: 0 };

  //   return Object.values(locationSales).reduce(
  //     (acc, sale) => {
  //       acc.count += sale.count;
  //       acc.total += sale.total;
  //       return acc;
  //     },
  //     { count: 0, total: 0 }
  //   );
  // }, [locationSales]);
const totalSales = React.useMemo(() => {
  if (!locationSales || Object.keys(locationSales).length === 0) {
    return { count: 0, total: 0 };
  }

  return Object.values(locationSales).reduce(
    (acc, sale) => {
      acc.count += Number(sale.count || 0);
      acc.total += Number(sale.total || 0);
      return acc;
    },
    { count: 0, total: 0 }
  );
}, [locationSales]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Location Dashboard
          </h1>
          <p className="text-muted-foreground">
            Monitor inventory, sales, and depot operations
          </p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Location
        </Button>
      </div>
<div className="text-xs text-red-500 mb-2">
  Metrics status: 
  {overallMetrics ? "✅ Calculated" : "❌ Not workign  Calculated"}
</div>

<pre className="text-xs bg-slate-100 p-2 rounded">
  {JSON.stringify(locationStats, null, 2)}
</pre>

      {/* Overall Stats */}
   {overallMetrics && (
  <div className="grid gap-4 md:grid-cols-4">
    <MetricCard
      icon={Boxes}
      label="Products"
      value={overallMetrics.totalProducts || 0}
    />
    <MetricCard
      icon={Package}
      label="Units"
      value={overallMetrics.totalUnits || 0}
    />
    <MetricCard
      icon={TrendingUp}
      label="Stock Value"
      value={`₦${(overallMetrics.totalValue || 0).toLocaleString()}`}
    />
    <MetricCard
      icon={ShoppingCart}
      label="Sales (30d)"
      value={`${totalSales.count || 0} orders`}
      extra={`₦${(totalSales.total || 0).toLocaleString()}`}
    />
  </div>
)}


      {/* Low Stock Alert */}
      {overallMetrics?.lowStockItems > 0 && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="pt-6 flex gap-3">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <div>
              <p className="font-semibold text-destructive">Low Stock Alert</p>
              <p className="text-sm text-muted-foreground">
                {overallMetrics.lowStockItems} products below reorder level
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Card */}
      <Card>
        <CardHeader>
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2">
              {["all", "state", "zone"].map((type) => (
                <Button
                  key={type}
                  size="sm"
                  variant={groupBy === type ? "default" : "outline"}
                  onClick={() => setGroupBy(type)}
                >
                  {type.toUpperCase()}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading locations...</div>
          ) : filteredLocations?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No locations found
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedLocations).map(([groupName, locs]) => (
                <div key={groupName}>
                  {groupBy !== "all" && (
                    <h3 className="text-lg font-semibold mb-3">{groupName}</h3>
                  )}

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {locs.map((location) => {
                      const stats = getLocationStats(location.id);
                      const sales = getLocationSales(location.id);

                      return (
                        <Card
                          key={location.id}
                          className="hover:shadow-lg transition-shadow cursor-pointer group"
                        >
                          <CardContent className="p-6">
                            {/* Top row */}
                            <div className="flex items-start justify-between mb-4">
                              <div
                                className="flex items-center gap-2 flex-1"
                                onClick={() =>
                                  navigate(`/locations/${location.id}`)
                                }
                              >
                                <Warehouse className="h-8 w-8 text-primary" />

                                {location.is_primary && (
                                  <Badge variant="default" className="text-xs">
                                    Main
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="flex flex-col gap-1 items-end">
                                  <Badge
                                    variant={
                                      location.active ? "default" : "secondary"
                                    }
                                  >
                                    {location.active ? "Active" : "Inactive"}
                                  </Badge>

                                  {location.location_type && (
                                    <Badge
                                      className={getLocationTypeBadge(
                                        location.location_type
                                      )}
                                    >
                                      {location.location_type.replace("_", " ")}
                                    </Badge>
                                  )}
                                </div>

                                {(hasRole("admin") || hasRole("manager")) && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditLocation(location);
                                      setShowDialog(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Main body */}
                            <div
                              onClick={() =>
                                navigate(`/locations/${location.id}`)
                              }
                            >
                              {/* Name */}
                              <h3 className="font-semibold text-lg mb-2">
                                {location.name}
                              </h3>

                              {/* Location */}
                              {(location.state || location.zone) && (
                                <div className="flex items-center gap-2 mb-3">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    {location.state}
                                    {location.state && location.zone && " • "}
                                    {location.zone}
                                  </p>
                                </div>
                              )}

                              {/* Stats */}
                        
                              {stats && (
                                <div className="space-y-3 mt-4 pt-4 border-t">
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <p className="text-xs text-muted-foreground">Products</p>
                                      <p className="text-lg font-semibold flex items-center gap-1">
                                        <Package className="h-4 w-4 text-primary" />
                                        {stats.total_products || 0}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-muted-foreground">Units</p>
                                      <p className="text-lg font-semibold flex items-center gap-1">
                                        <Boxes className="h-4 w-4 text-blue-500" />
                                        {Number(stats.total_units || 0).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <p className="text-xs text-muted-foreground">Stock Value</p>
                                    <p className="text-xl font-bold text-green-600">
                                      ₦{Number(stats.total_stock_value || 0).toLocaleString()}
                                    </p>
                                  </div>

                                  {sales.count > 0 && (
                                    <div className="bg-primary/5 p-2 rounded">
                                      <p className="text-xs text-muted-foreground">Sales (30d)</p>
                                      <div className="flex items-center justify-between mt-1">
                                        <p className="text-sm font-semibold flex items-center gap-1">
                                          <ShoppingCart className="h-3 w-3" />
                                          {sales.count} orders
                                        </p>
                                        <p className="text-sm font-bold text-primary">
                                          ₦{Number(sales.total).toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {stats.low_stock_items > 0 && (
                                    <Badge variant="destructive" className="w-full justify-center">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      {stats.low_stock_items} Low Stock
                                    </Badge>
                                  )}
                                </div>
                              )}

                              {/* Address */}
                              {location.address && (
                                <p className="text-sm text-muted-foreground mt-3">
                                  {location.address}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

               
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <LocationDialog
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) setEditLocation(null);
        }}
        location={editLocation}
      />
    </div>
  );
}

/* Small helper card */
function MetricCard({ icon: Icon, label, value, extra }) {
  return (
    <Card>
      <CardContent className="pt-6 flex justify-between items-center">
        <Icon className="h-8 w-8 text-primary" />
        <div className="text-right">
          <p className="text-xl font-bold">{value}</p>
          {extra && <p className="text-sm text-green-600">{extra}</p>}
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// // import React from "react";
// // import { useNavigate } from "react-router-dom";
// // import { Card, CardContent, CardHeader } from "@/components/ui/Card";
// // import { Button } from "@/components/ui/Button";
// // import { Input } from "@/components/ui/Input";
// // import { Badge } from "@/components/ui/Badge";
// // import { useLocations } from "@/hooks/useLocations";
// // import { useLocationStats } from "@/hooks/useLocationStats"; // ⭐ NEW HOOK
// // import { MapPin, Plus, Search, Package, TrendingUp, Warehouse, Edit } from "lucide-react";
// // import { LocationDialog } from "@/components/LocationDialog";
// // import { useAuth } from "@/hooks/useAuth";

// // export default function Locations() {
// //   const navigate = useNavigate();
// //   const { locations, isLoading } = useLocations();
// //   const { hasRole, isAdmin, isManager } = useAuth();
// //   const { locationStats } = useLocationStats(); // ⭐ replaces Supabase RPC

// //   const [searchQuery, setSearchQuery] = React.useState("");
// //   const [showDialog, setShowDialog] = React.useState(false);
// //   const [editLocation, setEditLocation] = React.useState(null);
// //   const [groupBy, setGroupBy] = React.useState("all");

// //   const getLocationStats = (locationId) => {
// //     return locationStats?.find((stat) => stat.location_id === locationId);
// //   };

// //   const getLocationTypeBadge = (type) => {
// //     const colors = {
// //       warehouse: "bg-blue-500/10 text-blue-500",
// //       depot: "bg-green-500/10 text-green-500",
// //       retail_store: "bg-purple-500/10 text-purple-500",
// //       distribution_center: "bg-orange-500/10 text-orange-500",
// //     };
// //     return colors[type] || colors.warehouse;
// //   };

// //   const filteredLocations = locations?.filter((loc) =>
// //     loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //     loc.state?.toLowerCase().includes(searchQuery.toLowerCase())
// //   );

// //   const groupedLocations = React.useMemo(() => {
// //     if (!filteredLocations) return {};

// //     if (groupBy === "state") {
// //       return filteredLocations.reduce((acc, loc) => {
// //         const key = loc.state || "Unknown";
// //         if (!acc[key]) acc[key] = [];
// //         acc[key].push(loc);
// //         return acc;
// //       }, {});
// //     }

// //     if (groupBy === "zone") {
// //       return filteredLocations.reduce((acc, loc) => {
// //         const key = loc.zone || "Unknown";
// //         if (!acc[key]) acc[key] = [];
// //         acc[key].push(loc);
// //         return acc;
// //       }, {});
// //     }

// //     return { "All Locations": filteredLocations };
// //   }, [filteredLocations, groupBy]);

// //   return (
// //     <div className="space-y-6">
// //       {/* Header */}
// //       <div className="flex items-center justify-between">
// //         <div>
// //           <h1 className="text-3xl font-bold text-foreground">Locations</h1>
// //           <p className="text-muted-foreground">Manage your business locations across Nigeria</p>
// //         </div>
// //         <Button onClick={() => setShowDialog(true)}>
// //           <Plus className="mr-2 h-4 w-4" />
// //           New Location
// //         </Button>
// //       </div>

// //       {/* Search + Grouping */}
// //       <Card>
// //         <CardHeader>
// //           <div className="flex gap-4 items-center">
// //             <div className="relative flex-1">
// //               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
// //               <Input
// //                 placeholder="Search locations..."
// //                 value={searchQuery}
// //                 onChange={(e) => setSearchQuery(e.target.value)}
// //                 className="pl-10"
// //               />
// //             </div>

// //             <div className="flex gap-2">
// //               <Button
// //                 variant={groupBy === "all" ? "default" : "outline"}
// //                 size="sm"
// //                 onClick={() => setGroupBy("all")}
// //               >
// //                 All
// //               </Button>
// //               <Button
// //                 variant={groupBy === "state" ? "default" : "outline"}
// //                 size="sm"
// //                 onClick={() => setGroupBy("state")}
// //               >
// //                 By State
// //               </Button>
// //               <Button
// //                 variant={groupBy === "zone" ? "default" : "outline"}
// //                 size="sm"
// //                 onClick={() => setGroupBy("zone")}
// //               >
// //                 By Zone
// //               </Button>
// //             </div>
// //           </div>
// //         </CardHeader>

// //         <CardContent>
// //           {isLoading ? (
// //             <div className="text-center py-8">Loading locations...</div>
// //           ) : filteredLocations?.length === 0 ? (
// //             <div className="text-center py-8 text-muted-foreground">
// //               {searchQuery ? "No locations found" : "No locations yet"}
// //             </div>
// //           ) : (
// //             <div className="space-y-6">
// //               {Object.entries(groupedLocations).map(([groupName, locs]) => (
// //                 <div key={groupName}>
// //                   {groupBy !== "all" && (
// //                     <h3 className="text-lg font-semibold mb-3 text-foreground">
// //                       {groupName}
// //                     </h3>
// //                   )}

// //                   <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
// //                     {locs.map((location) => {
// //                       const stats = getLocationStats(location.id);

// //                       return (
// //                         <Card
// //                           key={location.id}
// //                           className="hover:shadow-lg transition-shadow cursor-pointer group"
// //                         >
// //                           <CardContent className="p-6">
// //                             {/* Top section */}
// //                             <div className="flex items-start justify-between mb-4">
// //                               <div
// //                                 className="flex items-center gap-2 flex-1"
// //                                 onClick={() => navigate(`/locations/${location.id}`)}
// //                               >
// //                                 <Warehouse className="h-8 w-8 text-primary" />
// //                                 {location.is_primary && (
// //                                   <Badge variant="default" className="text-xs">Main</Badge>
// //                                 )}
// //                               </div>

// //                               <div className="flex items-center gap-2">
// //                                 <div className="flex flex-col gap-1 items-end">
// //                                   <Badge variant={location.active ? "default" : "secondary"}>
// //                                     {location.active ? "Active" : "Inactive"}
// //                                   </Badge>

// //                                   {location.location_type && (
// //                                     <Badge className={getLocationTypeBadge(location.location_type)}>
// //                                       {location.location_type.replace("_", " ")}
// //                                     </Badge>
// //                                   )}
// //                                 </div>

// //                                 {(hasRole("admin") || hasRole("manager")) && (
// //                                   <Button
// //                                     variant="ghost"
// //                                     size="icon"
// //                                     onClick={(e) => {
// //                                       e.stopPropagation();
// //                                       setEditLocation(location);
// //                                       setShowDialog(true);
// //                                     }}
// //                                   >
// //                                     <Edit className="h-4 w-4" />
// //                                   </Button>
// //                                 )}
// //                               </div>
// //                             </div>

// //                             {/* Name */}
// //                             <div onClick={() => navigate(`/locations/${location.id}`)}>
// //                               <h3 className="font-semibold text-lg mb-2">{location.name}</h3>

// //                               {(location.state || location.zone) && (
// //                                 <div className="flex items-center gap-2 mb-3">
// //                                   <MapPin className="h-3 w-3 text-muted-foreground" />
// //                                   <p className="text-sm text-muted-foreground">
// //                                     {location.state}
// //                                     {location.state && location.zone && " • "}
// //                                     {location.zone}
// //                                   </p>
// //                                 </div>
// //                               )}

// //                               {/* Stats */}
// //                               {stats && (
// //                                 <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t">
// //                                   <div>
// //                                     <p className="text-xs text-muted-foreground">Products</p>
// //                                     <p className="text-lg font-semibold flex items-center gap-1">
// //                                       <Package className="h-4 w-4" />
// //                                       {stats.total_products || 0}
// //                                     </p>
// //                                   </div>

// //                                   <div>
// //                                     <p className="text-xs text-muted-foreground">Stock Value</p>
// //                                     <p className="text-lg font-semibold flex items-center gap-1">
// //                                       <TrendingUp className="h-4 w-4" />
// //                                       ₦{Number(stats.total_stock_value || 0).toLocaleString()}
// //                                     </p>
// //                                   </div>

// //                                   {stats.low_stock_items > 0 && (
// //                                     <div className="col-span-2">
// //                                       <Badge variant="destructive" className="w-full justify-center">
// //                                         {stats.low_stock_items} Low Stock Items
// //                                       </Badge>
// //                                     </div>
// //                                   )}
// //                                 </div>
// //                               )}

// //                               {location.address && (
// //                                 <p className="text-sm text-muted-foreground mt-3">
// //                                   {location.address}
// //                                 </p>
// //                               )}
// //                             </div>
// //                           </CardContent>
// //                         </Card>
// //                       );
// //                     })}
// //                   </div>
// //                 </div>
// //               ))}
// //             </div>
// //           )}
// //         </CardContent>
// //       </Card>

// //       {/* Add/Edit Dialog */}
// //       <LocationDialog
// //         open={showDialog}
// //         onOpenChange={(open) => {
// //           setShowDialog(open);
// //           if (!open) setEditLocation(null);
// //         }}
// //         location={editLocation}
// //       />
// //     </div>
// //   );
// // }






//    {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//                     {locs.map((location) => {
//                       const stats = getLocationStats(location.id);
//                       const sales = getLocationSales(location.id);

//                       return (
//                         <Card key={location.id} className="hover:shadow-lg transition cursor-pointer">
//                           <CardContent className="p-6">
//                             <div
//                               className="flex gap-2 items-center mb-2"
//                               onClick={() => navigate(`/locations/${location.id}`)}
//                             >
//                               <Warehouse className="h-6 w-6 text-primary" />
//                               <h3 className="font-semibold">{location.name}</h3>
//                             </div>

//                             <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
//                               <MapPin className="h-3 w-3" />
//                               {location.state} • {location.zone}
//                             </div>

//                             <div className="flex justify-between items-center mb-2">
//                               <Badge className={getLocationTypeBadge(location.location_type)}>
//                                 {location.location_type.replace("_", " ")}
//                               </Badge>

//                               {(hasRole("admin") || hasRole("manager")) && (
//                                 <Button
//                                   size="icon"
//                                   variant="ghost"
//                                   onClick={(e) => {
//                                     e.stopPropagation();
//                                     setEditLocation(location);
//                                     setShowDialog(true);
//                                   }}
//                                 >
//                                   <Edit className="h-4 w-4" />
//                                 </Button>
//                               )}
//                             </div>

//                             {stats && (
//                               <div className="border-t pt-3 mt-3 text-sm space-y-1">
//                                 <p>Products: {stats.total_products}</p>
//                                 <p>Units: {stats.total_units}</p>
//                                 <p>Stock Value: ₦{stats.total_stock_value}</p>
//                                 <p>Low Stock: {stats.low_stock_items}</p>
//                               </div>
//                             )}

//                             {sales.count > 0 && (
//                               <div className="mt-2 text-sm text-primary">
//                                 Sales: {sales.count} • ₦{sales.total.toLocaleString()}
//                               </div>
//                             )}
//                           </CardContent>
//                         </Card>
//                       );
//                     })}
//                   </div> */}