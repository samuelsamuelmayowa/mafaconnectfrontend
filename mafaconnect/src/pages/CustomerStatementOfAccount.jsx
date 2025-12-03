import React from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle
} from "@/components/ui/Card";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Loader2, Download, FileText } from "lucide-react";
import { format } from "date-fns";

import logoImage from "@/assets/mafa-logo.png";
import { toast } from "sonner";

const API_BASE = import.meta.env.VITE_HOME_OO;

export default function CustomerStatementOfAccount() {
  const { user } = useAuth();

  // ================================
  // DATE FILTER STATES
  // ================================
  const [dateFrom, setDateFrom] = React.useState(
    format(new Date(new Date().getFullYear(), 0, 1), "yyyy-MM-dd")
  );
  const [dateTo, setDateTo] = React.useState(
    format(new Date(), "yyyy-MM-dd")
  );

  // ================================
  // GET CUSTOMER PROFILE (/auth/me)
  // ================================
  const { data: customer, isLoading: loadingProfile } = useQuery({
    queryKey: ["customer-profile", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const res = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.data;
    }
  });

  // ================================
  // GET STATEMENT DATA
  // ================================
  const { data: statementData, isLoading } = useQuery({
    queryKey: ["customer-statement", user?.id, dateFrom, dateTo],
    enabled: !!user?.id,
    queryFn: async () => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const res = await axios.get(
        `${API_BASE}/customer/statement?from=${dateFrom}&to=${dateTo}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data.data;
    }
  });

  // ================================
  // Convert Logo to Base64
  // ================================
  const convertToBase64 = async (url) => {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () =>
        resolve(reader.result.split(",")[1]);
      reader.readAsDataURL(blob);
    });
  };

  // ================================
  // DOWNLOAD HTML STATEMENT FILE
  // ================================
  const handleDownload = async () => {
    if (!statementData || !customer) return;

    const logoBase64 = await convertToBase64(logoImage);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <title>Statement of Account</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; }
          .header { text-align: right; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #16a34a; color: white; padding: 10px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
          .totals { margin-top: 30px; text-align: right; }
          .total-row { font-weight: bold; border-top: 2px solid #000; padding-top: 10px; font-size: 18px; }
        </style>
      </head>

      <body>
        <div class="header">
          <img src="data:image/png;base64,${logoBase64}" height="70" />
          <h1 style="color:#16a34a;">MAFA Rice Mill Limited</h1>
          <p>Kano, Nigeria • +234 904 028 8888 • sales@mafagroup.org</p>
          <h2>Statement of Account</h2>
          <p>Period: ${format(new Date(dateFrom), "MMM d, yyyy")} – ${format(new Date(dateTo), "MMM d, yyyy")}</p>
        </div>

        <h3>Customer Information</h3>
        <p><strong>Name:</strong> ${customer.name}</p>
        <p><strong>Account Number:</strong> ${customer.account_number || "N/A"}</p>
        <p><strong>Email:</strong> ${customer.email}</p>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Reference</th>
              <th style="text-align:right;">Debit</th>
              <th style="text-align:right;">Credit</th>
              <th style="text-align:right;">Balance</th>
            </tr>
          </thead>
          <tbody>
            ${statementData.transactions
              .map(
                (t) => `
                  <tr>
                    <td>${format(new Date(t.date), "MMM d, yyyy")}</td>
                    <td>${t.description}</td>
                    <td>${t.reference}</td>
                    <td style="text-align:right;">${t.debit ? `₦${t.debit.toLocaleString()}` : "-"}</td>
                    <td style="text-align:right;">${t.credit ? `₦${t.credit.toLocaleString()}` : "-"}</td>
                    <td style="text-align:right;">₦${t.balance.toLocaleString()}</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>

        <div class="totals">
          <div>Opening Balance: ₦${statementData.summary.openingBalance.toLocaleString()}</div>
          <div>Total Charges: ₦${statementData.summary.totalCharges.toLocaleString()}</div>
          <div>Total Payments: ₦${statementData.summary.totalPayments.toLocaleString()}</div>
          <div class="total-row">Closing Balance: ₦${statementData.summary.closingBalance.toLocaleString()}</div>
        </div>

        <p style="text-align:center;margin-top:40px;">
          Generated on ${format(new Date(), "MMM d, yyyy h:mm a")}
        </p>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Statement_${customer.account_number}_${format(new Date(), "yyyy-MM-dd")}.html`;
    a.click();

    URL.revokeObjectURL(url);
    toast.success("Statement downloaded!");
  };

  // ================================
  // LOADING SPINNER
  // ================================
  if (loadingProfile || isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  // ================================
  // UI SECTION (Your UI preserved)
  // ================================
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold">Statement of Account</h1>
        <p className="text-muted-foreground">View your account history</p>
      </div>

      {/* Date Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Select Date Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label>From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <Label>To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={handleDownload}>
                <Download className="mr-2 w-4 h-4" /> Download Statement
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Info */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-muted-foreground text-sm">Name</p>
              <p className="font-medium">{customer.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Account Number</p>
              <p className="font-medium">{customer.account_number || "N/A"}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Email</p>
              <p className="font-medium">{customer.email}</p>
            </div>
            {customer.phone && (
              <div>
                <p className="text-muted-foreground text-sm">Phone</p>
                <p className="font-medium">{customer.phone}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card> */}
{/* Customer Info */}
<Card>
  <CardHeader>
    <CardTitle>Customer Information</CardTitle>
  </CardHeader>

  <CardContent>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-muted-foreground text-sm">Name</p>
        <p className="font-medium">{customer?.name || "N/A"}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-sm">Account Number</p>
        <p className="font-medium">{customer?.account_number || "N/A"}</p>
      </div>
      <div>
        <p className="text-muted-foreground text-sm">Email</p>
        <p className="font-medium">{customer?.email || "N/A"}</p>
      </div>

      {customer?.phone && (
        <div>
          <p className="text-muted-foreground text-sm">Phone</p>
          <p className="font-medium">{customer?.phone}</p>
        </div>
      )}
    </div>
  </CardContent>
</Card>

      {/* Statement Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Date</th>
                  <th className="p-2 text-left">Description</th>
                  <th className="p-2 text-left">Reference</th>
                  <th className="p-2 text-right">Debit</th>
                  <th className="p-2 text-right">Credit</th>
                  <th className="p-2 text-right">Balance</th>
                </tr>
              </thead>

              <tbody>
                {statementData.transactions.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-muted-foreground">
                      <FileText className="w-10 h-10 mx-auto opacity-50" />
                      <p>No transactions found</p>
                    </td>
                  </tr>
                ) : (
                  statementData.transactions.map((t, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">
                        {t.date ? format(new Date(t.date), "MMM d, yyyy") : "N/A"}
                      </td>
                      <td className="p-2">{t.description}</td>
                      <td className="p-2">{t.reference}</td>
                      <td className="p-2 text-right">
                        {t.debit ? `₦${t.debit.toLocaleString()}` : "-"}
                      </td>
                      <td className="p-2 text-right text-success">
                        {t.credit ? `₦${t.credit.toLocaleString()}` : "-"}
                      </td>
                      <td className="p-2 text-right font-semibold">
                        ₦{t.balance.toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Opening Balance</span>
              <strong>₦{statementData.summary.openingBalance.toLocaleString()}</strong>
            </div>

            <div className="flex justify-between">
              <span>Total Charges</span>
              <strong>₦{statementData.summary.totalCharges.toLocaleString()}</strong>
            </div>

            <div className="flex justify-between">
              <span>Total Payments</span>
              <strong className="text-success">
                ₦{statementData.summary.totalPayments.toLocaleString()}
              </strong>
            </div>

            <div className="flex justify-between border-t pt-2 text-lg">
              <span className="font-bold">Closing Balance</span>
              <span className="font-bold">
                ₦{statementData.summary.closingBalance.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// import React from "react";
// import axios from "axios";
// import { useAuth } from "@/hooks/useAuth";
// import { useQuery } from "@tanstack/react-query";

// import {
//   Card,
//   CardHeader,
//   CardContent,
//   CardTitle
// } from "@/components/ui/Card";

// import { Button } from "@/components/ui/Button";
// import { Input } from "@/components/ui/Input";
// import { Label } from "@/components/ui/Label";
// import { Loader2, Download, FileText } from "lucide-react";
// import { format } from "date-fns";

// import logoImage from "@/assets/mafa-logo.png";
// import { toast } from "sonner";

// const API_BASE = import.meta.env.VITE_HOME_OO;

// export default function CustomerStatementOfAccount() {
//   const { user } = useAuth();

//   const [dateFrom, setDateFrom] = React.useState(
//     format(new Date(new Date().getFullYear(), 0, 1), "yyyy-MM-dd")
//   );
//   const [dateTo, setDateTo] = React.useState(
//     format(new Date(), "yyyy-MM-dd")
//   );

//   // ================================
//   // GET CUSTOMER PROFILE (auth/me)
//   // ================================
//   const { data: customer, isLoading: loadingProfile } = useQuery({
//     queryKey: ["customer-profile", user?.id],
//     enabled: !!user?.id,
//     queryFn: async () => {
//       const token = localStorage.getItem("ACCESS_TOKEN");
//       const res = await axios.get(`${API_BASE}/auth/me`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       return res.data.data;
//     }
//   });

//   // ================================
//   // GET STATEMENT OF ACCOUNT (backend)
//   // ================================
//   const { data: statementData, isLoading } = useQuery({
//     queryKey: ["statement", user?.id, dateFrom, dateTo],
//     enabled: !!user?.id,
//     queryFn: async () => {
//       const token = localStorage.getItem("ACCESS_TOKEN");

//       const res = await axios.get(
//         `${API_BASE}/customer/statement?from=${dateFrom}&to=${dateTo}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       return res.data.data; // transactions + summary
//     }
//   });

//   // ================================
//   // Convert logo to Base64
//   // ================================
//   const convertToBase64 = async (url) => {
//     const res = await fetch(url);
//     const blob = await res.blob();
//     return new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onloadend = () => resolve(reader.result.split(",")[1]);
//       reader.readAsDataURL(blob);
//     });
//   };

//   // ================================
//   // DOWNLOAD STATEMENT
//   // ================================
//   const handleDownload = async () => {
//     if (!statementData || !customer) return;
//     const logoBase64 = await convertToBase64(logoImage);
//     const html = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <title>Statement of Account</title>
//         <style>
//           body { font-family: Arial, sans-serif; padding: 40px; }
//           .header { text-align: right; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px; }
//           .customer-info { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
//           table { width: 100%; border-collapse: collapse; margin: 20px 0; }
//           th { background: #16a34a; color: white; padding: 12px; text-align: left; }
//           td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
//           .totals { margin-top: 30px; text-align: right; }
//           .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px; }
//         </style>
//       </head>

//       <body>
//         <div class="header">
//           <img src="data:image/png;base64,${logoBase64}" style="height: 64px;" />
//           <h1 style="color:#16a34a;margin-bottom:5px;">MAFA Rice Mill Limited</h1>
//           <p>Kano, Nigeria • Phone: +234 904 028 8888 • Email: sales@mafagroup.org</p>
//           <h2>Statement of Account</h2>
//           <p>Period: ${format(new Date(dateFrom), "MMM d, yyyy")} – ${format(new Date(dateTo), "MMM d, yyyy")}</p>
//         </div>

//         <div class="customer-info">
//           <h3>Customer Information</h3>
//           <p><strong>Name:</strong> ${customer.name}</p>
//           <p><strong>Account Number:</strong> ${customer.account_number || "N/A"}</p>
//           <p><strong>Email:</strong> ${customer.email}</p>
//         </div>

//         <table>
//           <thead>
//             <tr>
//               <th>Date</th>
//               <th>Description</th>
//               <th>Reference</th>
//               <th style="text-align:right;">Debit</th>
//               <th style="text-align:right;">Credit</th>
//               <th style="text-align:right;">Balance</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${statementData.transactions
//               .map(
//                 (t) => `
//               <tr>
//                 <td>${format(new Date(t.date), "MMM d, yyyy")}</td>
//                 <td>${t.description}</td>
//                 <td>${t.reference}</td>
//                 <td style="text-align:right;">${t.debit > 0 ? "₦" + t.debit.toLocaleString() : "-"}</td>
//                 <td style="text-align:right;">${t.credit > 0 ? "₦" + t.credit.toLocaleString() : "-"}</td>
//                 <td style="text-align:right;">₦${t.balance.toLocaleString()}</td>
//               </tr>
//             `
//               )
//               .join("")}
//           </tbody>
//         </table>

//         <div class="totals">
//           <div><strong>Opening Balance:</strong> ₦${statementData.summary.openingBalance.toLocaleString()}</div>
//           <div><strong>Total Charges:</strong> ₦${statementData.summary.totalCharges.toLocaleString()}</div>
//           <div><strong>Total Payments:</strong> ₦${statementData.summary.totalPayments.toLocaleString()}</div>
//           <div class="total-row"><strong>Closing Balance:</strong> ₦${statementData.summary.closingBalance.toLocaleString()}</div>
//         </div>

//         <p style="text-align:center;margin-top:40px;color:#666;">
//           Generated on ${format(new Date(), "MMM d, yyyy h:mm a")}
//         </p>
//       </body>
//       </html>
//     `;

//     const blob = new Blob([html], { type: "text/html" });
//     const url = URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `Statement_${customer.account_number}_${format(new Date(), "yyyy-MM-dd")}.html`;
//     a.click();

//     URL.revokeObjectURL(url);

//     toast.success("Statement downloaded!");
//   };

//   // ================================
//   // LOADING STATE
//   // ================================
//   if (loadingProfile || isLoading) {
//     return (
//       <div className="flex justify-center items-center h-96">
//         <Loader2 className="w-10 h-10 animate-spin text-primary" />
//       </div>
//     );
//   }

//   // ================================
//   // UI OUTPUT
//   // ================================
//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold">Statement of Account</h1>
//         <p className="text-muted-foreground">View your account history</p>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>Select Date Range</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="grid md:grid-cols-3 gap-4">
//             <div>
//               <Label>From</Label>
//               <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
//             </div>

//             <div>
//               <Label>To</Label>
//               <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
//             </div>

//             <div className="flex items-end">
//               <Button className="w-full" onClick={handleDownload}>
//                 <Download className="mr-2 w-4 h-4" />
//                 Download Statement
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Customer Info */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Customer Information</CardTitle>
//         </CardHeader>

//         <CardContent>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <p className="text-muted-foreground text-sm">Name</p>
//               <p className="font-medium">{customer.name}</p>
//             </div>
//             <div>
//               <p className="text-muted-foreground text-sm">Account Number</p>
//               <p className="font-medium">{customer.account_number || "N/A"}</p>
//             </div>
//             <div>
//               <p className="text-muted-foreground text-sm">Email</p>
//               <p className="font-medium">{customer.email}</p>
//             </div>
//             {customer.phone && (
//               <div>
//                 <p className="text-muted-foreground text-sm">Phone</p>
//                 <p className="font-medium">{customer.phone}</p>
//               </div>
//             )}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Statement Table */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Transaction History</CardTitle>
//         </CardHeader>

//         <CardContent>
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b">
//                   <th className="p-2 text-left">Date</th>
//                   <th className="p-2 text-left">Description</th>
//                   <th className="p-2 text-left">Reference</th>
//                   <th className="p-2 text-right">Debit</th>
//                   <th className="p-2 text-right">Credit</th>
//                   <th className="p-2 text-right">Balance</th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {statementData.transactions.length === 0 ? (
//                   <tr>
//                     <td colSpan="6" className="text-center py-6 text-muted-foreground">
//                       <FileText className="w-10 h-10 mx-auto opacity-50" />
//                       <p>No transactions found</p>
//                     </td>
//                   </tr>
//                 ) : (
//                   statementData.transactions.map((t, i) => (
//                     <tr key={i} className="border-b">
//                       <td className="p-2">{format(new Date(t.date), "MMM d, yyyy")}</td>
//                       <td className="p-2">{t.description}</td>
//                       <td className="p-2">{t.reference}</td>
//                       <td className="p-2 text-right">{t.debit > 0 ? `₦${t.debit.toLocaleString()}` : "-"}</td>
//                       <td className="p-2 text-right text-success">{t.credit > 0 ? `₦${t.credit.toLocaleString()}` : "-"}</td>
//                       <td className="p-2 text-right font-semibold">₦{t.balance.toLocaleString()}</td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Summary */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Summary</CardTitle>
//         </CardHeader>

//         <CardContent>
//           <div className="space-y-3">
//             <div className="flex justify-between">
//               <span>Opening Balance</span>
//               <strong>₦{statementData.summary.openingBalance.toLocaleString()}</strong>
//             </div>

//             <div className="flex justify-between">
//               <span>Total Charges</span>
//               <strong>₦{statementData.summary.totalCharges.toLocaleString()}</strong>
//             </div>

//             <div className="flex justify-between">
//               <span>Total Payments</span>
//               <strong className="text-success">₦{statementData.summary.totalPayments.toLocaleString()}</strong>
//             </div>

//             <div className="flex justify-between border-t pt-2 text-lg">
//               <span className="font-bold">Closing Balance</span>
//               <span className="font-bold">₦{statementData.summary.closingBalance.toLocaleString()}</span>
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
