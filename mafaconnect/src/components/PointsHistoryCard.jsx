import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePointsHistory } from "@/hooks/usePointsHistory";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Search,
  Download,
  TrendingUp,
  TrendingDown,
  Clock,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";

export function PointsHistoryCard({ accountId }) {
   const { user, isStaff } = useAuth();
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();
const {
    data: loyaltyAccount,
    isLoading: loadingAccount,
    error: accountError,
  } = useQuery({
    queryKey: ["customer-loyalty-account", user?.id],
    queryFn: async () => {
      try {
        console.log("Fetching loyalty account for user:", user?.id);

        const { data } = await axios.get(`${API_BASE}/loyalty/${user?.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`,
          },
        });

        console.log("Loyalty response:", data);
        return data.data;
      } catch (err) {
        console.error("LOYALTY ACCOUNT ERROR RESPONSE:", err.response);
        throw err;
      }
    },
    enabled: !!user?.id && !isStaff,
  });

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

  // Build filters
  const filters = useMemo(() => {
    const f = {};
    if (typeFilter !== "all") f.type = typeFilter;
    if (startDate) f.startDate = startDate.toISOString();
    if (endDate) f.endDate = endDate.toISOString();
    return f;
  }, [typeFilter, startDate, endDate]);

  const clearFilters = () => {
    setTypeFilter("all");
    setSearchQuery("");
    setStartDate(undefined);
    setEndDate(undefined);
  };

  // Data from backend
  const {
    transactions,
    summary,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePointsHistory({ accountId, filters });

  // Search filter
  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    return transactions.filter(
      (t) =>
        t.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [transactions, searchQuery]);

  // CSV export
  const handleExport = () => {
    const csv = [
      ["Date", "Type", "Points", "Note", "Expires"],
      ...filteredTransactions.map((t) => [
        format(new Date(t.created_at), "yyyy-MM-dd HH:mm"),
        t.type,
        t.points,
        t.note || "",
        t.expires_at ? format(new Date(t.expires_at), "yyyy-MM-dd") : "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `points-history-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Points History</CardTitle>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="p-3 rounded-lg bg-success/10 border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-success" />
              <span className="text-sm font-medium text-success">Total Earned</span>
            </div>
            <p className="text-2xl font-bold">
                {recentTransactions
                      ?.filter((t) => t.type === "earn")
                      .reduce((sum, t) => sum + t.points, 0)
                      .toLocaleString() || 0}
              {/* {summary.totalEarned.toLocaleString()} */}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-amber-500">Total Spent</span>
            </div>
            <p className="text-2xl font-bold">
              {summary.totalSpent.toLocaleString()}
            </p>
          </div>

          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium text-destructive">Expired</span>
            </div>
            <p className="text-2xl font-bold">
              {summary.totalExpired.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="earn">Earned</SelectItem>
              <SelectItem value="redemption">Redeemed</SelectItem>
              <SelectItem value="expiration">Expired</SelectItem>
              <SelectItem value="manual_adjustment">Adjusted</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Filters */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "MMM d, yyyy") : "Start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "MMM d, yyyy") : "End date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
            </PopoverContent>
          </Popover>

          {(typeFilter !== "all" || searchQuery || startDate || endDate) && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear
            </Button>
          )}
        </div>

        {/* Transaction List */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No transactions found
            </p>
          ) : (
            <>
              {filteredTransactions.map((transaction) => {
                const isPositive = transaction.points > 0;
                const isExpiration = transaction.type === "expiration";

                return (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      {/* Badge */}
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            isExpiration &&
                              "bg-destructive/10 text-destructive border-destructive/20",
                            isPositive &&
                              !isExpiration &&
                              "bg-success/10 text-success border-success/20",
                            !isPositive &&
                              !isExpiration &&
                              "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          )}
                        >
                          {transaction.type.replace("_", " ")}
                        </Badge>

                        {transaction.expires_at &&
                          new Date(transaction.expires_at) > new Date() && (
                            <span className="text-xs text-muted-foreground">
                              Expires{" "}
                              {format(new Date(transaction.expires_at), "MMM d, yyyy")}
                            </span>
                          )}
                      </div>

                      {/* Date */}
                      <p className="text-sm text-muted-foreground">
                        {format(
                          new Date(transaction.created_at),
                          "MMM d, yyyy 'at' h:mm a"
                        )}
                      </p>

                      {/* Note */}
                      {transaction.note && (
                        <p className="text-sm mt-1">{transaction.note}</p>
                      )}
                    </div>

                    {/* Points Amount */}
                    <div
                      className={cn(
                        "text-xl font-bold",
                        isExpiration
                          ? "text-destructive"
                          : isPositive
                          ? "text-success"
                          : "text-muted-foreground"
                      )}
                    >
                      {isPositive ? "+" : ""}
                      {transaction.points.toLocaleString()}
                    </div>
                  </div>
                );
              })}

              {/* Load More */}
              {hasNextPage && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </Button>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
