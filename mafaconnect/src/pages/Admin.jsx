import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Link } from "react-router-dom";

import {
  Shield,
  Users,
  Settings,
  FileText,
  Database,
  Receipt,
  ArrowRight,
  Wrench,
  CheckSquare,
  Crown,
} from "lucide-react";

import { toast } from "sonner";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";

// Admin components
import { UserManagement } from "@/components/admin/UserManagement";
import { KYCManagement } from "@/components/admin/KYCManagement";
import { SystemSettings } from "@/components/admin/SystemSettings";
import { AuditLogViewer } from "@/components/admin/AuditLogViewer";
import BulkOperations from "@/components/admin/BulkOperations";
import  SuperuserManagement from "@/components/admin/SuperuserManagement";

export default function Admin() {
  const [isBackfilling, setIsBackfilling] = useState(false);

  const { user, isAdmin, isSuperuser } = useAuth();

  // 🔐 Hard guard (extra safety)
  if (!isAdmin && !isSuperuser) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        You do not have permission to view this page.
      </div>
    );
  }

  // 🔧 Backfill invoices (Node backend)
  const handleBackfillInvoices = async () => {
    setIsBackfilling(true);
    try {
      const response = await apiPost("/api/admin/backfill-invoices");

      if (response.error) {
        throw new Error(response.error);
      }

      const results = response.data?.results || [];

      toast.success(`Processed ${results.length} orders`, {
        description: results
          .map((r) =>
            r.status === "success"
              ? `${r.order_number}: ${r.invoice_number}`
              : `${r.order_number}: ${r.error}`
          )
          .join("\n"),
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to backfill invoices", {
        description: err.message || "Unknown error",
      });
    } finally {
      setIsBackfilling(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Shield className="h-10 w-10 text-primary" />
          Admin Panel
        </h1>
        <p className="text-muted-foreground">
          Manage users, system configuration, and platform operations
        </p>
      </div>

      {/* ================= QUICK ACCESS ================= */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Unified Transaction System
          </CardTitle>
          <CardDescription>
            Sales, invoices, and quotes managed in one place
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="text-sm list-disc ml-4 space-y-1 text-muted-foreground">
            <li>Cash & credit sales</li>
            <li>Automatic invoice generation</li>
            <li>Location-based stock checks</li>
            <li>Quotes and payment tracking</li>
          </ul>

          <Link to="/transactions">
            <Button className="mt-4">
              Go to Transactions <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* ================= TABS ================= */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList
          className={`grid w-full grid-cols-2 ${
            isSuperuser ? "lg:grid-cols-7" : "lg:grid-cols-6"
          }`}
        >
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users
          </TabsTrigger>

          <TabsTrigger value="kyc">
            <CheckSquare className="h-4 w-4 mr-2" />
            KYC
          </TabsTrigger>

          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>

          <TabsTrigger value="audit">
            <FileText className="h-4 w-4 mr-2" />
            Audit Logs
          </TabsTrigger>

          <TabsTrigger value="bulk">
            <Database className="h-4 w-4 mr-2" />
            Bulk Ops
          </TabsTrigger>

          <TabsTrigger value="tools">
            <Wrench className="h-4 w-4 mr-2" />
            Tools
          </TabsTrigger>

          {isSuperuser && (
            <TabsTrigger value="superuser">
              <Crown className="h-4 w-4 mr-2 text-amber-500" />
              Superuser
            </TabsTrigger>
          )}
        </TabsList>

        {/* ================= CONTENT ================= */}
        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="kyc">
          <KYCManagement />
        </TabsContent>

        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogViewer />
        </TabsContent>

        <TabsContent value="bulk">
          <BulkOperations />
        </TabsContent>

        {/* ================= TOOLS ================= */}
        <TabsContent value="tools">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Invoice Tools
              </CardTitle>
              <CardDescription>
                Maintenance tools for invoices and orders
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Button
                onClick={handleBackfillInvoices}
                disabled={isBackfilling}
                variant="outline"
              >
                {isBackfilling ? "Processing..." : "Backfill Invoices"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= SUPERUSER ================= */}
        {isSuperuser && (
          <TabsContent value="superuser">
            <SuperuserManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}


// import React, { useState } from "react";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/Card";
// import { Button } from "@/components/ui/Button";

// import { Link } from "react-router-dom";
// // import { UserManagement } from "@/components/admin/UserManagement";
// import { SystemSettings } from "@/components/admin/SystemSettings";
// import { AuditLogViewer } from "@/components/admin/AuditLogViewer";

// // import BulkOperations from "@/components/admin/BulkOperations";
// import BulkOperations from "@/components/admin/BulkOperations";
// // import BulkOperations from "/src/components/admin/BulkOperations.jsx";
// import { UserManagement } from "@/components/admin/UserManagement";
// import { KYCManagement } from "@/components/admin/KYCManagement";
// import {
//   Shield,
//   Users,
//   Settings,
//   FileText,
//   Database,
//   Receipt,
//   ArrowRight,
//   Wrench,
//   CheckSquare,
// } from "lucide-react";
// import { toast } from "sonner";
// import { apiPost } from "@/lib/api"; // ✅ using Node backend API instead of Supabase

// export default function Admin() {
//   console.log('...')
//   const [isBackfilling, setIsBackfilling] = useState(false);

//   // ✅ Replace Supabase function call with backend API
//   const handleBackfillInvoices = async () => {
//     setIsBackfilling(true);
//     try {
//       const response = await apiPost("/api/admin/backfill-invoices");
//       if (response.error) throw new Error(response.error);
//       const results = response.data?.results || [];
//       toast.success(`Successfully processed ${results.length} orders`, {
//         description: results
//           .map((r) =>
//             r.status === "success"
//               ? `${r.order_number}: ${r.invoice_number}`
//               : `${r.order_number}: ${r.error}`
//           )
//           .join("\n"),
//       });
//     } catch (error) {
//       console.error("Error backfilling invoices:", error);
//       toast.error("Failed to backfill invoices", {
//         description: error.message || "Unknown error occurred",
//       });
//     } finally {
//       setIsBackfilling(false);
//     }
//   };

//   return (
//     <div className="space-y-8">
//       <div>
//         <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-3">
//           <Shield className="h-10 w-10 text-primary" />
//           Admin Panel
//         </h1>
//         <p className="text-muted-foreground">
//           Manage users, configure system settings, and monitor activities
//         </p>
//       </div>

//       {/* ✅ Quick Access Card */}
//       <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2">
//             <Receipt className="h-5 w-5" />
//             Unified Transaction System
//           </CardTitle>
//           <CardDescription>
//             Sales, invoices, and quotes now managed in one place with
//             multi-location support
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-2">
//             <p className="text-sm text-muted-foreground">
//               The new Transactions system merges sales and invoices with
//               powerful features:
//             </p>
//             <ul className="text-sm space-y-1 ml-4 list-disc text-muted-foreground">
//               <li>Unified workflow for cash sales, credit sales, and invoices</li>
//               <li>Location-based stock validation and management</li>
//               <li>Automatic invoice numbering and payment tracking</li>
//               <li>Support for quotes and payment terms</li>
//             </ul>
//             <Link to="/transactions">
//               <Button className="mt-4">
//                 Go to Transactions <ArrowRight className="ml-2 h-4 w-4" />
//               </Button>
//             </Link>
//           </div>
//         </CardContent>
//       </Card>

//       {/* ✅ Tabs Section */}
//       <Tabs defaultValue="users" className="space-y-6">
//         <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
//           <TabsTrigger value="users" className="gap-2">
//             <Users className="h-4 w-4" />
//             Users
//           </TabsTrigger>
//           <TabsTrigger value="kyc" className="gap-2">
//             <CheckSquare className="h-4 w-4" />
//             KYC
//           </TabsTrigger>
//           <TabsTrigger value="settings" className="gap-2">
//             <Settings className="h-4 w-4" />
//             Settings
//           </TabsTrigger>
//           <TabsTrigger value="audit" className="gap-2">
//             <FileText className="h-4 w-4" />
//             Audit Logs
//           </TabsTrigger>
//           <TabsTrigger value="bulk" className="gap-2">
//             <Database className="h-4 w-4" />
//             Bulk Ops
//           </TabsTrigger>
//           <TabsTrigger value="tools" className="gap-2">
//             <Wrench className="h-4 w-4" />
//             Tools
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="users">
//           <UserManagement />
//         </TabsContent>

//         <TabsContent value="kyc">
//           <KYCManagement />
//         </TabsContent>

//         <TabsContent value="settings">
//           <SystemSettings />
//         </TabsContent>

//         <TabsContent value="audit">
//           <AuditLogViewer />
//         </TabsContent>

//         <TabsContent value="bulk">
//           <BulkOperations />
//         </TabsContent>

//         {/* ✅ Tools tab */}
//         <TabsContent value="tools">
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Wrench className="h-5 w-5" />
//                 Invoice Generation Tools
//               </CardTitle>
//               <CardDescription>
//                 Administrative tools for managing invoices and orders
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="p-4 border rounded-lg space-y-3 bg-card">
//                 <div className="flex items-start gap-3">
//                   <Receipt className="h-5 w-5 text-primary mt-0.5" />
//                   <div className="flex-1">
//                     <h3 className="font-semibold">Backfill Missing Invoices</h3>
//                     <p className="text-sm text-muted-foreground mb-3">
//                       Generate invoices for paid orders that don’t have invoices
//                       yet. This will create sales records, invoice records, and
//                       notify customers.
//                     </p>
//                     <Button
//                       onClick={handleBackfillInvoices}
//                       disabled={isBackfilling}
//                       variant="outline"
//                     >
//                       {isBackfilling ? "Processing..." : "Backfill Invoices"}
//                     </Button>
//                   </div>
//                 </div>
//               </div>

//               <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
//                 <p className="font-semibold mb-1">Note:</p>
//                 <p>
//                   This tool is useful when the invoice generation system was
//                   updated and previous paid orders need their invoices created
//                   retroactively.
//                 </p>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
