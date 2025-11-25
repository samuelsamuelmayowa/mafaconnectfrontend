import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useLocations } from "@/hooks/useLocations";
import { useQuery } from "@tanstack/react-query";

const API_BASE = import.meta.env.VITE_HOME_OO;

export function LocationDialog({ open, onOpenChange, location }) {
  const token = localStorage.getItem("ACCESS_TOKEN");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const { createLocation, updateLocation } = useLocations();

  const [formData, setFormData] = React.useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    state: "",
    zone: "",
    location_type: "warehouse",
    capacity_sqft: "",
    active: true,
    manager_id: "",

    bank_name: "",
    account_name: "",
    account_number: "",
    sort_code: "",
  });

  //  Fetch managers from REST API instead of Supabase
  const { data: managers } = useQuery({
    queryKey: ["managers"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/users/managers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch managers");

      const data = await res.json(); //

      console.log(data.data);

      return data.data;
    },
  });

  // Load existing location into form
  React.useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || "",
        address: location.address || "",
        phone: location.phone || "",
        email: location.email || "",
        state: location.state || "",
        zone: location.zone || "",
        location_type: location.location_type || "warehouse",
        capacity_sqft: location.capacity_sqft?.toString() || "",
        active: location.active ?? true,
        manager_id: location.manager_id || "",

        bank_name: location.bank_name || "",
        account_name: location.account_name || "",
        account_number: location.account_number || "",
        sort_code: location.sort_code || "",
      });
    } else {
      setFormData({
        name: "",
        address: "",
        phone: "",
        email: "",
        state: "",
        zone: "",
        location_type: "warehouse",
        capacity_sqft: "",
        active: true,
        manager_id: "",
        bank_name: "",
        account_name: "",
        account_number: "",
        sort_code: "",
      });
    }
  }, [location, open]);

  const nigerianStates = [
    "Abia",
    "Adamawa",
    "Akwa Ibom",
    "Anambra",
    "Bauchi",
    "Bayelsa",
    "Benue",
    "Borno",
    "Cross River",
    "Delta",
    "Ebonyi",
    "Edo",
    "Ekiti",
    "Enugu",
    "FCT",
    "Gombe",
    "Imo",
    "Jigawa",
    "Kaduna",
    "Kano",
    "Katsina",
    "Kebbi",
    "Kogi",
    "Kwara",
    "Lagos",
    "Nasarawa",
    "Niger",
    "Ogun",
    "Ondo",
    "Osun",
    "Oyo",
    "Plateau",
    "Rivers",
    "Sokoto",
    "Taraba",
    "Yobe",
    "Zamfara",
  ];

  const zones = [
    "North Central",
    "North East",
    "North West",
    "South East",
    "South South",
    "South West",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      capacity_sqft: formData.capacity_sqft
        ? Number(formData.capacity_sqft)
        : null,
      manager_id: formData.manager_id || null,
    };

    if (location) {
      updateLocation(
        { id: location.id, data: submitData },
        {
          onSuccess: () => {
            setSuccessMsg("✅ Location updated successfully");
          },
          onError: (err) => {
            setErrorMsg(err.message || "❌ Failed to update location");
          },
        }
      );
    } else {
      createLocation(submitData, {
        onSuccess: () => {
          setSuccessMsg("✅ Location created successfully");
        },
        onError: (err) => {
          setErrorMsg(err.message || "❌ Failed to create location");
        },
      });
    }

    onOpenChange(false);
  };

  React.useEffect(() => {
    if (!open) {
      setSuccessMsg("");
      setErrorMsg("");
    }
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {location ? "Edit Location" : "New Location"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Location Name *</Label>
              <Input
                value={formData.name}
                required
                placeholder="Main Store, Warehouse A"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Location Type *</Label>
              <Select
                value={formData.location_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, location_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="warehouse">Warehouse</SelectItem>
                  <SelectItem value="depot">Depot</SelectItem>
                  <SelectItem value="retail_store">Retail Store</SelectItem>
                  <SelectItem value="distribution_center">
                    Distribution Center
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* State + Zone */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>State *</Label>
              <Select
                value={formData.state}
                onValueChange={(value) =>
                  setFormData({ ...formData, state: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {nigerianStates.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Zone *</Label>
              <Select
                value={formData.zone}
                onValueChange={(value) =>
                  setFormData({ ...formData, zone: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select zone" />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((z) => (
                    <SelectItem key={z} value={z}>
                      {z}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address */}
          <div>
            <Label>Address</Label>
            <Input
              value={formData.address}
              placeholder="123 Main Road, Lagos"
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
            />
          </div>

          {/* Phone + Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <Input
                value={formData.phone}
                placeholder="+234..."
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                placeholder="location@example.com"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
          </div>

          {/* Capacity */}
          <div>
            <Label>Capacity (sq ft)</Label>
            <Input
              type="number"
              value={formData.capacity_sqft}
              placeholder="e.g. 5000"
              onChange={(e) =>
                setFormData({ ...formData, capacity_sqft: e.target.value })
              }
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.active}
              onCheckedChange={(value) =>
                setFormData({ ...formData, active: value })
              }
            />
            <Label>Active</Label>
          </div>

          {/* Manager */}
          <div>
            <Label>Location Manager</Label>
          <Select
  value={formData.manager_id ? String(formData.manager_id) : "none"}
  onValueChange={(value) => {
    setFormData({
      ...formData,
      manager_id: value === "none" ? null : value,
    });
  }}
>
  <SelectTrigger>
    <SelectValue placeholder="Select manager" />
  </SelectTrigger>

  <SelectContent>
    <SelectItem value="none">None</SelectItem>

    {managers?.map((m) => (
      <SelectItem key={m.id} value={String(m.id)}>
        {m.name} ({m.email})
      </SelectItem>
    ))}
  </SelectContent>
</Select>

          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Bank Account Details</h3>
            <p className="text-sm text-muted-foreground">
              Add bank account information for invoices and payments
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bank_name">Bank Name</Label>
                <Input
                  id="bank_name"
                  value={formData.bank_name}
                  onChange={(e) =>
                    setFormData({ ...formData, bank_name: e.target.value })
                  }
                  placeholder="e.g., First Bank of Nigeria"
                />
              </div>
              <div>
                <Label htmlFor="account_name">Account Name</Label>
                <Input
                  id="account_name"
                  value={formData.account_name}
                  onChange={(e) =>
                    setFormData({ ...formData, account_name: e.target.value })
                  }
                  placeholder="Account holder name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="account_number">Account Number</Label>
                <Input
                  id="account_number"
                  value={formData.account_number}
                  onChange={(e) =>
                    setFormData({ ...formData, account_number: e.target.value })
                  }
                  placeholder="10-digit account number"
                />
              </div>
              <div>
                <Label htmlFor="sort_code">Sort Code (Optional)</Label>
                <Input
                  id="sort_code"
                  value={formData.sort_code}
                  onChange={(e) =>
                    setFormData({ ...formData, sort_code: e.target.value })
                  }
                  placeholder="Branch code if applicable"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          {successMsg && (
            <div className="bg-green-100 text-green-700 p-2 rounded text-sm">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="bg-red-100 text-red-700 p-2 rounded text-sm">
              {errorMsg}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {location ? "Update Location" : "Create Location"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
