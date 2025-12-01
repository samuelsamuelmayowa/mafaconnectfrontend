import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
// import { Badge } from "@/components/ui/Badge";
import { Award } from "lucide-react";
import { cn } from "@/lib/utils";

export function TierProgressCard({ tiers, currentPoints, currentTierName }) {
  if (!tiers || tiers.length === 0) return null;

  const sortedTiers = [...tiers].sort((a, b) => a.sort_order - b.sort_order);
  const currentTierIndex = sortedTiers.findIndex(
    (t) => t.name === currentTierName
  );

  const currentTier = sortedTiers[currentTierIndex];
  const nextTier = sortedTiers[currentTierIndex + 1];

  // Calculate progress percentage to next tier
  const getProgress = () => {
    if (!nextTier) return 100; // Max tier reached
    const rangeStart = currentTier?.min_points || 0;
    const rangeEnd = nextTier.min_points;
    const progress =
      ((currentPoints - rangeStart) / (rangeEnd - rangeStart)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const progress = getProgress();
  const pointsToNext = nextTier ? nextTier.min_points - currentPoints : 0;

  const getTierIcon = (tierName) => {
    const name = tierName.toLowerCase();
    if (name.includes("bronze")) return "🥉";
    if (name.includes("silver")) return "🥈";
    if (name.includes("gold")) return "🏆";
    if (name.includes("platinum")) return "💎";
    return "⭐";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" />
          Your Tier Journey
        </CardTitle>
        <CardDescription>
          {nextTier
            ? `${pointsToNext.toLocaleString()} points until ${nextTier.name} tier`
            : "You've reached the highest tier! 🎉"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* DESKTOP */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-border">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{
                  width: `${(currentTierIndex /
                    (sortedTiers.length - 1)) *
                    100}%`,
                }}
              />
            </div>

            {/* Tier Markers */}
            <div className="flex justify-between items-start">
              {sortedTiers.map((tier, index) => {
                const isCurrentTier = tier.name === currentTierName;
                const isPastTier = index < currentTierIndex;
                const isFutureTier = index > currentTierIndex;

                return (
                  <div
                    key={tier.id || tier.name}
                    className="flex flex-col items-center"
                    style={{ flex: 1 }}
                  >
                    <div
                      className={cn(
                        "relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-300",
                        isCurrentTier &&
                          "border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-110",
                        isPastTier && "border-primary bg-primary/20",
                        isFutureTier && "border-border bg-background"
                      )}
                    >
                      <span className="text-3xl">{getTierIcon(tier.name)}</span>
                      {isCurrentTier && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse" />
                      )}
                    </div>

                    {/* Tier Name */}
                    <div className="mt-2 text-center">
                      <p
                        className={cn(
                          "font-semibold",
                          isCurrentTier
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        {tier.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tier.min_points.toLocaleString()}+ pts
                      </p>
                      {isCurrentTier && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Current
                        </Badge>
                      )}
                    </div>

                    {/* Benefit preview */}
                    {isCurrentTier &&
                      tier.benefits &&
                      Array.isArray(tier.benefits) &&
                      tier.benefits.length > 0 && (
                        <div className="mt-2 text-xs text-muted-foreground text-center max-w-[120px]">
                          <span className="font-medium">
                            {tier.multiplier}x points
                          </span>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Progress bar */}
          {nextTier && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {currentPoints.toLocaleString()} points
                </span>
                <span className="font-medium text-primary">
                  {Math.round(progress)}% to {nextTier.name}
                </span>
              </div>

              <div className="h-3 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Next Tier Benefits */}
          {nextTier &&
            nextTier.benefits &&
            Array.isArray(nextTier.benefits) &&
            nextTier.benefits.length > 0 && (
              <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm font-medium text-primary mb-2">
                  Unlock {nextTier.name} benefits:
                </p>
                <ul className="text-sm space-y-1">
                  {nextTier.benefits.slice(0, 3).map((benefit, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-muted-foreground"
                    >
                      <span className="text-primary">•</span>
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>

        {/* MOBILE */}
        <div className="md:hidden space-y-4">
          {sortedTiers.map((tier, index) => {
            const isCurrentTier = tier.name === currentTierName;
            const isPastTier = index < currentTierIndex;
            const isFutureTier = index > currentTierIndex;

            return (
              <div
                key={tier.id || tier.name}
                className={cn(
                  "flex items-start gap-4 p-4 rounded-lg border transition-all",
                  isCurrentTier && "border-primary bg-primary/5",
                  !isCurrentTier && "border-border"
                )}
              >
                <div
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-full border-2",
                    isCurrentTier && "border-primary bg-primary/10",
                    isPastTier && "border-primary bg-primary/20",
                    isFutureTier && "border-border"
                  )}
                >
                  <span className="text-2xl">{getTierIcon(tier.name)}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p
                      className={cn(
                        "font-semibold",
                        isCurrentTier && "text-primary"
                      )}
                    >
                      {tier.name}
                    </p>

                    {isCurrentTier && (
                      <Badge variant="secondary" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {tier.min_points.toLocaleString()}+ points •{" "}
                    {tier.multiplier}x multiplier
                  </p>

                  {isCurrentTier && nextTier && (
                    <p className="text-sm text-primary mt-1">
                      {pointsToNext.toLocaleString()} points to {nextTier.name}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
