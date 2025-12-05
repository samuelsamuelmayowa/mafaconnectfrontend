import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Gift, AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { toast } from "sonner";

export function RedeemRewardDialog({
  open,
  onOpenChange,
  reward,
  currentPoints,
  onRedeem,
  isRedeeming,
  redemptionCode,
}) {
  const [showSuccess, setShowSuccess] = React.useState(false);

  React.useEffect(() => {
    if (redemptionCode) {
      setShowSuccess(true);
    } else {
      setShowSuccess(false);
    }
  }, [redemptionCode]);

  const handleClose = () => {
    setShowSuccess(false);
    onOpenChange(false);
  };

  const handleCopyCode = () => {
    if (redemptionCode) {
      navigator.clipboard.writeText(redemptionCode);
      toast.success("Code copied to clipboard!");
    }
  };

  if (!reward) return null;

  const hasEnoughPoints = currentPoints >= reward.points_cost;

  // ================================
  // SUCCESS UI
  // ================================
  if (showSuccess && redemptionCode) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center">Reward Redeemed!</DialogTitle>
            <DialogDescription className="text-center">
              Your redemption code is ready to use
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-secondary/50 border-2 border-dashed border-primary/20">
              <p className="text-xs text-muted-foreground mb-2 text-center">
                Redemption Code
              </p>
              <p className="text-2xl font-bold text-center tracking-wider font-mono">
                {redemptionCode}
              </p>
            </div>

            <Button onClick={handleCopyCode} variant="outline" className="w-full">
              <Copy className="h-4 w-4 mr-2" />
              Copy Code
            </Button>

            {reward.expiry_days && (
              <p className="text-xs text-muted-foreground text-center">
                Valid for {reward.expiry_days} days from redemption
              </p>
            )}

            <Button onClick={handleClose} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // ================================
  // CONFIRMATION UI
  // ================================
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Redeem Reward
          </DialogTitle>
          <DialogDescription>
            Confirm your reward redemption
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Reward Summary */}
          <div className="p-4 rounded-lg bg-secondary/50">
            <h3 className="font-semibold mb-1">{reward.title}</h3>
            {reward.description && (
              <p className="text-sm text-muted-foreground mb-3">
                {reward.description}
              </p>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{reward.reward_type}</Badge>
              <Badge variant="outline">{reward.points_cost} points</Badge>
            </div>
          </div>

          {/* Before / After Points UI */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div>
              <p className="text-sm text-muted-foreground">Your Current Points</p>
              <p className="text-2xl font-bold">{currentPoints}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">After Redemption</p>
              <p className="text-2xl font-bold">
                {currentPoints - reward.points_cost}
              </p>
            </div>
          </div>

          {/* Not Enough Points Warning */}
          {!hasEnoughPoints && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold">Insufficient Points</p>
                <p>
                  You need {reward.points_cost - currentPoints} more points to redeem this reward.
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                try {
                  await onRedeem(reward.id);
                } catch (error) {
                  console.error("Redemption error in dialog:", error);
                }
              }}
              disabled={!hasEnoughPoints || isRedeeming}
              className="flex-1"
            >
              {isRedeeming ? "Redeeming..." : "Confirm Redemption"}
            </Button>

            
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}



// {redemptionCode ? (
//   <div className="p-4 text-center space-y-2">
//     <h2 className="text-xl font-bold text-green-600">Redemption Successful Pending Approval 🎉</h2>
//     <p className="text-sm">Your approval code:</p>
//     <code className="text-lg font-mono bg-muted px-3 py-2 rounded">
//       {redemptionCode}
//     </code>

//     <p className="text-xs text-muted-foreground">
//       Admin will verify & activate this reward.
//     </p>
//   </div>
// ) : (
//   // normal redeem UI
// )}
