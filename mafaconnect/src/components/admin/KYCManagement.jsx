import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Eye,
  User,
  Building2,
} from "lucide-react";
import { toast } from "sonner";

import {
  useKYCSubmissions,
  useApproveKYC,
  useRejectKYC,
} from "@/hooks/useKYCAdmin";
function parseJSON(value, fallback = null) {
  if (!value) return fallback;
  if (typeof value === "object") return value;

  try {
    return JSON.parse(value);
  } catch (e) {
    return fallback;
  }
}
export function KYCManagement() {
  const { data: kycList, isLoading } = useKYCSubmissions();
  const approveKYC = useApproveKYC();
  const rejectKYC = useRejectKYC();

  const [selectedUser, setSelectedUser] = useState(null);
  const [notes, setNotes] = useState("");
  const [viewingDoc, setViewingDoc] = useState(null);

  // const handleApprove = async (userId) => {
  //   await approveKYC.mutateAsync({ userId, notes });
  //   setSelectedUser(null);
  // };
  const handleApprove = async () => {
    try {
      await approveKYC.mutateAsync({
        userId: selectedUser.user_id,
        notes,
      });

      toast.success("KYC Approved");
      setSelectedUser(null);
    } catch {
      toast.error("Failed to approve KYC");
    }
  };

  // const handleReject = async (userId) => {
  //   if (!notes.trim()) {
  //     toast.error("Please provide rejection notes before rejecting.");
  //     return;
  //   }
  //   await rejectKYC.mutateAsync({ userId, notes });
  //   setSelectedUser(null);
  // };
  const handleReject = async () => {
    if (!notes.trim()) {
      return toast.error("Please provide a rejection reason");
    }

    try {
      await rejectKYC.mutateAsync({
        userId: selectedUser.user_id,
        notes,
      });

      toast.error("KYC Rejected");
      setSelectedUser(null);
    } catch {
      toast.error("Failed to reject KYC");
    }
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
          <CardDescription>
            Review and approve customer verification documents
          </CardDescription>
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
                    <TableCell>
                      {getStatusBadge(submission.kyc_status)}
                    </TableCell>

                    {/* Date */}
                    <TableCell>
                      {new Date(submission.createdAt).toLocaleDateString()}
                    </TableCell>

                    {/* Review Button */}
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const fixed = {
                            ...submission,
                            documents: parseJSON(submission.documents, []),
                            representative: parseJSON(
                              submission.representative,
                              {}
                            ),
                            directors: parseJSON(submission.directors, []),
                          };
                          setSelectedUser(fixed);
                        }}

                        // onClick={() => setSelectedUser(submission)}
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
      {/* <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>KYC Review</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">

              <div className="grid gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Customer Name
                  </p>
                  <p className="font-semibold">{selectedUser.user?.name}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Email
                  </p>
                  <p>{selectedUser.user?.email || "N/A"}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Phone
                  </p>
                  <p>{selectedUser.user?.phone || "N/A"}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Customer Type
                  </p>
                  <p className="flex items-center gap-2 capitalize">
                    {selectedUser.customer_type === "corporate" ? (
                      <>
                        <Building2 className="h-4 w-4" /> Corporate
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4" /> Individual
                      </>
                    )}
                  </p>
                </div>
              </div>
              {selectedUser.customer_type === "individual" && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    NIN
                  </p>
                  <p className="font-mono text-lg">
                    {selectedUser.representative?.nin || "Not provided"}
                  </p>

                  <p className="text-sm font-medium text-muted-foreground mt-4">
                    Photo
                  </p>
                  {selectedUser.documents?.map((doc, i) => (
                    <img
                      key={i}
                      src={doc.url}
                      alt="KYC"
                      className="w-40 h-40 rounded-lg border object-cover mt-2"
                    />
                  ))}
                </div>
              )}

              
              {selectedUser.customer_type === "corporate" && (
                <>
                  <div>
                    <p className="text-sm font-medium mb-2">CAC Documents</p>
                    {selectedUser.documents?.map((doc, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        onClick={() => setViewingDoc(doc)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {doc.fileName}
                      </Button>
                    ))}
                  </div>

             
                  <div>
                    <p className="text-sm font-medium mb-2">Directors</p>
                    {(selectedUser.directors || []).map((dir, i) => (
                      <Card key={i} className="p-3 mb-2">
                        <p className="font-medium">{dir.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          NIN: {dir.nin}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {dir.email} • {dir.phone}
                        </p>
                      </Card>
                    ))}
                  </div>

                 
                  <div>
                    <p className="text-sm font-medium mb-2">
                      Company Representative
                    </p>
                    <Card className="p-3">
                      <p className="font-medium">
                        {selectedUser.representative?.full_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        NIN: {selectedUser.representative?.nin}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.representative?.email} •{" "}
                        {selectedUser.representative?.phone}
                      </p>
                    </Card>
                  </div>
                </>
              )}

             
              <div>
                <label className="text-sm font-medium">Review Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add review notes..."
                  className="mt-2"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 mt-4">
            <Button variant="destructive" onClick={handleReject}>
              <XCircle className="h-4 w-4 mr-2" /> Reject
            </Button>

            <Button
              onClick={handleApprove}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" /> Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}



<Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
  <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        KYC Review {selectedUser?.user?.name ? `– ${selectedUser.user.name}` : ""}
      </DialogTitle>
    </DialogHeader>

    {selectedUser && (
      <div className="space-y-6">
        {/* BASIC USER DETAILS */}
        <div className="grid gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Customer Name</p>
            <p className="font-semibold">
              {selectedUser.user?.name || `User ${selectedUser.user_id}`}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p>{selectedUser.user?.email || "N/A"}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Phone</p>
            <p>{selectedUser.user?.phone || "N/A"}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-muted-foreground">Customer Type</p>
            <p className="flex items-center gap-2 capitalize">
              {selectedUser.customer_type === "corporate" ? (
                <>
                  <Building2 className="h-4 w-4" /> Corporate
                </>
              ) : (
                <>
                  <User className="h-4 w-4" /> Individual
                </>
              )}
            </p>
          </div>
        </div>

        {/* ========= INDIVIDUAL VIEW ========= */}
        {selectedUser.customer_type === "individual" && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">NIN</p>
            <p className="font-mono text-lg">
              {selectedUser.representative?.nin || "Not provided"}
            </p>

            <p className="text-sm font-medium text-muted-foreground mt-4 mb-1">
              Photo
            </p>
            {Array.isArray(selectedUser.documents) &&
            selectedUser.documents.length > 0 ? (
              <img
                src={selectedUser.documents[0].url}
                alt="KYC"
                className="w-40 h-40 rounded-lg border object-cover mt-2"
              />
            ) : (
              <p className="text-xs text-muted-foreground">No photo uploaded</p>
            )}
          </div>
        )}

        {/* ========= CORPORATE VIEW ========= */}
        {selectedUser.customer_type === "corporate" && (
          <>
            {/* CAC DOCUMENTS */}
            {/* <div>
              <p className="text-sm font-medium mb-2">
                CAC Documents ({selectedUser.documents?.length || 0})
              </p>

              {Array.isArray(selectedUser.documents) &&
              selectedUser.documents.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedUser.documents.map((doc, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="sm"
                      onClick={() => setViewingDoc(doc)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {doc.fileName || `Document ${i + 1}`}
                    </Button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">
                  No CAC documents uploaded
                </p>
              )}
            </div> */}
{/* CAC DOCUMENTS */}
<div>
  <p className="text-sm font-medium mb-2">CAC Documents</p>

  {Array.isArray(selectedUser.documents) && selectedUser.documents.length > 0 ? (
    selectedUser.documents.map((doc, i) => (
      <div key={i} className="flex items-center gap-3 mb-2">

        {/* If PDF → button to open */}
        {doc.type === "application/pdf" ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(doc.url, "_blank")}
          >
            📄 View PDF ({doc.fileName})
          </Button>
        ) : (
          // If image → show preview
          <img
            src={doc.url}
            alt={doc.fileName}
            className="w-32 h-32 object-cover rounded-md border"
          />
        )}

      </div>
    ))
  ) : (
    <p className="text-muted-foreground text-sm">No documents uploaded.</p>
  )}
</div>

            {/* DIRECTORS */}
            <div>
              <p className="text-sm font-medium mb-2">
                Directors ({selectedUser.directors?.length || 0})
              </p>

              {/* {Array.isArray(selectedUser.directors) &&
              selectedUser.directors.length > 0 ? (
                selectedUser.directors.map((dir, i) => (
                  <Card key={i} className="p-3 mb-2">
                    <div className="flex items-start gap-3">
                      {dir.photo && (
                        <img
                          src={dir.photo}
                          alt={dir.full_name}
                          className="w-14 h-14 rounded-md object-cover border"
                        />
                      )}
                      <div>
                        <p className="font-medium">{dir.full_name}</p>
                        <p className="text-sm text-muted-foreground">
                          NIN: {dir.nin || "N/A"}
                        </p>
                        {(dir.email || dir.phone) && (
                          <p className="text-sm text-muted-foreground">
                            {dir.email || "No email"} • {dir.phone || "No phone"}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  No directors data saved
                </p>
              )} */}
              {Array.isArray(selectedUser.directors) && selectedUser.directors.length > 0 ? (
  selectedUser.directors.map((dir, i) => (
    <Card key={i} className="p-3 mb-2">
      <p className="font-medium">{dir.full_name}</p>
      <p className="text-sm text-muted-foreground">NIN: {dir.nin}</p>
      <p className="text-sm text-muted-foreground">
        {dir.email} • {dir.phone}
      </p>

      {dir.photo && (
        <img
          src={dir.photo}
          alt={`Director ${dir.full_name}`}
          className="w-32 h-32 rounded-md border object-cover mt-2"
        />
      )}
    </Card>
  ))
) : (
  <p className="text-sm text-muted-foreground">No directors uploaded.</p>
)}

            </div>

            {/* REP INFO (CORPORATE) */}
            <div>
              <p className="text-sm font-medium mb-2">Company Representative</p>
              <Card className="p-3">
                <p className="font-medium">
                  {selectedUser.representative?.full_name || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  NIN: {selectedUser.representative?.nin || "N/A"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedUser.representative?.email || "No email"} •{" "}
                  {selectedUser.representative?.phone || "No phone"}
                </p>
              </Card>
            </div>
          </>
        )}

        {/* NOTES */}
        <div>
          <label className="text-sm font-medium">Review Notes</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add review notes..."
            className="mt-2"
          />
        </div>

        {/* APPROVE / REJECT BUTTONS */}
        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button variant="destructive" onClick={handleReject}>
            <XCircle className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button onClick={handleApprove}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>

{/* DOCUMENT VIEWER OVERLAY */}
{viewingDoc && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="bg-background p-4 rounded-lg w-[90%] max-w-4xl h-[90vh] flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold truncate">
          {viewingDoc.fileName || "Document"}
        </h2>
        <Button variant="outline" size="sm" onClick={() => setViewingDoc(null)}>
          Close
        </Button>
      </div>

      <div className="flex-1 border rounded-md overflow-hidden">
        {viewingDoc.type?.startsWith("image/") ? (
          <img
            src={viewingDoc.url}
            alt={viewingDoc.fileName || "Document"}
            className="w-full h-full object-contain bg-black"
          />
        ) : (
          <iframe
            src={viewingDoc.url}
            title={viewingDoc.fileName || "Document viewer"}
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  </div>
)}


      {/* Document Viewer */}
      {/* {viewingDoc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-[80%] max-w-3xl">
            <h2 className="text-lg font-semibold">{viewingDoc.type}</h2>
            <iframe src={viewingDoc.url} className="w-full h-[70vh]" />
            <div className="mt-3 text-right">
              <Button onClick={() => setViewingDoc(null)}>Close</Button>
            </div>
          </div>
        </div>
      )} */}
    </>
  );
}
