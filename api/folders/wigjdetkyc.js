import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useKYCStatus } from "@/hooks/useKYC";
import { useNavigate } from "react-router-dom";

export default function KYCStatusWidget() {
  const { data: kycStatus, isLoading, isError } = useKYCStatus();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            KYC Status
          </CardTitle>
          <CardDescription>Loading your verification status...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (isError || !kycStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            KYC Status
          </CardTitle>
          <CardDescription>
            We couldn&apos;t load your KYC status. Please try again.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { kyc_status, customer_type, rejection_reason } = kycStatus;

  let icon = <Shield className="w-4 h-4" />;
  let badgeVariant = "outline";
  let titleText = "KYC Status";
  let descText = "Manage your verification status.";

  if (kyc_status === "approved") {
    icon = <ShieldCheck className="w-4 h-4 text-green-500" />;
    badgeVariant = "success";
    titleText = "KYC Approved";
    descText = `Your ${
      customer_type === "corporate" ? "corporate" : "individual"
    } KYC is fully verified.`;
  } else if (kyc_status === "pending") {
    icon = <Clock className="w-4 h-4 text-yellow-500" />;
    badgeVariant = "outline";
    titleText = "KYC Pending";
    descText =
      "Your documents have been received and are currently under review.";
  } else if (kyc_status === "rejected") {
    icon = <ShieldAlert className="w-4 h-4 text-red-500" />;
    badgeVariant = "destructive";
    titleText = "KYC Rejected";
    descText =
      rejection_reason ||
      "Your KYC was rejected. Please review and submit again.";
  } else {
    // no KYC yet
    icon = <Shield className="w-4 h-4 text-muted-foreground" />;
    badgeVariant = "outline";
    titleText = "KYC Required";
    descText =
      "You have not completed KYC. Please submit your verification details.";
  }

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-2">
          {icon}
          <CardTitle className="flex items-center gap-2">
            {titleText}
            <Badge variant={badgeVariant}>{kyc_status || "required"}</Badge>
          </CardTitle>
        </div>

        <CardDescription>{descText}</CardDescription>

        <div className="pt-2">
          <Button size="sm" onClick={() => navigate("/kyc-onboarding")}>
            {kyc_status === "approved" ? "View KYC" : "Complete KYC"}
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
}
