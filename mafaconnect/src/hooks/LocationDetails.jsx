import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useLocationStats } from "@/hooks/useLocationStats";
import { useLocationProducts } from "@/hooks/useLocationProducts";
import { apiGet } from "@/lib/api";

import {
  MapPin,
  Warehouse,
  Package,
  Boxes,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

export default function LocationDetails() {
  const { id } = useParams(); 
  const navigate = useNavigate();

  const { stats } = useLocationStats(id);
  const { products, isLoading } = useLocationProducts(id);

  const [location, setLocation] = React.useState(null);

  // Fetch location info
  React.useEffect(() => {
    const fetchLocation = async () => {
      const res = await apiGet(`/locations/${id}`);
      setLocation(res.data.data);
    };

    fetchLocation();
  }, [id]);

  return (
    <div className="space-y-6 p-6">

      {/* Back button */}
      <Button variant="ghost" onClick={() => navigate("/locations")}>
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Locations
      </Button>

      {/* Header */}
      {location && (
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Warehouse className="h-6 w-6 text-primary" />
                {location.name}
              </h1>

              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {location.state} • {location.zone}
              </p>

              {location.address && (
                <p className="text-sm text-muted-foreground mt-2">
                  {location.address}
                </p>
              )}
            </div>

            <Badge variant={location.active ? "default" : "secondary"}>
              {location.active ? "Active" : "Inactive"}
            </Badge>

          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4">
          <StatBox icon={Package} label="Products" value={stats.total_products} />
          <StatBox icon={Boxes} label="Units" value={stats.total_units} />
          <StatBox
            icon={TrendingUp}
            label="Stock Value"
            value={`₦${Number(stats.total_stock_value).toLocaleString()}`}
          />
          <StatBox icon={AlertTriangle} label="Low Stock" value={stats.low_stock_items} />
        </div>
      )}

      {/* Products Section */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Products in this location</h2>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p>Loading products...</p>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground">No products assigned yet</p>
          ) : (
            <div className="space-y-4">
              {products.map((item) => (
                <LocationProductCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* Helpers */
function StatBox({ icon: Icon, label, value }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <Icon className="h-6 w-6 text-primary" />
        <div className="text-right">
          <p className="text-lg font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function LocationProductCard({ item }) {
  const totalValue = item.stock_qty * item.product.sale_price;

  return (
    <div className="border rounded p-4 flex justify-between">
      <div>
        <h3 className="font-semibold text-lg">
          {item.product.name}
        </h3>

        <p className="text-sm text-muted-foreground">
          ₦{Number(item.product.sale_price).toLocaleString()} per unit
        </p>

        {item.stock_qty <= item.reorder_level && (
          <Badge variant="destructive" className="mt-2">
            Low Stock
          </Badge>
        )}
      </div>

      <div className="text-right">
        <p className="text-lg font-bold">{item.stock_qty} units</p>
        <p className="text-green-600 font-semibold">
          ₦{Number(totalValue).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
