import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Gift,
  Search,
  TrendingUp,
  Clock,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

export function RewardsCatalog({ rewards, currentPoints, onRedeemClick }) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [sortBy, setSortBy] = React.useState("points-asc");

  // Extract unique categories
  const categories = React.useMemo(() => {
    const cats = new Set(rewards.map(r => r.category || "general"));
    return Array.from(cats).sort();
  }, [rewards]);

  // Filtering + Sorting
  const filteredRewards = React.useMemo(() => {
    let filtered = rewards.filter(r => r.active);

    // Search
    if (searchQuery) {
      filtered = filtered.filter(
        r =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        r => (r.category || "general") === categoryFilter
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "points-asc":
          return a.points_cost - b.points_cost;
        case "points-desc":
          return b.points_cost - a.points_cost;
        case "name":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [rewards, searchQuery, categoryFilter, sortBy]);

  // Featured (close to points or affordable)
  const featuredRewards = React.useMemo(() => {
    return rewards
      .filter(r => r.active && r.points_cost <= currentPoints * 1.2)
      .sort(
        (a, b) =>
          Math.abs(a.points_cost - currentPoints) -
          Math.abs(b.points_cost - currentPoints)
      )
      .slice(0, 3);
  }, [rewards, currentPoints]);

  const getAffordabilityStatus = pointsCost => {
    if (pointsCost <= currentPoints)
      return { status: "affordable", color: "text-success" };
    if (pointsCost <= currentPoints * 1.2)
      return { status: "almost", color: "text-amber-500" };
    return { status: "locked", color: "text-muted-foreground" };
  };

  // Render each reward card
  const renderRewardCard = (reward, featured) => {
    const canAfford = currentPoints >= reward.points_cost;
    const outOfStock =
      reward.stock_limit !== null && reward.stock_limit <= 0;
    const lowStock =
      reward.stock_limit !== null &&
      reward.stock_limit <= 5 &&
      reward.stock_limit > 0;

    const affordability = getAffordabilityStatus(reward.points_cost);

    const progressPercent = Math.min(
      (currentPoints / reward.points_cost) * 100,
      100
    );

    return (
      <Card
        key={reward.id}
        className={cn(
          "overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]",
          featured && "border-primary"
        )}
      >
        <CardContent className="p-4 space-y-3">
          {/* IMAGE */}
          <div className="aspect-video rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
            {reward.image_url ? (
              <img
                src={reward.image_url}
                alt={reward.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <Gift className="h-12 w-12 text-primary" />
            )}
          </div>

          {/* HEADER */}
          <div>
            <div className="flex items-start gap-2 mb-2">
              <h3 className="font-semibold text-lg flex-1">
                {reward.title}
              </h3>
              {featured && (
                <Badge variant="default" className="bg-gradient-primary">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>

            {reward.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {reward.description}
              </p>
            )}
          </div>

          {/* COST + PROGRESS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className={cn("bg-accent/10", affordability.color)}
              >
                {reward.points_cost.toLocaleString()} points
              </Badge>

              {!canAfford &&
                affordability.status === "almost" && (
                  <span className="text-xs text-amber-500 font-medium">
                    Almost there!
                  </span>
                )}
            </div>

            {!canAfford && (
              <Progress value={progressPercent} className="h-2" />
            )}
          </div>

          {/* METADATA */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <Badge variant="secondary" className="capitalize">
              {reward.category || "general"}
            </Badge>

            {reward.expiry_days && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {reward.expiry_days}d validity
              </span>
            )}

            {lowStock && (
              <span className="flex items-center gap-1 text-amber-500">
                <AlertTriangle className="h-3 w-3" />
                {reward.stock_limit} left
              </span>
            )}
          </div>

          {/* ACTION BUTTON */}
          <Button
            onClick={() => onRedeemClick(reward)}
            disabled={!canAfford || outOfStock}
            className="w-full"
            variant={canAfford && !outOfStock ? "default" : "outline"}
          >
            {outOfStock
              ? "Out of Stock"
              : !canAfford
              ? `Need ${(reward.points_cost - currentPoints).toLocaleString()} more`
              : "Redeem Now"}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* FEATURED */}
      {featuredRewards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Rewards You Can Afford
          </h3>

          <div className="grid gap-4 md:grid-cols-3">
            {featuredRewards.map(r => renderRewardCard(r, true))}
          </div>
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rewards..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat} className="capitalize">
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="points-asc">
              Points: Low to High
            </SelectItem>
            <SelectItem value="points-desc">
              Points: High to Low
            </SelectItem>
            <SelectItem value="name">Name: A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* GRID */}
      <div>
        <h3 className="text-lg font-semibold mb-3">All Rewards</h3>

        {filteredRewards.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No rewards found
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredRewards.map(r => renderRewardCard(r))}
          </div>
        )}
      </div>
    </div>
  );
}
