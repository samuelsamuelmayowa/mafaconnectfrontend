import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useLoyaltyAnalytics } from "@/hooks/useLoyaltyAnalytics";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Gift,
  Users,
  Coins,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--amber-500))",
];

export function LoyaltyAnalyticsCard() {
  const { analytics, isLoading } = useLoyaltyAnalytics();

  if (isLoading || !analytics) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const tierData = Object.entries(analytics.membersByTier).map(
    ([tier, count]) => ({
      name: tier,
      value: count,
    })
  );

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Active Points */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Points</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.activePointsBalance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Points in circulation</p>
          </CardContent>
        </Card>

        {/* Redemption Rate */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Redemption Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.redemptionRate}%</div>
            <p className="text-xs text-muted-foreground">Redeemed vs earned</p>
          </CardContent>
        </Card>

        {/* Avg Points/Member */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Points/Member</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.averagePointsPerMember.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Active members only</p>
          </CardContent>
        </Card>

        {/* Expiring Soon */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {analytics.pointsExpiringNextMonth.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Next 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="rewards">Top Rewards</TabsTrigger>
        </TabsList>

        {/* Trends */}
        <TabsContent value="trends" className="space-y-4">
          {/* Points Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Points Activity Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="earned"
                    stroke="hsl(var(--success))"
                    fill="hsl(var(--success))"
                    name="Points Earned"
                    fillOpacity={0.5}
                  />
                  <Area
                    type="monotone"
                    dataKey="redeemed"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    name="Points Redeemed"
                    fillOpacity={0.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Monthly Redemptions */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Redemptions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="redemptions"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Redemptions"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution */}
        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Members by Tier */}
            <Card>
              <CardHeader>
                <CardTitle>Members by Tier</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={tierData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {tierData.map((entry, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tier Distribution List */}
            <Card>
              <CardHeader>
                <CardTitle>Tier Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tierData.map((tier, index) => (
                    <div key={tier.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{tier.name}</span>
                      </div>
                      <Badge variant="secondary">{tier.value} members</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Top Rewards */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 Most Redeemed Rewards</CardTitle>
            </CardHeader>

            <CardContent>
              {analytics.topRewards.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No redemptions yet
                </p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.topRewards} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                      <YAxis
                        dataKey="title"
                        type="category"
                        width={150}
                        stroke="hsl(var(--muted-foreground))"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--popover))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "var(--radius)",
                        }}
                      />
                      <Bar dataKey="count" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>

                  {/* List */}
                  <div className="mt-6 space-y-2">
                    {analytics.topRewards.map((reward, index) => (
                      <div
                        key={reward.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="outline"
                            className="w-8 h-8 flex items-center justify-center"
                          >
                            {index + 1}
                          </Badge>
                          <div>
                            <p className="font-medium">{reward.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {reward.pointsCost} points
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-bold">{reward.count}</p>
                          <p className="text-xs text-muted-foreground">
                            redemptions
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
