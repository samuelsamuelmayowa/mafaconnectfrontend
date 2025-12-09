import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  ShieldCheck,
  ShieldAlert,
  User,
  Building2,
  Search,
  Loader2,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";

import {
  useKYCSubmissions,
  useApproveKYC,
  useRejectKYC,
} from "@/hooks/useKYC";
import { toast } from "sonner";

function statusConfig(status) {
  switch (status) {
    case "approved":
      return { label: "Approved", variant: "success" };
    case "rejected":
      return { label: "Rejected", variant: "destructive" };
    case "pending":
    default:
      return { label: "Pending", variant: "outline" };
  }
}

export default function AdminKYCDashboard() {
  const { data: submissions = [], isLoading } = useKYCSubmissions();
  const approveKYC = useApproveKYC();
  const rejectKYC = useRejectKYC();

  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [rejectNotes, setRejectNotes] = useState("");

  const filtered = submissions.filter((s) => {
    const term = search.toLowerCase();
    return (
      s.name?.toLowerCase().includes(term) ||
      s.customer_type?.toLowerCase().includes(term) ||
      String(s.user_id || "").includes(term)
    );
  });

  const handleApprove = async (submission) => {
    try {
      await approveKYC.mutateAsync({
        userId: submission.user_id,
        notes: "Approved by admin",
      });
      toast.success("KYC approved");
    } catch (e) {
      toast.error("Failed to approve");
    }
  };

  const handleReject = async (submission) => {
    if (!rejectNotes.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    try {
      await rejectKYC.mutateAsync({
        userId: submission.user_id,
        notes: rejectNotes,
      });
      toast.success("KYC rejected");
      setRejectNotes("");
    } catch (e) {
      toast.error("Failed to reject");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>KYC Submissions</CardTitle>
            <CardDescription>
              Review and manage individual and corporate KYC requests.
            </CardDescription>
          </div>

          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2 border rounded-md px-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                placeholder="Search by name, type, or user id..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No KYC submissions found.
            </p>
          ) : (
            <div className="space-y-2">
              {filtered.map((s) => {
                const cfg = statusConfig(s.kyc_status);
                const isCorporate = s.customer_type === "corporate";

                return (
                  <Card
                    key={s.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between p-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {isCorporate ? (
                          <Building2 className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                        <p className="font-medium">
                          {s.name || `User #${s.user_id}`}
                        </p>
                        <Badge variant="outline">
                          {isCorporate ? "Corporate" : "Individual"}
                        </Badge>
                        <Badge variant={cfg.variant}>{cfg.label}</Badge>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        User ID: {s.user_id} • Submitted:{" "}
                        {s.created_at
                          ? new Date(s.created_at).toLocaleString()
                          : "N/A"}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-3 md:mt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelected(s)}
                      >
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleApprove(s)}
                        disabled={approveKYC.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                        Approve
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelected(s)}
                      >
                        <XCircle className="w-4 h-4 mr-1 text-red-500" />
                        Reject
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail / Reject Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              KYC Details – {selected?.name || `User #${selected?.user_id}`}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">
                  {selected.customer_type === "corporate"
                    ? "Corporate"
                    : "Individual"}
                </Badge>
                <Badge variant={statusConfig(selected.kyc_status).variant}>
                  {statusConfig(selected.kyc_status).label}
                </Badge>
              </div>

              <Separator />

              {/* Representative */}
              {selected.representative && (
                <div>
                  <h3 className="font-semibold mb-2">Representative</h3>
                  <p className="text-sm">
                    <span className="font-medium">
                      {selected.representative.full_name}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    NIN: {selected.representative.nin}
                    {selected.representative.email &&
                      ` • ${selected.representative.email}`}
                  </p>
                </div>
              )}

              {/* Directors */}
              {Array.isArray(selected.directors) &&
                selected.directors.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Directors</h3>
                    <div className="space-y-2 max-h-40 overflow-auto">
                      {selected.directors.map((d, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-sm border rounded-md px-3 py-1"
                        >
                          <div>
                            <p className="font-medium">{d.full_name}</p>
                            <p className="text-xs text-muted-foreground">
                              NIN: {d.nin}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Documents */}
              {Array.isArray(selected.documents) &&
                selected.documents.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Documents</h3>
                    <div className="space-y-1 max-h-40 overflow-auto">
                      {selected.documents.map((doc, i) => (
                        <a
                          key={i}
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-primary underline flex items-center gap-2"
                        >
                          📄 {doc.category || "Document"} – {doc.file_name}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              {/* Rejection Notes Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Rejection Reason (optional for approve, required for reject)
                </label>
                <textarea
                  className="w-full border rounded-md p-2 text-sm"
                  rows={3}
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setSelected(null)}
                  size="sm"
                >
                  Close
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleReject(selected)}
                  disabled={rejectKYC.isPending}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleApprove(selected)}
                  disabled={approveKYC.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-1" /> Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
