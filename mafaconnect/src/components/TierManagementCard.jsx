import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, Edit, Trash2, Power, PowerOff } from "lucide-react";
import { TierDialog } from "./TierDialog";
import { useLoyaltyTiers } from "@/hooks/useLoyaltyTiers";
import { Badge } from "@/components/ui/badge";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function TierManagementCard() {
  const {
    tiers,
    isLoading,
    createTier,
    updateTier,
    deleteTier,
    toggleTierStatus,
  } = useLoyaltyTiers();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tierToDelete, setTierToDelete] = useState(null);

  const handleEdit = (tier) => {
    setSelectedTier(tier);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedTier(null);
    setDialogOpen(true);
  };

  const handleSave = (data) => {
    if (data.id) {
      updateTier(data);
    } else {
      createTier(data);
    }
  };

  const handleDeleteClick = (tierId) => {
    setTierToDelete(tierId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (tierToDelete) {
      deleteTier(tierToDelete);
      setDeleteDialogOpen(false);
      setTierToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading tiers...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Loyalty Tiers</CardTitle>

          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Add Tier
          </Button>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {tiers?.map((tier) => (
              <div key={tier.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-lg font-semibold ${tier.color}`}>
                        {tier.name}
                      </h3>

                      {!tier.active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {tier.min_points.toLocaleString()} -{" "}
                      {tier.max_points
                        ? tier.max_points.toLocaleString()
                        : "∞"}{" "}
                      points
                    </p>

                    <p className="text-sm">
                      <span className="font-medium">Multiplier:</span>{" "}
                      {tier.multiplier}x
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {/* Toggle Active / Inactive */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        toggleTierStatus({
                          id: tier.id,
                          active: !tier.active,
                        })
                      }
                    >
                      {tier.active ? (
                        <Power className="h-4 w-4" />
                      ) : (
                        <PowerOff className="h-4 w-4" />
                      )}
                    </Button>

                    {/* Edit Button */}
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(tier)}>
                      <Edit className="h-4 w-4" />
                    </Button>

                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(tier.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {/* Benefits */}
                <div>
                  <p className="text-sm font-medium mb-1">Benefits:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {Array.isArray(tier.benefits) &&
                      tier.benefits.map((benefit, idx) => (
                        <li key={idx}>• {benefit}</li>
                      ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Tier Dialog */}
      <TierDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tier={selectedTier}
        onSave={handleSave}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tier</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tier? This action cannot be
              undone. Customers currently in this tier will need to be
              reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>

            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
