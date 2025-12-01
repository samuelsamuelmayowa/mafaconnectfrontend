import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { CheckCircle, XCircle } from "lucide-react";

export function RedemptionDetailsDialog({
  open,
  onOpenChange,
  redemption,
  onMarkUsed,
  onCancel,
  isLoading,
}) {
  if (!redemption) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-primary";
      case "used":
        return "bg-success";
      case "expired":
        return "bg-muted";
      case "cancelled":
        return "bg-destructive";
      default:
        return "bg-muted";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Redemption Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">

          {/* Status & Code */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <Badge className={getStatusColor(redemption.status)}>
                {redemption.status.toUpperCase()}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Redemption Code</p>
              <p className="font-mono font-semibold">
                {redemption.redemption_code}
              </p>
            </div>
          </div>

          <Separator />

          {/* Customer Info */}
          <div>
            <h4 className="font-semibold mb-2">Customer Information</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium">{redemption.customer?.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Email</p>
                <p className="font-medium">{redemption.customer?.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Phone</p>
                <p className="font-medium">
                  {redemption.customer?.phone || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Reward Info */}
          <div>
            <h4 className="font-semibold mb-2">Reward Information</h4>
            <div className="space-y-2 text-sm">
              <div>
                <p className="text-muted-foreground">Reward</p>
                <p className="font-medium">{redemption.reward?.title}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Description</p>
                <p>{redemption.reward?.description}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Points Spent</p>
                <p className="font-medium">
                  {redemption.points_spent.toLocaleString()} points
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Timeline */}
          <div>
            <h4 className="font-semibold mb-2">Timeline</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Redeemed At</span>
                <span>{format(new Date(redemption.created_at), "PPp")}</span>
              </div>

              {redemption.used_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Used At</span>
                  <span>{format(new Date(redemption.used_at), "PPp")}</span>
                </div>
              )}

              {redemption.expires_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expires At</span>
                  <span>{format(new Date(redemption.expires_at), "PPp")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          {redemption.status === "active" && (
            <>
              <Separator />

              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    onMarkUsed(redemption.id);
                    onOpenChange(false);
                  }}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Used
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => {
                    onCancel(redemption.id);
                    onOpenChange(false);
                  }}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancel & Refund
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
