import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
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
import {
  Plus,
  Gift,
  Award,
  TrendingUp,
  Loader2,
  Users,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useRewards } from "@/hooks/useRewards";
import { useLoyaltyStats } from "@/hooks/useLoyaltyStats";
import { useAuth } from "@/hooks/useAuth";
import { useLoyaltyTiers } from "@/hooks/useLoyaltyTiers";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { RewardDialog } from "@/components/RewardDialog";
import { LoyaltyTransactionDialog } from "@/components/LoyaltyTransactionDialog";
import { RedeemRewardDialog } from "@/components/RedeemRewardDialog";
import { ExpiringPointsAlert } from "@/components/ExpiringPointsAlert";
import { TierManagementCard } from "@/components/TierManagementCard";
import { RedemptionManagementCard } from "@/components/RedemptionManagementCard";
import { LoyaltySettingsCard } from "@/components/admin/LoyaltySettingsCard";
import { useRewardRedemption } from "@/hooks/useRewardRedemption";
import { useExpiringPoints } from "@/hooks/useExpiringPoints";
import { PointsHistoryCard } from "@/components/PointsHistoryCard";
import { RewardsCatalog } from "@/components/RewardsCatalog";
import { PointsExpirationSchedule } from "@/components/PointsExpirationSchedule";
import { LoyaltyAnalyticsCard } from "@/components/LoyaltyAnalyticsCard";
import { TierProgressCard } from "@/components/TierProgressCard";
import { format } from "date-fns";

const API_BASE = import.meta.env.VITE_HOME_OO;

export default function Loyalty() {
  const { rewards, isLoading, deleteReward, toggleRewardStatus } = useRewards();
  const { stats } = useLoyaltyStats();
  const { user, isStaff } = useAuth();
  const { redemptions, redeemReward, isRedeeming } = useRewardRedemption();
  const { expiringPoints } = useExpiringPoints();
  const { tiers } = useLoyaltyTiers();

  const [showRewardDialog, setShowRewardDialog] = React.useState(false);
  const [showTransactionDialog, setShowTransactionDialog] = React.useState(false);
  const [showRedeemDialog, setShowRedeemDialog] = React.useState(false);
  const [selectedReward, setSelectedReward] = React.useState(null);
  const [rewardToDelete, setRewardToDelete] = React.useState(null);
  const [rewardToRedeem, setRewardToRedeem] = React.useState(null);
  const [lastRedemptionCode, setLastRedemptionCode] = React.useState(undefined);
  const [customerTab, setCustomerTab] = React.useState("overview");

  const handleEditReward = (reward) => {
    setSelectedReward(reward);
    setShowRewardDialog(true);
  };

  const handleDeleteReward = () => {
    if (rewardToDelete) {
      deleteReward(rewardToDelete.id);
      setRewardToDelete(null);
    }
  };

  const handleRedeemClick = (reward) => {
    setRewardToRedeem(reward);
    setShowRedeemDialog(true);
    setLastRedemptionCode(undefined);
  };

  const handleRedeem = async (rewardId) => {
    console.log("handleRedeem called with rewardId:", rewardId);
    try {
      const result = await redeemReward({ rewardId });
      console.log("Redemption result:", result);
      if (result && typeof result === "object" && "redemption_code" in result) {
        setLastRedemptionCode(result.redemption_code);
      }
    } catch (error) {
      console.error("Redemption failed in handleRedeem:", error);
      setRewardToRedeem(null);
    }
  };

  const handleRedeemDialogChange = (open) => {
    setShowRedeemDialog(open);
    if (!open) {
      setRewardToRedeem(null);
      setLastRedemptionCode(undefined);
    }
  };

  const shouldShowCustomerView = !isStaff;

  // =======================
  // CUSTOMER LOYALTY ACCOUNT
  // =======================
  // const {
  //   data: loyaltyAccount,
  //   isLoading: loadingAccount,
  //   error: accountError,
  // } = useQuery({
  //   queryKey: ["customer-loyalty-account", user?.id],
  //   queryFn: async () => {
  //     console.log("Fetching loyalty account for user:", user?.id);
  //     const { data } = await axios.get(`${API_BASE}/loyalty/${user?.id}`);
  //     console.log("Loyalty account data:", data);
  //     return data;
  //   },
  //   enabled: !!user?.id && !isStaff,
  // });

const {
  data: loyaltyAccount,
  isLoading: loadingAccount,
  error: accountError,
} = useQuery({
  queryKey: ["customer-loyalty-account", user?.id],
  queryFn: async () => {
    try {
      console.log("Fetching loyalty account for user:", user?.id);

      const { data } = await axios.get(
        `${API_BASE}/loyalty/${user?.id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
          },
        }
      );

      console.log("Loyalty response:", data);
      return data.data;
    } catch (err) {
      console.error("LOYALTY ACCOUNT ERROR RESPONSE:", err.response);
      throw err;
    }
  },
  enabled: !!user?.id && !isStaff,
});


  // =======================
  // CUSTOMER TRANSACTIONS
  // =======================
  const { data: recentTransactions } = useQuery({
    queryKey: ["customer-loyalty-transactions", loyaltyAccount?.id],
    queryFn: async () => {
      const { data } = await axios.get(
        `${API_BASE}/loyalty/accounts/${loyaltyAccount?.id}/transactions?limit=10`
      );
      return data;
    },
    enabled: !!loyaltyAccount?.id && !isStaff,
  });

  // =======================
  // STAFF RECENT REDEMPTIONS
  // =======================
  const { data: recentRedemptions } = useQuery({
    queryKey: ["recent-redemptions"],
    queryFn: async () => {
      const { data } = await axios.get(`${API_BASE}/loyalty/redemptions/recent?limit=5`);
      return data;
    },
    enabled: isStaff,
  });

  // =======================
  // LOADING STATE
  // =======================
  if (isLoading || (!isStaff && loadingAccount)) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // =======================
  // CUSTOMER ERROR STATE
  // =======================
  if (!isStaff && accountError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-xl font-semibold">Error Loading Loyalty Account</h2>
          <p className="text-muted-foreground">
            Failed to load your loyalty information. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // =======================
  // CUSTOMER VIEW
  // =======================
  if (!isStaff && shouldShowCustomerView) {
    if (!loyaltyAccount) {
      return (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <ShieldAlert className="h-12 w-12 text-muted-foreground" />
          <div className="text-center">
            <h2 className="text-xl font-semibold">Loyalty Program Not Available</h2>
            <p className="text-muted-foreground">
              Your loyalty account is not available at the moment. Please contact support.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Loyalty & Rewards</h1>
          <p className="text-muted-foreground">Earn points and redeem rewards</p>
        </div>

        {expiringPoints && expiringPoints.total > 0 && (
          <ExpiringPointsAlert
            expiringPoints={expiringPoints}
            onViewRewards={() => setCustomerTab("rewards")}
          />
        )}

        <Tabs value={customerTab} onValueChange={setCustomerTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="redemptions">My Redemptions</TabsTrigger>
          </TabsList>

          {/* ===== Overview Tab ===== */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Points Balance</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loyaltyAccount?.points_balance?.toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Available points</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Tier</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loyaltyAccount?.tier || "Silver"}
                  </div>
                  <p className="text-xs text-muted-foreground">Loyalty tier</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
                  <Gift className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {recentTransactions
                      ?.filter((t) => t.type === "earn")
                      .reduce((sum, t) => sum + t.points, 0)
                      .toLocaleString() || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Lifetime points</p>
                </CardContent>
              </Card>
            </div>

            {/* Tier Progress */}
            {loyaltyAccount && tiers && tiers.length > 0 && (
              <TierProgressCard
                tiers={tiers}
                currentPoints={loyaltyAccount.points_balance}
                currentTierName={loyaltyAccount.tier}
              />
            )}

            {/* Loyalty Tiers Display */}
            <Card>
              <CardHeader>
                <CardTitle>Loyalty Tiers</CardTitle>
                <CardDescription>Benefits and requirements for each tier</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {tiers?.map((tier) => (
                    <Card
                      key={tier.id}
                      className={
                        tier.name === loyaltyAccount?.tier ? "border-primary" : ""
                      }
                    >
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award
                            className={`h-5 w-5 ${
                              tier.color || "text-muted-foreground"
                            }`}
                          />
                          {tier.name}
                          {tier.name === loyaltyAccount?.tier && (
                            <Badge variant="secondary">Current</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {tier.min_points.toLocaleString()} -{" "}
                          {tier.max_points?.toLocaleString() || "∞"} points
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-2">
                          {tier.multiplier}x points multiplier
                        </p>
                        {tier.benefits &&
                          Array.isArray(tier.benefits) &&
                          tier.benefits.length > 0 && (
                            <ul className="text-sm space-y-1">
                              {tier.benefits.map((benefit, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-primary">•</span>
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentTransactions && recentTransactions.length > 0 ? (
                  <div className="space-y-2">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium capitalize">
                            {transaction.type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(
                              new Date(transaction.created_at),
                              "MMM d, yyyy"
                            )}
                          </p>
                          {transaction.note && (
                            <p className="text-sm text-muted-foreground">
                              {transaction.note}
                            </p>
                          )}
                        </div>
                        <div
                          className={`text-lg font-bold ${
                            transaction.type === "earn"
                              ? "text-success"
                              : transaction.type === "expiration"
                              ? "text-destructive"
                              : "text-muted-foreground"
                          }`}
                        >
                          {transaction.points > 0 ? "+" : ""}
                          {transaction.points}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No transactions yet
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== Rewards Tab ===== */}
          <TabsContent value="rewards" className="space-y-6">
            <RewardsCatalog
              rewards={rewards || []}
              currentPoints={loyaltyAccount?.points_balance || 0}
              onRedeemClick={handleRedeemClick}
            />

            {expiringPoints && expiringPoints.total > 0 && (
              <PointsExpirationSchedule expiringPoints={expiringPoints} />
            )}
          </TabsContent>

          {/* ===== History Tab ===== */}
          <TabsContent value="history" className="space-y-6">
            <PointsHistoryCard accountId={loyaltyAccount?.id} />
          </TabsContent>

          {/* ===== My Redemptions Tab ===== */}
          <TabsContent value="redemptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Redemptions</CardTitle>
                <CardDescription>
                  View and manage your redeemed rewards
                </CardDescription>
              </CardHeader>
              <CardContent>
                {redemptions && redemptions.length > 0 ? (
                  <div className="space-y-4">
                    {redemptions.map((redemption) => (
                      <Card key={redemption.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {redemption.reward?.title}
                              </CardTitle>
                              <CardDescription>
                                {redemption.reward?.description}
                              </CardDescription>
                            </div>
                            <Badge
                              variant={
                                redemption.status === "active"
                                  ? "default"
                                  : redemption.status === "used"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {redemption.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm font-medium">
                              Redemption Code
                            </span>
                            <code className="text-sm font-mono bg-background px-2 py-1 rounded">
                              {redemption.redemption_code}
                            </code>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Points Spent
                              </span>
                              <p className="font-medium">
                                {redemption.points_spent.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Redeemed
                              </span>
                              <p className="font-medium">
                                {format(
                                  new Date(redemption.created_at),
                                  "MMM d, yyyy"
                                )}
                              </p>
                            </div>
                            {redemption.expires_at && (
                              <div>
                                <span className="text-muted-foreground">
                                  Expires
                                </span>
                                <p className="font-medium">
                                  {format(
                                    new Date(redemption.expires_at),
                                    "MMM d, yyyy"
                                  )}
                                </p>
                              </div>
                            )}
                            {redemption.used_at && (
                              <div>
                                <span className="text-muted-foreground">
                                  Used
                                </span>
                                <p className="font-medium">
                                  {format(
                                    new Date(redemption.used_at),
                                    "MMM d, yyyy"
                                  )}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No redemptions yet</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setCustomerTab("rewards")}
                    >
                      Browse Rewards
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <RedeemRewardDialog
          open={showRedeemDialog}
          onOpenChange={handleRedeemDialogChange}
          reward={rewardToRedeem}
          currentPoints={loyaltyAccount?.points_balance || 0}
          onRedeem={handleRedeem}
          isRedeeming={isRedeeming}
          redemptionCode={lastRedemptionCode}
        />
      </div>
    );
  }

  // =======================
  // STAFF VIEW
  // =======================
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Loyalty Program Management</h1>
          <p className="text-muted-foreground">
            Manage tiers, rewards, and customer redemptions
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowTransactionDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Log Transaction
          </Button>
          <Button
            onClick={() => {
              setSelectedReward(null);
              setShowRewardDialog(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Reward
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="redemptions">Redemptions</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* STAFF Overview */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Points Distributed
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.totalPointsDistributed?.toLocaleString() || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Rewards Redeemed
                </CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.rewardsRedeemed || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Members
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats?.activeMembers || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Redemptions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Redemptions</CardTitle>
                  <CardDescription>
                    Latest reward redemptions by customers
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {recentRedemptions && recentRedemptions.length > 0 ? (
                <div className="space-y-3">
                  {recentRedemptions.map((redemption) => (
                    <div
                      key={redemption.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {redemption.reward?.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {redemption.customer?.name || "Customer"} •{" "}
                          {format(
                            new Date(redemption.created_at),
                            "MMM d, yyyy"
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            redemption.status === "active"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {redemption.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {redemption.points_spent} pts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No redemptions yet</p>
                  <p className="text-sm text-muted-foreground">
                    Customers can redeem rewards from the catalog
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* <Card>
            <CardHeader>
              <CardTitle>Loyalty Tiers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {tiers
                  ?.filter((t) => t.active)
                  .map((tier) => (
                    <div
                      key={tier.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className={`text-lg font-semibold ${tier.color}`}>
                        {tier.name}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {tier.min_points.toLocaleString()} -{" "}
                        {tier.max_points
                          ? tier.max_points.toLocaleString()
                          : "∞"}{" "}
                        pts
                      </p>
                      <p className="text-sm">
                        <span className="font-medium">Multiplier:</span>{" "}
                        {tier.multiplier}x
                      </p>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card> */}
          <Card>
  <CardHeader>
    <CardTitle>Loyalty Tiers</CardTitle>
  </CardHeader>

  <CardContent>
    <div className="grid gap-4 md:grid-cols-4">
      {tiers
        ?.filter((t) => t.active)
        .map((tier) => (
          <div
            key={tier.id}
            className="border rounded-lg p-4 space-y-3"
          >
            <div className={`text-lg font-semibold ${tier.color}`}>
              {tier.name}
            </div>

            <p className="text-sm text-muted-foreground">
              {tier.min_points.toLocaleString()} -{" "}
              {tier.max_points
                ? tier.max_points.toLocaleString()
                : "∞"}{" "}
              pts
            </p>

            <p className="text-sm">
              <span className="font-medium">Multiplier:</span>{" "}
              {tier.multiplier}x
            </p>

            {/* ✅ BENEFITS SECTION */}
            {tier.benefits && tier.benefits.length > 0 && (
              <ul className="text-sm space-y-1 pt-2 border-t">
                {tier.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
    </div>
  </CardContent>
</Card>

        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-6">
          <LoyaltyAnalyticsCard />
        </TabsContent>

        {/* Rewards */}
        <TabsContent value="rewards" className="space-y-6">
          <div className="flex justify-end gap-2">
            <Button onClick={() => setShowRewardDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Reward
            </Button>
            <Button onClick={() => setShowTransactionDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Log Points Transaction
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Available Rewards</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {rewards?.map((reward) => (
                  <Card key={reward.id} className="overflow-hidden">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {reward.title}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {reward.description}
                          </p>
                        </div>
                        <Badge
                          variant={reward.active ? "default" : "secondary"}
                        >
                          {reward.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Cost</span>
                        <span className="font-semibold">
                          {reward.points_cost} points
                        </span>
                      </div>
                      {reward.stock_limit !== null && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Stock</span>
                          <span className="font-semibold">
                            {reward.stock_limit} left
                          </span>
                        </div>
                      )}
                      <div className="flex gap-2 mt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() =>
                            toggleRewardStatus({
                              id: reward.id,
                              active: !reward.active,
                            })
                          }
                        >
                          {reward.active ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditReward(reward)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setRewardToDelete(reward)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tiers */}
        <TabsContent value="tiers" className="space-y-6">
          <TierManagementCard />
        </TabsContent>

        {/* Redemptions */}
        <TabsContent value="redemptions" className="space-y-6">
          <RedemptionManagementCard />
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="space-y-6">
          <LoyaltySettingsCard />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <RewardDialog
        open={showRewardDialog}
        onOpenChange={(open) => {
          setShowRewardDialog(open);
          if (!open) setSelectedReward(null);
        }}
        reward={selectedReward}
      />

      <LoyaltyTransactionDialog
        open={showTransactionDialog}
        onOpenChange={setShowTransactionDialog}
      />

      <AlertDialog
        open={!!rewardToDelete}
        onOpenChange={() => setRewardToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reward</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{rewardToDelete?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReward}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


// import React, { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
// import { Button } from "@/components/ui/Button";
// import { Badge } from "@/components/ui/Badge";
// import { Plus, Gift, Award, TrendingUp, Coins, Loader2 } from "lucide-react";
// import { useQuery } from "@tanstack/react-query";
// import { useRewards } from "@/hooks/useRewards";
// import { useLoyaltyStats } from "@/hooks/useLoyaltyStats";
// import { useAuth } from "@/hooks/useAuth";
// import { RewardDialog } from "@/components/RewardDialog";
// import { LoyaltyTransactionDialog } from "@/components/LoyaltyTransactionDialog";
// import { format } from "date-fns";

// async function fetchAPI(url) {
//   const res = await fetch(url, {
//     headers: { "Content-Type": "application/json" },
//     credentials: "include",
//   });
//   if (!res.ok) throw new Error(`HTTP ${res.status}`);
//   return res.json();
// }

// export default function Loyalty() {
//   const { rewards, isLoading } = useRewards();
//   const { stats } = useLoyaltyStats();
//   const { user, isStaff } = useAuth();

//   const [showRewardDialog, setShowRewardDialog] = useState(false);
//   const [showTransactionDialog, setShowTransactionDialog] = useState(false);

//   // 🔹 Fetch current user's loyalty account
//   const {
//     data: loyaltyAccount,
//     isLoading: loadingAccount,
//   } = useQuery({
//     queryKey: ["customer-loyalty-account", user?.id],
//     queryFn: async () =>
//       fetchAPI(`/api/loyalty/accounts/${user?.id}`), // expects { id, tier, points_balance }
//     enabled: !!user?.id && !isStaff,
//   });

//   // 🔹 Fetch recent transactions
//   const { data: recentTransactions } = useQuery({
//     queryKey: ["customer-loyalty-transactions", loyaltyAccount?.id],
//     queryFn: async () =>
//       fetchAPI(`/api/loyalty/transactions?account_id=${loyaltyAccount?.id}`),
//     enabled: !!loyaltyAccount?.id && !isStaff,
//   });

//   if (isLoading || (!isStaff && loadingAccount)) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 className="h-12 w-12 animate-spin text-primary" />
//       </div>
//     );
//   }

//   const tierConfig = [
//     {
//       name: "Bronze",
//       minPoints: 0,
//       maxPoints: 999,
//       benefits: ["Earn 1 point per ₦100", "Basic rewards access"],
//       color: "text-secondary-foreground",
//     },
//     {
//       name: "Silver",
//       minPoints: 1000,
//       maxPoints: 2999,
//       benefits: [
//         "Earn 1.25 points per ₦100",
//         "Priority support",
//         "Exclusive rewards",
//       ],
//       color: "text-muted-foreground",
//     },
//     {
//       name: "Gold",
//       minPoints: 3000,
//       maxPoints: 4999,
//       benefits: [
//         "Earn 1.5 points per ₦100",
//         "Premium support",
//         "Birthday bonus",
//       ],
//       color: "text-warning",
//     },
//     {
//       name: "Platinum",
//       minPoints: 5000,
//       maxPoints: Infinity,
//       benefits: [
//         "Earn 2 points per ₦100",
//         "VIP support",
//         "Free shipping",
//         "Early access",
//       ],
//       color: "text-accent",
//     },
//   ];

//   // 🔸 Customer view
//   if (!isStaff) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h1 className="text-3xl font-bold">Loyalty & Rewards</h1>
//           <p className="text-muted-foreground">Earn points and redeem rewards</p>
//         </div>

//         {/* Customer Stats */}
//         <div className="grid gap-4 md:grid-cols-3">
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Points Balance</CardTitle>
//               <Coins className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">
//                 {loyaltyAccount?.points_balance || 0}
//               </div>
//               <p className="text-xs text-muted-foreground">Available to redeem</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Current Tier</CardTitle>
//               <Award className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">
//                 {loyaltyAccount?.tier || "Silver"}
//               </div>
//               <p className="text-xs text-muted-foreground">Member status</p>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
//               <TrendingUp className="h-4 w-4 text-muted-foreground" />
//             </CardHeader>
//             <CardContent>
//               <div className="text-2xl font-bold">
//                 {recentTransactions
//                   ?.filter((t) => t.type === "earn")
//                   .reduce((sum, t) => sum + t.points, 0) || 0}
//               </div>
//               <p className="text-xs text-muted-foreground">All time points</p>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Tiers */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Loyalty Tiers</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid gap-4 md:grid-cols-2">
//               {tierConfig.map((tier) => (
//                 <div
//                   key={tier.name}
//                   className={`p-4 rounded-lg border-2 transition-all ${
//                     loyaltyAccount?.tier === tier.name
//                       ? "bg-primary/10 border-primary"
//                       : "bg-secondary/30 border-border"
//                   }`}
//                 >
//                   <div className="flex items-center gap-2 mb-2">
//                     <Award className={`h-5 w-5 ${tier.color}`} />
//                     <h3 className={`text-lg font-bold ${tier.color}`}>
//                       {tier.name}
//                     </h3>
//                     {loyaltyAccount?.tier === tier.name && (
//                       <Badge variant="default" className="ml-auto">
//                         Current
//                       </Badge>
//                     )}
//                   </div>
//                   <p className="text-sm text-muted-foreground mb-3">
//                     {tier.minPoints.toLocaleString()} -{" "}
//                     {tier.maxPoints?.toLocaleString() || "∞"} points
//                   </p>
//                   <ul className="space-y-1">
//                     {tier.benefits.map((b, i) => (
//                       <li key={i} className="text-sm flex items-start gap-2">
//                         <span className="text-primary mt-1">•</span> {b}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Rewards */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Available Rewards</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="grid gap-4 md:grid-cols-2">
//               {rewards?.filter((r) => r.active).map((reward) => (
//                 <div key={reward.id} className="p-4 rounded-lg bg-card border">
//                   <div className="flex items-start gap-3 mb-3">
//                     <div className="p-2 rounded-lg bg-gradient-primary">
//                       <Gift className="h-4 w-4 text-primary-foreground" />
//                     </div>
//                     <div className="flex-1">
//                       <h3 className="font-semibold mb-1">{reward.title}</h3>
//                       <p className="text-sm text-muted-foreground">
//                         {reward.description}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <Badge variant="outline" className="bg-accent/10 text-accent">
//                       {reward.points_cost.toLocaleString()} points
//                     </Badge>
//                     {reward.stock_limit && (
//                       <span className="text-sm text-muted-foreground">
//                         {reward.stock_limit} left
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </CardContent>
//         </Card>

//         {/* Recent Transactions */}
//         <Card>
//           <CardHeader>
//             <CardTitle>Recent Activity</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {recentTransactions?.length > 0 ? (
//               <div className="space-y-2">
//                 {recentTransactions.map((t) => (
//                   <div
//                     key={t.id}
//                     className="flex items-center justify-between p-3 border rounded-lg"
//                   >
//                     <div>
//                       <p className="font-medium capitalize">{t.type}</p>
//                       <p className="text-sm text-muted-foreground">
//                         {format(new Date(t.created_at), "MMM d, yyyy")}
//                       </p>
//                       {t.note && (
//                         <p className="text-sm text-muted-foreground">{t.note}</p>
//                       )}
//                     </div>
//                     <div
//                       className={`text-lg font-bold ${
//                         t.type === "earn"
//                           ? "text-success"
//                           : "text-muted-foreground"
//                       }`}
//                     >
//                       {t.type === "earn" ? "+" : "-"}
//                       {t.points}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-center text-muted-foreground py-8">
//                 No transactions yet
//               </p>
//             )}
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   // 🔸 Staff View
//   return (
//     <div className="space-y-8">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-4xl font-bold text-foreground mb-2">
//             Loyalty Program
//           </h1>
//           <p className="text-muted-foreground">
//             Manage rewards and loyalty tiers
//           </p>
//         </div>
//         <div className="flex gap-3">
//           <Button
//             onClick={() => setShowTransactionDialog(true)}
//             variant="outline"
//             className="shadow-md hover:shadow-lg transition-all"
//           >
//             <Coins className="mr-2 h-4 w-4" /> Points Transaction
//           </Button>
//           <Button
//             onClick={() => setShowRewardDialog(true)}
//             className="bg-gradient-primary shadow-md hover:shadow-lg transition-all"
//           >
//             <Plus className="mr-2 h-4 w-4" /> Create Reward
//           </Button>
//         </div>
//       </div>

//       <RewardDialog open={showRewardDialog} onOpenChange={setShowRewardDialog} />
//       <LoyaltyTransactionDialog
//         open={showTransactionDialog}
//         onOpenChange={setShowTransactionDialog}
//       />

//       {/* Staff Stats */}
//       <div className="grid gap-6 md:grid-cols-3">
//         <Card className="shadow-card">
//           <CardContent className="p-6">
//             <div className="flex items-center gap-3 mb-2">
//               <div className="p-2 rounded-lg bg-primary/10">
//                 <TrendingUp className="h-5 w-5 text-primary" />
//               </div>
//               <p className="text-sm text-muted-foreground">Points Distributed</p>
//             </div>
//             <p className="text-3xl font-bold text-foreground">
//               {stats?.totalPointsDistributed?.toLocaleString() || 0}
//             </p>
//           </CardContent>
//         </Card>

//         <Card className="shadow-card">
//           <CardContent className="p-6">
//             <div className="flex items-center gap-3 mb-2">
//               <div className="p-2 rounded-lg bg-success/10">
//                 <Gift className="h-5 w-5 text-success" />
//               </div>
//               <p className="text-sm text-muted-foreground">Rewards Redeemed</p>
//             </div>
//             <p className="text-3xl font-bold text-foreground">
//               {stats?.rewardsRedeemed?.toLocaleString() || 0}
//             </p>
//           </CardContent>
//         </Card>

//         <Card className="shadow-card">
//           <CardContent className="p-6">
//             <div className="flex items-center gap-3 mb-2">
//               <div className="p-2 rounded-lg bg-accent/10">
//                 <Award className="h-5 w-5 text-accent" />
//               </div>
//               <p className="text-sm text-muted-foreground">Active Members</p>
//             </div>
//             <p className="text-3xl font-bold text-foreground">
//               {stats?.activeMembers?.toLocaleString() || 0}
//             </p>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }
