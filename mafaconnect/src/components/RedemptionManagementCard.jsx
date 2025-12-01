import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/Badge";
import { useState } from "react";
import { useRedemptionManagement } from "@/hooks/useRedemptionManagement";
import { RedemptionDetailsDialog } from "./RedemptionDetailsDialog";
import { format } from "date-fns";
import { Eye, CheckCircle, XCircle } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function RedemptionManagementCard() {
  const {
    redemptions,
    isLoading,
    markAsUsed,
    cancelRedemption,
    isMarkingUsed,
    isCancelling,
  } = useRedemptionManagement();

  const [selectedRedemption, setSelectedRedemption] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredRedemptions = redemptions?.filter((r) => {
    const matchesSearch =
      r.redemption_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reward?.title?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  const handleViewDetails = (redemption) => {
    setSelectedRedemption(redemption);
    setDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading redemptions...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Redemption Management</CardTitle>

          <div className="flex gap-4 mt-4">
            <Input
              placeholder="Search by code, customer, or reward..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-sm"
            />

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredRedemptions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No redemptions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRedemptions?.map((redemption) => (
                  <TableRow key={redemption.id}>
                    <TableCell className="font-mono text-sm">
                      {redemption.redemption_code}
                    </TableCell>

                    <TableCell>{redemption.customer?.name}</TableCell>
                    <TableCell>{redemption.reward?.title}</TableCell>

                    <TableCell>
                      {redemption.points_spent.toLocaleString()}
                    </TableCell>

                    <TableCell>
                      <Badge className={getStatusColor(redemption.status)}>
                        {redemption.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-sm">
                      {format(new Date(redemption.created_at), "PP")}
                    </TableCell>

                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(redemption)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {redemption.status === "active" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => markAsUsed(redemption.id)}
                              disabled={isMarkingUsed}
                            >
                              <CheckCircle className="h-4 w-4 text-success" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => cancelRedemption(redemption.id)}
                              disabled={isCancelling}
                            >
                              <XCircle className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RedemptionDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        redemption={selectedRedemption}
        onMarkUsed={markAsUsed}
        onCancel={cancelRedemption}
        isLoading={isMarkingUsed || isCancelling}
      />
    </>
  );
}
