import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Save } from "lucide-react";
import { useLoyaltyConfig } from "@/hooks/useLoyaltyConfig";

export function LoyaltySettingsCard() {
  const { config, isLoading, updateConfig } = useLoyaltyConfig();

  const [formData, setFormData] = useState({
    points_per_currency: 100,
    multiplier: 1.0,
    expiry_days: 365,
    currency_symbol: "₦",
  });

  // Load config into form when fetched
  useEffect(() => {
    if (config) {
      setFormData({
        points_per_currency: config.points_per_currency,
        multiplier: config.multiplier,
        expiry_days: config.expiry_days,
        currency_symbol: config.currency_symbol,
      });
    }
  }, [config]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateConfig(formData);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading settings...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loyalty Program Settings</CardTitle>
        <CardDescription>
          Configure how customers earn and manage loyalty points
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* First Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="points_per_currency">Points Per Currency Unit</Label>
              <Input
                id="points_per_currency"
                type="number"
                value={formData.points_per_currency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    points_per_currency: parseInt(e.target.value),
                  })
                }
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                How many currency units equal 1 point (e.g., ₦100 = 1 point)
              </p>
            </div>

            <div>
              <Label htmlFor="multiplier">Global Multiplier</Label>
              <Input
                id="multiplier"
                type="number"
                step="0.1"
                value={formData.multiplier}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    multiplier: parseFloat(e.target.value),
                  })
                }
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Multiply all earned points by this factor
              </p>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry_days">Point Expiry (Days)</Label>
              <Input
                id="expiry_days"
                type="number"
                value={formData.expiry_days}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expiry_days: parseInt(e.target.value),
                  })
                }
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Points expire after this many days from earning
              </p>
            </div>

            <div>
              <Label htmlFor="currency_symbol">Currency Symbol</Label>
              <Input
                id="currency_symbol"
                value={formData.currency_symbol}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    currency_symbol: e.target.value,
                  })
                }
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Symbol to display for currency
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full">
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}
