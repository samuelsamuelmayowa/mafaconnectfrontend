import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Plus, X } from "lucide-react";

export function TierDialog({ open, onOpenChange, tier, onSave }) {
  const [formData, setFormData] = useState({
    name: tier?.name || "",
    min_points: tier?.min_points || 0,
    max_points: tier?.max_points || null,
    multiplier: tier?.multiplier || 1.0,
    benefits: tier?.benefits || [],
    color: tier?.color || "text-muted-foreground",
    icon: tier?.icon || "award",
    sort_order: tier?.sort_order || 0,
  });

  const [newBenefit, setNewBenefit] = useState("");

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setFormData({
        ...formData,
        benefits: [...formData.benefits, newBenefit.trim()],
      });
      setNewBenefit("");
    }
  };

  const handleRemoveBenefit = (index) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      max_points: formData.max_points || null,
    };

    if (tier?.id) {
      onSave({ id: tier.id, ...data });
    } else {
      onSave(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{tier ? "Edit Tier" : "Create Tier"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tier Name + Sort Order */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tier Name</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Gold"
                required
              />
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input
                type="number"
                value={formData.sort_order}
                onChange={(e) =>
                  setFormData({ ...formData, sort_order: parseInt(e.target.value) })
                }
                required
              />
            </div>
          </div>

          {/* Min & Max Points */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Minimum Points</Label>
              <Input
                type="number"
                value={formData.min_points}
                onChange={(e) =>
                  setFormData({ ...formData, min_points: parseInt(e.target.value) })
                }
                required
              />
            </div>

            <div>
              <Label>Maximum Points (leave empty for unlimited)</Label>
              <Input
                type="number"
                value={formData.max_points || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    max_points: e.target.value ? parseInt(e.target.value) : null,
                  })
                }
                placeholder="Unlimited"
              />
            </div>
          </div>

          {/* Multiplier + Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Points Multiplier</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.multiplier}
                onChange={(e) =>
                  setFormData({ ...formData, multiplier: parseFloat(e.target.value) })
                }
                required
              />
            </div>

            <div>
              <Label>Color Class</Label>
              <Input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="e.g., text-warning"
              />
            </div>
          </div>

          {/* Benefits */}
          <div>
            <Label>Benefits</Label>
            <div className="space-y-2">
              {formData.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={benefit} readOnly />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveBenefit(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              {/* Add Benefit Input */}
              <div className="flex gap-2">
                <Input
                  value={newBenefit}
                  onChange={(e) => setNewBenefit(e.target.value)}
                  placeholder="Add benefit..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddBenefit();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddBenefit}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{tier ? "Update" : "Create"} Tier</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
