import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, Clock, Gift, Zap } from "lucide-react";
import { formatDistanceToNow, differenceInHours } from "date-fns";
import { cn } from "@/lib/utils";

export function ExpiringPointsAlert({ expiringPoints, onViewRewards }) {
  if (expiringPoints.total === 0) return null;

  const nearestExpiryDate = expiringPoints.nearestExpiry
    ? new Date(expiringPoints.nearestExpiry)
    : null;

  const daysUntilExpiry = nearestExpiryDate
    ? formatDistanceToNow(nearestExpiryDate, { addSuffix: true })
    : null;

  const hoursUntilExpiry = nearestExpiryDate
    ? differenceInHours(nearestExpiryDate, new Date())
    : 999;

  const isCritical = expiringPoints.urgency <= 1; // ≤1 day
  const isUrgent = expiringPoints.urgency <= 7; // 2–7 days

  return (
    <Alert
      className={cn(
        "border-2",
        isCritical && "border-destructive/50 bg-destructive/10",
        !isCritical && isUrgent && "border-amber-500/50 bg-amber-500/10",
        !isCritical && !isUrgent && "border-primary/50 bg-primary/10"
      )}
    >
      <div className="flex items-start gap-3">
        {/* ICON */}
        <div
          className={cn(
            "p-2 rounded-full",
            isCritical && "bg-destructive/20",
            !isCritical && isUrgent && "bg-amber-500/20",
            !isCritical && !isUrgent && "bg-primary/20"
          )}
        >
          {isCritical ? (
            <Zap className={cn("h-5 w-5", "text-destructive")} />
          ) : (
            <AlertTriangle
              className={cn(
                "h-5 w-5",
                isUrgent ? "text-amber-500" : "text-primary"
              )}
            />
          )}
        </div>

        {/* TEXT */}
        <div className="flex-1 space-y-3">
          <div>
            <AlertTitle
              className={cn(
                "font-semibold text-lg flex items-center gap-2 mb-1",
                isCritical && "text-destructive",
                !isCritical && isUrgent && "text-amber-500",
                !isCritical && !isUrgent && "text-primary"
              )}
            >
              {isCritical && "⚡ Critical: "}
              {!isCritical && isUrgent && "⏰ Urgent: "}
              Points Expiring Soon
              {hoursUntilExpiry <= 24 && hoursUntilExpiry > 0 && (
                <Badge variant="destructive" className="ml-2">
                  <Clock className="h-3 w-3 mr-1" />
                  {hoursUntilExpiry}h left
                </Badge>
              )}
            </AlertTitle>

            <AlertDescription className="text-foreground">
              <p className={cn("text-base", isCritical && "font-semibold")}>
                You have{" "}
                <span className="font-bold text-lg">
                  {expiringPoints.total}
                </span>{" "}
                points expiring {daysUntilExpiry}.
                {isCritical ? " Act now!" : " Use them before they expire!"}
              </p>
            </AlertDescription>
          </div>

          {/* Affordable Rewards */}
          {expiringPoints.affordableRewards &&
            expiringPoints.affordableRewards.length > 0 && (
              <div className="p-3 rounded-lg bg-background/50 border">
                <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Rewards you can redeem now:
                </p>
                <div className="flex flex-wrap gap-2">
                  {expiringPoints.affordableRewards.map((reward) => (
                    <Badge key={reward.id} variant="secondary" className="text-xs">
                      {reward.title} ({reward.points_cost.toLocaleString()} pts)
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* Schedule */}
          {Object.keys(expiringPoints.grouped).length > 1 && (
            <div className="text-sm space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Expiration Schedule:
              </p>

              {Object.entries(expiringPoints.grouped)
                .sort(([a], [b]) => new Date(a) - new Date(b))
                .slice(0, 3)
                .map(([date, points]) => (
                  <p key={date} className="text-muted-foreground ml-4">
                    {date}: <span className="font-medium">{points} points</span>
                  </p>
                ))}

              {Object.keys(expiringPoints.grouped).length > 3 && (
                <p className="text-muted-foreground ml-4 italic">
                  +
                  {Object.keys(expiringPoints.grouped).length - 3} more dates
                </p>
              )}
            </div>
          )}

          {/* Button */}
          {onViewRewards && (
            <Button
              onClick={onViewRewards}
              variant={isCritical ? "destructive" : "default"}
              size="sm"
              className="mt-2"
            >
              <Gift className="h-4 w-4 mr-2" />
              {isCritical ? "Redeem Now!" : "View Available Rewards"}
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}
