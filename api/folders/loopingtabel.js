import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Loader2, CheckCircle, XCircle, Eye, User, Building2 } from "lucide-react";
import { toast } from "sonner";

import { 
  useKYCSubmissions, 
  useApproveKYC, 
  useRejectKYC 
} from "@/hooks/useKYCAdmin";

export function KYCManagement() {
  const { data: kycList, isLoading } = useKYCSubmissions();
  const approveKYC = useApproveKYC();
  const rejectKYC = useRejectKYC();

  const [selectedUser, setSelectedUser] = useState(null);
  const [notes, setNotes] = useState("");
  const [viewingDoc, setViewingDoc] = useState(null);

  const handleApprove = async (userId) => {
    await approveKYC.mutateAsync({ userId, notes });
    setSelectedUser(null);
  };

  const handleReject = async (userId) => {
    if (!notes.trim()) {
      toast.error("Please provide rejection notes before rejecting.");
      return;
    }
    await rejectKYC.mutateAsync({ userId, notes });
    setSelectedUser(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification Management</CardTitle>
          <CardDescription>Review and approve customer verification documents</CardDescription>
        </CardHeader>

        <CardContent>
          {kycList?.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No pending KYC verifications
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              {/* <TableBody>
                {kycList?.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {user.representative?.name || user.company_name || `User ${user.user_id}`}
                    </TableCell>

                    <TableCell>
                      {user.customer_type === "corporate" ? (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" /> Corporate
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" /> Individual
                        </div>
                      )}
                    </TableCell>

                    <TableCell>{getStatusBadge(user.kyc_status)}</TableCell>

                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>

                    <TableCell>
                      <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                        <Eye className="h-4 w-4 mr-1" /> Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody> */}
              <TableBody>
  {kycList?.map((submission, index) => (
    <TableRow key={index}>
      
      {/* Customer Name */}
      <TableCell className="font-medium">
        {submission.user?.name || `User ${submission.user_id}`}
      </TableCell>

      {/* Customer Type */}
      <TableCell>
        {submission.customer_type === "corporate" ? (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Corporate
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" /> Individual
          </div>
        )}
      </TableCell>

      {/* Status */}
      <TableCell>{getStatusBadge(submission.kyc_status)}</TableCell>

      {/* Date */}
      <TableCell>
        {new Date(submission.createdAt).toLocaleDateString()}
      </TableCell>

      {/* Review Button */}
      <TableCell>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedUser(submission)}
        >
          <Eye className="h-4 w-4 mr-1" /> Review
        </Button>
      </TableCell>

    </TableRow>
  ))}
</TableBody>

            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Review</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <>
              <p className="font-medium text-lg mb-2">
                {selectedUser.customer_type === "individual" 
                  ? selectedUser.representative?.nin 
                  : selectedUser.company_name}
              </p>

              {/* DOCUMENT LIST */}
              <div>
                <p className="text-sm font-medium mb-2">Documents</p>
                {selectedUser.documents?.map((doc, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingDoc(doc)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> {doc.type}
                  </Button>
                ))}
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium">Review Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this review..."
                  className="mt-2"
                />
              </div>

              <DialogFooter className="gap-2 mt-4">
                <Button variant="destructive" onClick={() => handleReject(selectedUser.user_id)}>
                  <XCircle className="h-4 w-4 mr-2" /> Reject
                </Button>
                <Button onClick={() => handleApprove(selectedUser.user_id)}>
                  <CheckCircle className="h-4 w-4 mr-2" /> Approve
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Document Viewer */}
      {viewingDoc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-[80%] max-w-3xl">
            <h2 className="text-lg font-semibold">{viewingDoc.type}</h2>
            <iframe src={viewingDoc.url} className="w-full h-[70vh]" />
            <div className="mt-3 text-right">
              <Button onClick={() => setViewingDoc(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
