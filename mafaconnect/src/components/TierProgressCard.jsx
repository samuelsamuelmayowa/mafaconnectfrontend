
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Award } from "lucide-react";
import { cn } from "@/lib/utils";

export function TierProgressCard({ tiers = [], currentPoints = 0, currentTierName }) {
  if (!tiers.length) return null;

  /** Normalize Tier Data — Fix broken JSON, missing multipliers, sorting */
  const normalizedTiers = tiers.map((t) => ({
    ...t,
    benefits:
      typeof t.benefits === "string"
        ? JSON.parse(t.benefits || "[]")
        : Array.isArray(t.benefits)
        ? t.benefits
        : [],
    multiplier: t.multiplier || 1,
    min_points: Number(t.min_points) || 0,
    max_points: t.max_points ?? null,
    sort_order: t.sort_order ?? t.min_points ?? 0,
  }));

  const sortedTiers = normalizedTiers.sort(
    (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
  );

  /** Determine Tier Position */
  const currentIndex = sortedTiers.findIndex((t) => t.name === currentTierName);
  const currentTier = sortedTiers[currentIndex];
  const nextTier = sortedTiers[currentIndex + 1];

  /** Progress bar logic */
  const progress = (() => {
    if (!nextTier) return 100; // last tier
    const start = currentTier?.min_points ?? 0;
    const end = nextTier.min_points;
    return Math.min(Math.max(((currentPoints - start) / (end - start)) * 100, 0), 100);
  })();

  const pointsToNext = nextTier ? nextTier.min_points - currentPoints : 0;

  /** Tier Icons */
  const icon = (name) => {
    const n = name.toLowerCase();
    if (n.includes("bronze")) return "🥉";
    if (n.includes("silver")) return "🥈";
    if (n.includes("gold")) return "🏆";
    if (n.includes("platinum")) return "💎";
    return "⭐";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-primary" /> Loyalty Tier Progress
        </CardTitle>

        <CardDescription>
          {nextTier
            ? `${pointsToNext} points until ${nextTier.name}`
            : "You are at the highest tier 🎉"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* PROGRESS TRACK (Desktop) */}
        <div className="hidden md:block">
          <div className="relative pb-8">

            {/* Track line */}
            <div className="absolute top-8 left-0 right-0 h-1 bg-border">
              <div
                className="h-full bg-primary transition-all"
                style={{
                  width: `${(currentIndex / (sortedTiers.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* TIERS */}
            <div className="flex justify-between">
              {sortedTiers.map((tier, index) => {
                const isCurrent = index === currentIndex;
                const passed = index < currentIndex;

                return (
                  <div key={tier.name} className="flex flex-col items-center w-full">
                    <div
                      className={cn(
                        "relative rounded-full flex items-center justify-center h-16 w-16 border-4 transition-all",
                        isCurrent && "border-primary bg-primary/10 scale-110",
                        passed && "border-primary bg-primary/20",
                        !isCurrent && !passed && "border-muted bg-background"
                      )}
                    >
                      <span className="text-3xl">{icon(tier.name)}</span>

                      {isCurrent && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-ping" />
                      )}
                    </div>

                    <p
                      className={cn(
                        "mt-2 font-semibold text-sm",
                        isCurrent ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {tier.name}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {tier.min_points}+ pts
                    </p>

                    {isCurrent && <Badge className="text-xs mt-1">Current</Badge>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Main Progress Bar */}
          {nextTier && (
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {currentPoints.toLocaleString()} pts
                </span>

                <span className="text-primary font-semibold">
                  {Math.round(progress)}% to {nextTier.name}
                </span>
              </div>

              <div className="h-3 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* MOBILE STACK */}
        <div className="md:hidden space-y-3">
          {sortedTiers.map((tier, index) => {
            const isCurrent = index === currentIndex;
            const passed = index < currentIndex;
            return (
              <div
                key={tier.name}
                className={cn(
                  "p-4 rounded-lg border flex items-center gap-4",
                  isCurrent && "border-primary bg-primary/5"
                )}
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-xl border-2",
                    isCurrent && "border-primary",
                    passed && "border-primary bg-primary/10",
                    !isCurrent && !passed && "border-muted"
                  )}
                >
                  {icon(tier.name)}
                </div>

                <div>
                  <p className={cn(isCurrent && "text-primary font-semibold")}>
                    {tier.name}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {tier.min_points}+ pts • {tier.multiplier}x
                  </p>

                  {isCurrent && nextTier && (
                    <p className="text-xs text-primary mt-1">
                      {pointsToNext} points to {nextTier.name}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* NEXT TIER BENEFITS */}
        {nextTier && nextTier.benefits.length > 0 && (
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="font-medium text-primary text-sm mb-2">
              Unlock {nextTier.name} benefits:
            </p>
            <ul className="text-sm space-y-1 text-muted-foreground">
              {nextTier.benefits.slice(0, 3).map((b, i) => (
                <li key={i}>• {b}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// import React from "react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/Card";
// import { Badge } from "@/components/ui/Badge";
// // import { Badge } from "@/components/ui/Badge";
// import { Award } from "lucide-react";
// import { cn } from "@/lib/utils";

// export function TierProgressCard({ tiers, currentPoints, currentTierName }) {
//   if (!tiers || tiers.length === 0) return null;
// const normalizedTiers = tiers.map(t => ({
//   ...t,
//   benefits: typeof t.benefits === "string" ? JSON.parse(t.benefits || "[]") : t.benefits,
//   multiplier: t.multiplier || 1,
//   sort_order: t.sort_order ?? t.min_points ?? 0
// }));
//   const sortedTiers = [...tiers].sort((a, b) => a.sort_order - b.sort_order);
//   const currentTierIndex = sortedTiers.findIndex(
//     (t) => t.name === currentTierName
//   );

//   const currentTier = sortedTiers[currentTierIndex];
//   const nextTier = sortedTiers[currentTierIndex + 1];

//   // Calculate progress percentage to next tier
//   const getProgress = () => {
//     if (!nextTier) return 100; // Max tier reached
//     const rangeStart = currentTier?.min_points || 0;
//     const rangeEnd = nextTier.min_points;
//     const progress =
//       ((currentPoints - rangeStart) / (rangeEnd - rangeStart)) * 100;
//     return Math.min(Math.max(progress, 0), 100);
//   };

//   const progress = getProgress();
//   const pointsToNext = nextTier ? nextTier.min_points - currentPoints : 0;

//   const getTierIcon = (tierName) => {
//     const name = tierName.toLowerCase();
//     if (name.includes("bronze")) return "🥉";
//     if (name.includes("silver")) return "🥈";
//     if (name.includes("gold")) return "🏆";
//     if (name.includes("platinum")) return "💎";
//     return "⭐";
//   };

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <Award className="h-5 w-5 text-primary" />
//           Your Tier Journey
//         </CardTitle>
//         <CardDescription>
//           {nextTier
//             ? `${pointsToNext.toLocaleString()} points until ${nextTier.name} tier`
//             : "You've reached the highest tier! 🎉"}
//         </CardDescription>
//       </CardHeader>

//       <CardContent className="space-y-6">
//         {/* DESKTOP */}
//         <div className="hidden md:block">
//           <div className="relative">
//             {/* Progress Line */}
//             <div className="absolute top-8 left-0 right-0 h-1 bg-border">
//               <div
//                 className="h-full bg-primary transition-all duration-500"
//                 style={{
//                   width: `${(currentTierIndex /
//                     (sortedTiers.length - 1)) *
//                     100}%`,
//                 }}
//               />
//             </div>

//             {/* Tier Markers */}
//             <div className="flex justify-between items-start">
//               {sortedTiers.map((tier, index) => {
//                 const isCurrentTier = tier.name === currentTierName;
//                 const isPastTier = index < currentTierIndex;
//                 const isFutureTier = index > currentTierIndex;

//                 return (
//                   <div
//                     key={tier.id || tier.name}
//                     className="flex flex-col items-center"
//                     style={{ flex: 1 }}
//                   >
//                     <div
//                       className={cn(
//                         "relative z-10 flex items-center justify-center w-16 h-16 rounded-full border-4 transition-all duration-300",
//                         isCurrentTier &&
//                           "border-primary bg-primary/10 shadow-lg shadow-primary/20 scale-110",
//                         isPastTier && "border-primary bg-primary/20",
//                         isFutureTier && "border-border bg-background"
//                       )}
//                     >
//                       <span className="text-3xl">{getTierIcon(tier.name)}</span>
//                       {isCurrentTier && (
//                         <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full animate-pulse" />
//                       )}
//                     </div>

//                     {/* Tier Name */}
//                     <div className="mt-2 text-center">
//                       <p
//                         className={cn(
//                           "font-semibold",
//                           isCurrentTier
//                             ? "text-primary"
//                             : "text-muted-foreground"
//                         )}
//                       >
//                         {tier.name}
//                       </p>
//                       <p className="text-xs text-muted-foreground">
//                         {tier.min_points.toLocaleString()}+ pts
//                       </p>
//                       {isCurrentTier && (
//                         <Badge variant="secondary" className="mt-1 text-xs">
//                           Current
//                         </Badge>
//                       )}
//                     </div>

//                     {/* Benefit preview */}
//                     {isCurrentTier &&
//                       tier.benefits &&
//                       Array.isArray(tier.benefits) &&
//                       tier.benefits.length > 0 && (
//                         <div className="mt-2 text-xs text-muted-foreground text-center max-w-[120px]">
//                           <span className="font-medium">
//                             {tier.multiplier}x points
//                           </span>
//                         </div>
//                       )}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Progress bar */}
//           {nextTier && (
//             <div className="mt-6 space-y-2">
//               <div className="flex items-center justify-between text-sm">
//                 <span className="text-muted-foreground">
//                   {currentPoints.toLocaleString()} points
//                 </span>
//                 <span className="font-medium text-primary">
//                   {Math.round(progress)}% to {nextTier.name}
//                 </span>
//               </div>

//               <div className="h-3 bg-border rounded-full overflow-hidden">
//                 <div
//                   className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500"
//                   style={{ width: `${progress}%` }}
//                 />
//               </div>
//             </div>
//           )}

//           {/* Next Tier Benefits */}
//           {nextTier &&
//             nextTier.benefits &&
//             Array.isArray(nextTier.benefits) &&
//             nextTier.benefits.length > 0 && (
//               <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
//                 <p className="text-sm font-medium text-primary mb-2">
//                   Unlock {nextTier.name} benefits:
//                 </p>
//                 <ul className="text-sm space-y-1">
//                   {nextTier.benefits.slice(0, 3).map((benefit, idx) => (
//                     <li
//                       key={idx}
//                       className="flex items-start gap-2 text-muted-foreground"
//                     >
//                       <span className="text-primary">•</span>
//                       <span>{benefit}</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//         </div>

//         {/* MOBILE */}
//         <div className="md:hidden space-y-4">
//           {sortedTiers.map((tier, index) => {
//             const isCurrentTier = tier.name === currentTierName;
//             const isPastTier = index < currentTierIndex;
//             const isFutureTier = index > currentTierIndex;

//             return (
//               <div
//                 key={tier.id || tier.name}
//                 className={cn(
//                   "flex items-start gap-4 p-4 rounded-lg border transition-all",
//                   isCurrentTier && "border-primary bg-primary/5",
//                   !isCurrentTier && "border-border"
//                 )}
//               >
//                 <div
//                   className={cn(
//                     "flex items-center justify-center w-12 h-12 rounded-full border-2",
//                     isCurrentTier && "border-primary bg-primary/10",
//                     isPastTier && "border-primary bg-primary/20",
//                     isFutureTier && "border-border"
//                   )}
//                 >
//                   <span className="text-2xl">{getTierIcon(tier.name)}</span>
//                 </div>

//                 <div className="flex-1">
//                   <div className="flex items-center gap-2">
//                     <p
//                       className={cn(
//                         "font-semibold",
//                         isCurrentTier && "text-primary"
//                       )}
//                     >
//                       {tier.name}
//                     </p>

//                     {isCurrentTier && (
//                       <Badge variant="secondary" className="text-xs">
//                         Current
//                       </Badge>
//                     )}
//                   </div>

//                   <p className="text-sm text-muted-foreground">
//                     {tier.min_points.toLocaleString()}+ points •{" "}
//                     {tier.multiplier}x multiplier
//                   </p>

//                   {isCurrentTier && nextTier && (
//                     <p className="text-sm text-primary mt-1">
//                       {pointsToNext.toLocaleString()} points to {nextTier.name}
//                     </p>
//                   )}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
