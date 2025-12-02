import React from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

import { Loader2, Search, Download } from "lucide-react";
import { format } from "date-fns";

const API_BASE = import.meta.env.VITE_HOME_OO;

export default function CustomerInvoices() {
    const formatSafeDate = (date) => {
      if (!date) return "N/A";
  
      const parsed = new Date(date);
  
      if (isNaN(parsed.getTime())) {
        console.warn("Invalid date received:", date);
        return "N/A";
      }
  
      return format(parsed, "MMM d, yyyy 'at' h:mm a");
    };
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");

  // =============================
  // FETCH INVOICES (React Query)
  // =============================
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["customer-invoices", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const res = await axios.get(`${API_BASE}/customer/invoices`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data?.data || [];
    }
  });

  // =============================
  // FILTER SEARCH
  // =============================
  const filteredInvoices = React.useMemo(() => {
    if (!invoices) return [];
    if (!searchQuery) return invoices;

    const q = searchQuery.toLowerCase();

    return invoices.filter(
      (i) =>
        i.invoice_number.toLowerCase().includes(q) ||
        i.order?.order_number?.toLowerCase().includes(q)
    );
  }, [invoices, searchQuery]);

  // =============================
  // STATUS BADGE COLOR
  // =============================
  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "default";
      case "sent":
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "outline";
    }
  };

  // =============================
  // HTML DOWNLOAD
  // =============================
  // const downloadInvoice = (inv) => {
  //   const html = `
  //     <html>
  //     <head>
  //       <title>${inv.invoice_number}</title>
  //     </head>
  //     <body>
  //       <h1>${inv.invoice_number}</h1>
  //     </body>
  //     </html>
  //   `;

  //   const blob = new Blob([html], { type: "text/html" });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");

  //   a.href = url;
  //   a.download = `${inv.invoice_number}.html`;
  //   a.click();

  //   URL.revokeObjectURL(url);
  // };

  const downloadInvoice = async (inv) => {
  const token = localStorage.getItem("ACCESS_TOKEN");

  const res = await fetch(
    `${API_BASE}/customer/invoice/${inv.invoice_number}/download`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    return alert("Failed to download invoice");
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `${inv.invoice_number}.pdf`;
  a.click();

  window.URL.revokeObjectURL(url);
};


  // =============================
  // LOADING UI
  // =============================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // =============================
  // UI
  // =============================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Invoices</h1>
        <p className="text-muted-foreground">Track your past invoices</p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {filteredInvoices.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No invoices found.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((inv) => (
                // <Card key={inv.id} className="p-4">
                //   <CardHeader>
                //     <div className="flex justify-between items-start">
                //       <div>
                //         <CardTitle>Invoice #{inv.invoice_number}</CardTitle>

                //         <CardDescription>
                //           Order: {inv.order?.order_number} • Issued:{" "}
                //           {formatSafeDate(inv.issue_date)} • Due:{" "}
                //           {formatSafeDate(inv.due_date)}
                //         </CardDescription>
                //       </div>

                //       <Badge variant={getStatusColor(inv.status)}>
                //         {inv.status}
                //       </Badge>
                //     </div>
                //   </CardHeader>

                //   <CardContent>
                //     <div className="space-y-2">
                //       {/* ITEMS */}
                //       {inv.items?.map((item) => (
                //         <div
                //           key={item.id}
                //           className="flex justify-between text-sm"
                //         >
                //           <span>
                //             {item.product_name} (x{item.quantity})
                //           </span>
                //           <span className="font-medium">
                //             ₦{Number(item.total_price).toLocaleString()}
                //           </span>
                //         </div>
                //       ))}

                //       {/* TOTAL */}
                //       <div className="flex justify-between pt-3 border-t font-bold">
                //         <span>Total Amount</span>
                //         <span>₦{Number(inv.total_amount).toLocaleString()}</span>
                //       </div>

                //       {/* NOTES */}
                //       {inv.notes && (
                //         <p className="text-sm text-muted-foreground">
                //           Note: {inv.notes}
                //         </p>
                //       )}

                //       {/* DOWNLOAD BUTTON */}
                //       <Button
                //         variant="outline"
                //         size="sm"
                //         className="w-full mt-3"
                //         onClick={() => downloadInvoice(inv)}
                //       >
                //         <Download className="h-4 w-4 mr-2" />
                //         Download Invoice
                //       </Button>
                //     </div>
                //   </CardContent>
                // </Card>

                <Card key={inv.id} className="p-4">
  <CardHeader>
    <div className="flex justify-between items-start">
      <div>
        <CardTitle>Invoice #{inv.invoice_number}</CardTitle>

        <CardDescription>
          Order: {inv.order?.order_number} • 
          Issued: {formatSafeDate(inv.issue_date)} • 
          Due: {formatSafeDate(inv.due_date)}
        </CardDescription>
      </div>

      <Badge variant={getStatusColor(inv.status)}>
        {inv.status}
      </Badge>
    </div>
  </CardHeader>

  <CardContent>
    <div className="space-y-2">

      {/* ITEMS */}
      {inv.order?.items?.map((item) => (
        <div key={item.id} className="flex justify-between text-sm">
          <span>
            {item.product?.name || item.product_name} (x{item.quantity})
          </span>

          <span className="font-medium">
            ₦{Number(item.total_price).toLocaleString()}
          </span>
        </div>
      ))}

      {/* TOTAL */}
      <div className="flex justify-between pt-3 border-t font-bold">
        <span>Total Amount</span>
        <span>₦{Number(inv.total_amount).toLocaleString()}</span>
      </div>

      {/* NOTES */}
      {inv.notes && (
        <p className="text-sm text-muted-foreground">
          Note: {inv.notes}
        </p>
      )}

      {/* DOWNLOAD */}
      <Button
        variant="outline"
        size="sm"
        className="w-full mt-3"
        onClick={() => downloadInvoice(inv)}
      >
        <Download className="h-4 w-4 mr-2" />
        Download PDF Invoice
      </Button>

    </div>
  </CardContent>
</Card>

              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}




// import React from "react";
// import { useAuth } from "@/hooks/useAuth";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";

// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription
// } from "@/components/ui/Card";
// import { Badge } from "@/components/ui/Badge";
// import { Input } from "@/components/ui/Input";
// import { Button } from "@/components/ui/button";
// import { Loader2, Search, Download } from "lucide-react";
// import { format } from "date-fns";
// import { toast } from "sonner";

// const API_BASE = import.meta.env.VITE_HOME_OO;

// export default function CustomerInvoices() {
//   const { user } = useAuth();
//   const [searchQuery, setSearchQuery] = React.useState("");

//   // ================================
//   // 🔹 Fetch invoices from Node backend
//   // ================================
//   const { data: invoices, isLoading } = useQuery({
//     queryKey: ["customer-invoices", user?.id],
//     enabled: !!user?.id,
//     queryFn: async () => {
//       const res = await axios.get(`${API_BASE}/customer/invoices`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("ACCESS_TOKEN")}`
//         }
//       });
//       return res.data?.data || [];
//     }
//   });
// const formatSafeDate = (date) => {
//     if (!date) return "N/A";

//     const parsed = new Date(date);

//     if (isNaN(parsed.getTime())) {
//       console.warn("Invalid date received:", date);
//       return "N/A";
//     }

//     return format(parsed, "MMM d, yyyy 'at' h:mm a");
//   };

//   // ================================
//   // 🔎 Search filter
//   // ================================
//   const filteredInvoices = React.useMemo(() => {
//     if (!invoices) return [];
//     if (!searchQuery.trim()) return invoices;

//     const q = searchQuery.toLowerCase();

//     return invoices.filter(
//       (i) =>
//         i.invoice_number.toLowerCase().includes(q) ||
//         i.status.toLowerCase().includes(q)
//     );
//   }, [invoices, searchQuery]);

//   // ================================
//   // 🎨 Status badge colors
//   // ================================
//   const getStatusColor = (status) => {
//     switch (status) {
//       case "paid":
//         return "default";
//       case "sent":
//         return "secondary";
//       case "overdue":
//         return "destructive";
//       default:
//         return "outline";
//     }
//   };

//   // ================================
//   // ⬇ Generate & Download Invoice HTML
//   // ================================
//   const downloadInvoice = (inv) => {
//     try {
//       const html = `
//         <html>
//           <head>
//             <title>Invoice ${inv.invoice_number}</title>
//             <style>
//               body { font-family: Arial; padding: 40px; }
//               h1 { color: #16a34a; }
//               table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//               th { background: #16a34a; color: white; padding: 10px; }
//               td { padding: 10px; border-bottom: 1px solid #ccc; }
//               .totals { margin-top: 20px; float: right; text-align: right; }
//               .footer { margin-top: 40px; text-align: center; color: #777; }
//             </style>
//           </head>
//           <body>

//             <h1>Invoice ${inv.invoice_number}</h1>
//             <p><strong>Status:</strong> ${inv.status}</p>
//             <p><strong>Issue Date:</strong> ${format(new Date(inv.issue_date), "MMM d, yyyy")}</p>

//             ${
//               inv.order
//                 ? `<p><strong>Order:</strong> ${inv.order.order_number}</p>`
//                 : ""
//             }

//             <table>
//               <thead>
//                 <tr>
//                   <th>Description</th>
//                   <th>Qty</th>
//                   <th>Unit Price</th>
//                   <th>Total</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 ${inv.items
//                   ?.map(
//                     (item) => `
//                   <tr>
//                     <td>${item.product_name}</td>
//                     <td>${item.quantity}</td>
//                     <td>₦${Number(item.unit_price).toLocaleString()}</td>
//                     <td>₦${Number(item.total_price).toLocaleString()}</td>
//                   </tr>`
//                   )
//                   .join("")}
//               </tbody>
//             </table>

//             <div class="totals">
//               <h3>Total Amount: ₦${Number(inv.total_amount).toLocaleString()}</h3>
//             </div>

//             <div class="footer">
//               <p>Thank you for your purchase!</p>
//             </div>

//           </body>
//         </html>
//       `;

//       const blob = new Blob([html], { type: "text/html" });
//       const url = URL.createObjectURL(blob);

//       const a = document.createElement("a");
//       a.href = url;
//       a.download = `Invoice_${inv.invoice_number}.html`;
//       document.body.appendChild(a);
//       a.click();

//       URL.revokeObjectURL(url);
//       document.body.removeChild(a);

//       toast.success("Invoice downloaded.");
//     } catch (err) {
//       toast.error("Failed to download invoice");
//     }
//   };

//   // ================================
//   // LOADING SCREEN
//   // ================================
//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <Loader2 className="h-12 w-12 animate-spin text-primary" />
//       </div>
//     );
//   }

//   // ================================
//   // UI RENDER
//   // ================================
//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold">My Invoices</h1>
//         <p className="text-muted-foreground">View and manage your invoices</p>
//       </div>

//       <Card>
//         <CardHeader>
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//             <Input
//               placeholder="Search invoices..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10"
//             />
//           </div>
//         </CardHeader>

//         <CardContent>
//           {filteredInvoices?.length > 0 ? (
//             <div className="space-y-4">
//               {filteredInvoices.map((inv) => (
//                 <Card key={inv.id}>
//                   <CardHeader>
//                     <div className="flex items-start justify-between">
//                       <div>
//                         <CardTitle>Invoice #{inv.invoice_number}</CardTitle>

//                         <CardDescription>
//                           Issued:{" "}
//                           {/* {format(new Date(inv.issue_date), "MMM d, yyyy")}  */}
//                           •
//                           {formatSafeDate(inv.issue_date)}
//                           Total: ₦{Number(inv.total_amount).toLocaleString()}
//                         </CardDescription>
//                       </div>

//                       <Badge variant={getStatusColor(inv.status)}>
//                         {inv.status}
//                       </Badge>
//                     </div>
//                   </CardHeader>

//                   <CardContent>
//                     <div className="space-y-2">
//                       {inv.items?.map((item) => (
//                         <div
//                           key={item.id}
//                           className="flex justify-between text-sm"
//                         >
//                           <span>
//                             {item.product_name} (x{item.quantity})
//                           </span>
//                           <span>
//                             ₦{Number(item.total_price).toLocaleString()}
//                           </span>
//                         </div>
//                       ))}

//                       <div className="pt-3 border-t">
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           className="w-full"
//                           onClick={() => downloadInvoice(inv)}
//                         >
//                           <Download className="h-4 w-4 mr-2" />
//                           Download Invoice
//                         </Button>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           ) : (
//             <p className="text-center text-muted-foreground py-8">
//               No invoices found.
//             </p>
//           )}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// // import React from "react";
// // import { useAuth } from "@/hookss/useAuth";
// // import { useQuery } from "@tanstack/react-query";
// // import { supabase } from "@/integrations/supabase/client";
// // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
// // import { Badge } from "@/components/uimain/Badge";
// // import { Input } from "@/components/uimain/Input";
// // import { Button } from "@/components/uimain/button";
// // import { Loader2, Search, Download } from "lucide-react";
// // import { format } from "date-fns";
// // import { toast } from "sonner";

// // export default function CustomerInvoices() {
// //   const { user } = useAuth();
// //   const [searchQuery, setSearchQuery] = React.useState("");

// //   const { data: invoices, isLoading } = useQuery({
// //     queryKey: ["customer-invoices", user?.id],
// //     queryFn: async () => {
// //       const { data, error } = await supabase
// //         .from("invoices")
// //         .select(`
// //           *,
// //           invoice_items(
// //             *,
// //             products(name)
// //           ),
// //           sales(
// //             customer_orders(
// //               order_number,
// //               id
// //             )
// //           )
// //         `)
// //         .eq("customer_id", user?.id)
// //         .order("created_at", { ascending: false });
// //       if (error) throw error;
// //       return data;
// //     },
// //     enabled: !!user?.id,
// //   });

// //   const filteredInvoices = React.useMemo(() => {
// //     if (!invoices) return [];
// //     if (!searchQuery) return invoices;

// //     return invoices.filter((invoice) => {
// //       const searchLower = searchQuery.toLowerCase();
// //       return (
// //         invoice.invoice_number.toLowerCase().includes(searchLower) ||
// //         invoice.status.toLowerCase().includes(searchLower)
// //       );
// //     });
// //   }, [invoices, searchQuery]);

// //   const getStatusColor = (status) => {
// //     switch (status) {
// //       case "paid":
// //         return "default";
// //       case "sent":
// //         return "secondary";
// //       case "overdue":
// //         return "destructive";
// //       default:
// //         return "outline";
// //     }
// //   };

// //   const downloadInvoice = async (invoice) => {
// //     try {
// //       // Fetch store settings for business details
// //       const { data: storeSettings } = await supabase
// //         .from("store_settings")
// //         .select("*")
// //         .in("setting_key", ["business_name", "business_address", "business_phone", "business_email"]);

// //       const settings = {};
// //       storeSettings?.forEach(s => {
// //         settings[s.setting_key] = s.setting_value;
// //       });

// //       const businessName = settings.business_name || "MAFA Connect";
// //       const businessAddress = settings.business_address || "";
// //       const businessPhone = settings.business_phone || "";
// //       const businessEmail = settings.business_email || "";

// //       // Generate invoice HTML
// //       const invoiceHTML = `
// //         <!DOCTYPE html>
// //         <html>
// //         <head>
// //           <meta charset="UTF-8">
// //           <title>Invoice ${invoice.invoice_number}</title>
// //           <style>
// //             body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
// //             .invoice-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px; }
// //             .invoice-header h1 { margin: 0; color: #16a34a; }
// //             .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
// //             .invoice-info div { flex: 1; }
// //             .invoice-details { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
// //             table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
// //             th { background: #16a34a; color: white; padding: 12px; text-align: left; }
// //             td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
// //             .totals { margin-left: auto; width: 300px; }
// //             .totals div { display: flex; justify-content: space-between; padding: 8px 0; }
// //             .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px; }
// //             .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
// //             .status-paid { background: #dcfce7; color: #166534; }
// //             .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 14px; }
// //           </style>
// //         </head>
// //         <body>
// //           <div class="invoice-header">
// //             <h1>${businessName}</h1>
// //             <p>${businessAddress}</p>
// //             <p>Phone: ${businessPhone} | Email: ${businessEmail}</p>
// //           </div>

// //           <div class="invoice-info">
// //             <div>
// //               <h3>Invoice To:</h3>
// //               <p><strong>Customer ID:</strong> ${invoice.customer_id}</p>
// //               ${invoice.sales?.customer_orders?.[0] ? `<p><strong>Order:</strong> ${invoice.sales.customer_orders[0].order_number}</p>` : ''}
// //             </div>
// //             <div style="text-align: right;">
// //               <h2>INVOICE</h2>
// //               <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
// //               <p><strong>Issue Date:</strong> ${format(new Date(invoice.issue_date), "MMM d, yyyy")}</p>
// //               <p><strong>Due Date:</strong> ${format(new Date(invoice.due_date), "MMM d, yyyy")}</p>
// //               <span class="status-badge status-paid">${invoice.status.toUpperCase()}</span>
// //             </div>
// //           </div>

// //           <table>
// //             <thead>
// //               <tr>
// //                 <th>Description</th>
// //                 <th style="text-align: center;">Quantity</th>
// //                 <th style="text-align: right;">Unit Price</th>
// //                 <th style="text-align: right;">Total</th>
// //               </tr>
// //             </thead>
// //             <tbody>
// //               ${invoice.invoice_items?.map((item) => `
// //                 <tr>
// //                   <td>${item.description || item.products?.name}</td>
// //                   <td style="text-align: center;">${item.quantity}</td>
// //                   <td style="text-align: right;">₦${Number(item.unit_price).toLocaleString()}</td>
// //                   <td style="text-align: right;">₦${Number(item.line_total).toLocaleString()}</td>
// //                 </tr>
// //               `).join('')}
// //             </tbody>
// //           </table>

// //           <div class="totals">
// //             <div>
// //               <span>Subtotal:</span>
// //               <span>₦${Number(invoice.total_amount - invoice.tax_amount + invoice.discount_amount).toLocaleString()}</span>
// //             </div>
// //             ${invoice.discount_amount > 0 ? `
// //             <div>
// //               <span>Discount:</span>
// //               <span>-₦${Number(invoice.discount_amount).toLocaleString()}</span>
// //             </div>
// //             ` : ''}
// //             ${invoice.tax_amount > 0 ? `
// //             <div>
// //               <span>Tax:</span>
// //               <span>₦${Number(invoice.tax_amount).toLocaleString()}</span>
// //             </div>
// //             ` : ''}
// //             <div class="total-row">
// //               <span>TOTAL:</span>
// //               <span>₦${Number(invoice.total_amount).toLocaleString()}</span>
// //             </div>
// //           </div>

// //           ${invoice.notes ? `<div class="invoice-details"><strong>Notes:</strong> ${invoice.notes}</div>` : ''}

// //           <div class="footer">
// //             <p>Thank you for your business!</p>
// //             <p>Generated on ${format(new Date(), "MMM d, yyyy 'at' h:mm a")}</p>
// //           </div>
// //         </body>
// //         </html>
// //       `;

// //       // Create blob and download
// //       const blob = new Blob([invoiceHTML], { type: 'text/html' });
// //       const url = window.URL.createObjectURL(blob);
// //       const link = document.createElement('a');
// //       link.href = url;
// //       link.download = `Invoice_${invoice.invoice_number}.html`;
// //       document.body.appendChild(link);
// //       link.click();
// //       document.body.removeChild(link);
// //       window.URL.revokeObjectURL(url);

// //       toast.success("Invoice downloaded successfully! Open the file and print/save");
// //     } catch (error) {
// //       console.error("Error downloading invoice:", error);
// //       toast.error("Failed to download invoice");
// //     }
// //   };

// //   if (isLoading) {
// //     return (
// //       <div className="flex items-center justify-center h-96">
// //         <Loader2 className="h-12 w-12 animate-spin text-primary" />
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="space-y-6">
// //       <div>
// //         <h1 className="text-3xl font-bold">My Invoices</h1>
// //         <p className="text-muted-foreground">View and manage your invoices</p>
// //       </div>

// //       <Card>
// //         <CardHeader>
// //           <div className="flex items-center gap-4">
// //             <div className="relative flex-1">
// //               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
// //               <Input
// //                 placeholder="Search invoices..."
// //                 value={searchQuery}
// //                 onChange={(e) => setSearchQuery(e.target.value)}
// //                 className="pl-10"
// //               />
// //             </div>
// //           </div>
// //         </CardHeader>
// //         <CardContent>
// //           {filteredInvoices.length > 0 ? (
// //             <div className="space-y-4">
// //               {filteredInvoices.map((invoice) => (
// //                 <Card key={invoice.id}>
// //                   <CardHeader>
// //                     <div className="flex items-start justify-between">
// //                       <div>
// //                         <CardTitle className="text-base">
// //                           Invoice #{invoice.invoice_number}
// //                         </CardTitle>
// //                         <CardDescription>
// //                           {invoice.sales?.customer_orders?.[0] && (
// //                             <>
// //                               Order: {invoice.sales.customer_orders[0].order_number}
// //                               {" • "}
// //                             </>
// //                           )}
// //                           Issued: {format(new Date(invoice.issue_date), "MMM d, yyyy")}
// //                           {" • "}
// //                           Due: {format(new Date(invoice.due_date), "MMM d, yyyy")}
// //                         </CardDescription>
// //                       </div>
// //                       <Badge variant={getStatusColor(invoice.status)}>
// //                         {invoice.status}
// //                       </Badge>
// //                     </div>
// //                   </CardHeader>
// //                   <CardContent>
// //                     <div className="space-y-2">
// //                       {invoice.invoice_items?.map((item) => (
// //                         <div key={item.id} className="flex justify-between text-sm">
// //                           <span>
// //                             {item.description || item.products?.name} (x{item.quantity})
// //                           </span>
// //                           <span className="font-medium">
// //                             ₦{Number(item.line_total).toLocaleString()}
// //                           </span>
// //                         </div>
// //                       ))}
// //                       {invoice.discount_amount > 0 && (
// //                         <div className="flex justify-between text-sm text-muted-foreground">
// //                           <span>Discount</span>
// //                           <span>-₦{Number(invoice.discount_amount).toLocaleString()}</span>
// //                         </div>
// //                       )}
// //                       {invoice.tax_amount > 0 && (
// //                         <div className="flex justify-between text-sm text-muted-foreground">
// //                           <span>Tax</span>
// //                           <span>₦{Number(invoice.tax_amount).toLocaleString()}</span>
// //                         </div>
// //                       )}
// //                       <div className="flex justify-between pt-2 border-t font-bold">
// //                         <span>Total Amount</span>
// //                         <span>₦{Number(invoice.total_amount).toLocaleString()}</span>
// //                       </div>
// //                       {invoice.notes && (
// //                         <p className="text-sm text-muted-foreground pt-2">
// //                           Note: {invoice.notes}
// //                         </p>
// //                       )}
// //                       <div className="pt-2">
// //                         <Button 
// //                           variant="outline" 
// //                           size="sm" 
// //                           className="w-full"
// //                           onClick={() => downloadInvoice(invoice)}
// //                         >
// //                           <Download className="h-4 w-4 mr-2" />
// //                           Download Invoice
// //                         </Button>
// //                       </div>
// //                     </div>
// //                   </CardContent>
// //                 </Card>
// //               ))}
// //             </div>
// //           ) : (
// //             <p className="text-center text-muted-foreground py-8">
// //               {searchQuery ? "No invoices found matching your search" : "No invoices yet"}
// //             </p>
// //           )}
// //         </CardContent>
// //       </Card>
// //     </div>
// //   );
// // }


















import React from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

import { Loader2, Search, Download } from "lucide-react";
import { format } from "date-fns";
import  logoUrl from "../assets/mafa-logo.png"
const API_BASE = import.meta.env.VITE_HOME_OO;

export default function CustomerInvoices() {
  console.log(logoUrl)
  const formatSafeDate = (date) => {
    if (!date) return "N/A";

    const parsed = new Date(date);

    if (isNaN(parsed.getTime())) {
      console.warn("Invalid date received:", date);
      return "N/A";
    }

    return format(parsed, "MMM d, yyyy 'at' h:mm a");
  };
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = React.useState("");

  // =============================
  // FETCH INVOICES (React Query)
  // =============================
  const { data: invoices, isLoading } = useQuery({
    queryKey: ["customer-invoices", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const res = await axios.get(`${API_BASE}/customer/invoices`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data?.data || [];
    },
  });

  // =============================
  // FILTER SEARCH
  // =============================
  const filteredInvoices = React.useMemo(() => {
    if (!invoices) return [];
    if (!searchQuery) return invoices;

    const q = searchQuery.toLowerCase();

    return invoices.filter(
      (i) =>
        i.invoice_number.toLowerCase().includes(q) ||
        i.order?.order_number?.toLowerCase().includes(q)
    );
  }, [invoices, searchQuery]);

  // =============================
  // STATUS BADGE COLOR
  // =============================
  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "default";
      case "sent":
        return "secondary";
      case "overdue":
        return "destructive";
      default:
        return "outline";
    }
  };

  // =============================
  // HTML DOWNLOAD
  // =============================
  // const downloadInvoice = (inv) => {
  //   const html = `
  //     <html>
  //     <head>
  //       <title>${inv.invoice_number}</title>
  //     </head>
  //     <body>
  //       <h1>${inv.invoice_number}</h1>
  //     </body>
  //     </html>
  //   `;

  //   const blob = new Blob([html], { type: "text/html" });
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement("a");

  //   a.href = url;
  //   a.download = `${inv.invoice_number}.html`;
  //   a.click();

  //   URL.revokeObjectURL(url);
  // };

  // const downloadInvoice = async (inv) => {
  //   const token = localStorage.getItem("ACCESS_TOKEN");

  //   const res = await fetch(
  //     `${API_BASE}/customer/invoice/${inv.invoice_number}/download`,
  //     {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     }
  //   );

  //   if (!res.ok) {
  //     return alert("Failed to download invoice");
  //   }

  //   const blob = await res.blob();
  //   const url = window.URL.createObjectURL(blob);

  //   const a = document.createElement("a");
  //   a.href = url;
  //   a.download = `${inv.invoice_number}.pdf`;
  //   a.click();

  //   window.URL.revokeObjectURL(url);
  // };
// const downloadInvoice = async (inv) => {
//   try {
//     const token = localStorage.getItem("ACCESS_TOKEN");

//     // 1️⃣ Fetch invoice full data from backend
//     const res = await axios.get(
      
//         `${API_BASE}/customer/invoice/${inv.invoice_number}`,

//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     const invoice = res.data.data;
//     console.log("INVOICE RECEIVED >>>", invoice);

//     if (!invoice) return alert("Invoice details not found");


//     const businessName =
//      "MAFA Rice Mill Limited";
//     const businessAddress =
     
//       "Km 11 Hadejia Road Gunduwawa Industrial Estate, Kano, Nigeria";
//     const businessPhone =  "+234 904 028 8888";
//     const businessEmail = "sales@mafagroup.org";
//     const logoUrl =  "/assets/mafa-logo.png";

//     // 3️⃣ Fetch customer profile
//     const profileRes = await axios.get(
//       // `${API_BASE}/customers/${invoice.customer_id}/profile`,
//        `${API_BASE}/auth/me`,
//       {
//         headers: { Authorization: `Bearer ${token}` },
//       }
//     );

//     const customer = profileRes.data.data || {};
//     const customerName = customer.name || "Customer";
//     const customerAccount = customer.account_number || "N/A";

//     // ================================
//     // 4️⃣ BUILD INVOICE HTML DOCUMENT
//     // ================================

//     const invoiceHTML = `
//       <!DOCTYPE html>
//       <html>
//       <head>
//         <meta charset="UTF-8">
//         <title>Invoice ${invoice.invoice_number}</title>
//         <style>
//           body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
//           .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px; }
//           .invoice-header h1 { margin: 0; color: #16a34a; }
//           .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
//           .invoice-info div { flex: 1; }
//           .invoice-details { background: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
//           table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
//           th { background: #16a34a; color: white; padding: 12px; text-align: left; }
//           td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
//           .totals { margin-left: auto; width: 300px; }
//           .totals div { display: flex; justify-content: space-between; padding: 8px 0; }
//           .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 10px; }
//           .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; }
//           .status-paid { background: #dcfce7; color: #166534; }
//           .footer { margin-top: 40px; text-align: center; color: #6b7280; font-size: 14px; }
//         </style>
//       </head>

//       <body>
//         <div class="invoice-header">
//           <img src="${logoUrl}" style="height: 60px;" />
//           <div style="text-align: right;">
//             <h1>${businessName}</h1>
//             <p>${businessAddress}</p>
//             <p>Phone: ${businessPhone} • Email: ${businessEmail}</p>
//           </div>
//         </div>

//         <div class="invoice-info">
//           <div>
//             <h3>Invoice To:</h3>
//             <p><strong>Account:</strong> ${customerAccount}</p>
//             <p><strong>Name:</strong> ${customerName}</p>
//           </div>

//           <div style="text-align: right;">
//             <h2>INVOICE</h2>
//             <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
//             <p><strong>Date Issued:</strong> ${format(new Date(invoice.issue_date), "MMM d, yyyy")}</p>
//             <p><strong>Due Date:</strong> ${format(new Date(invoice.due_date), "MMM d, yyyy")}</p>
//             <span class="status-badge status-paid">${(invoice.status || "").toUpperCase()}}</span>
//           </div>
//         </div>

//         <table>
//           <thead>
//             <tr>
//               <th>Description</th>
//               <th style="text-align:center;">Qty</th>
//               <th style="text-align:right;">Unit Price</th>
//               <th style="text-align:right;">Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${invoice.items
//               ?.map(
//                 (item) => `
//               <tr>
//                 <td>${item.description || item.product?.name}</td>
//                 <td style="text-align:center;">${item.quantity}</td>
//                 <td style="text-align:right;">₦${Number(item.unit_price).toLocaleString()}</td>
//                 <td style="text-align:right;">₦${Number(item.line_total).toLocaleString()}</td>
//               </tr>
//             `
//               )
//               .join("")}
//           </tbody>
//         </table>

//         <div class="totals">
//           <div><span>Subtotal:</span><span>₦${Number(invoice.subtotal).toLocaleString()}</span></div>
//           <div class="total-row"><span>Total:</span><span>₦${Number(invoice.total_amount).toLocaleString()}</span></div>
//         </div>

//         <div class="footer">
//           <p>Thank you for your business!</p>
//           <p>Generated on ${format(new Date(), "MMM d, yyyy h:mm a")}</p>
//         </div>
//       </body>
//       </html>
//     `;

//     // 5️⃣ Convert HTML to downloadable file
//     const blob = new Blob([invoiceHTML], { type: "text/html" });
//     const url = window.URL.createObjectURL(blob);

//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `Invoice_${invoice.invoice_number}.html`;
//     a.click();

//     window.URL.revokeObjectURL(url);
//   } catch (err) {
//     console.error(err);
//     alert("Failed to download invoice");
//   }
// };
const downloadInvoice = async (inv) => {
  try {
    const token = localStorage.getItem("ACCESS_TOKEN");

    // 1️⃣ Fetch invoice details (JSON)
    const res = await axios.get(
      `${API_BASE}/customer/invoice/${inv.invoice_number}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const invoice = res.data.data;
    console.log("INVOICE RECEIVED >>>", invoice);

    if (!invoice) return alert("Invoice details not found");

    // 2️⃣ Default business info
    const businessName = "MAFA Rice Mill Limited";
    const businessAddress =
      "Km 11 Hadejia Road Gunduwawa Industrial Estate, Kano, Nigeria";
    const businessPhone = "+234 904 028 8888";
    const businessEmail = "sales@mafagroup.org";
    // const logoUrl = myimage

    // 3️⃣ Fetch logged in customer profile
    const profileRes = await axios.get(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const customer = profileRes.data.data || {};
    const customerName = customer.name || "Customer";
    const customerAccount = customer.account_number || "N/A";

    // 4️⃣ Extract items properly
    const items =
      invoice.invoice_items ||
      invoice.items ||
      invoice.order?.items ||
      invoice.order?.order_items ||
      [];

    // 5️⃣ Safe date formatting
    const issuedDate = invoice.issue_date
      ? format(new Date(invoice.issue_date), "MMM d, yyyy")
      : "N/A";

    const dueDate = invoice.due_date
      ? format(new Date(invoice.due_date), "MMM d, yyyy")
      : "N/A";

    // 6️⃣ Subtotal fallback
    const subtotal = invoice.subtotal || invoice.total_amount;

    // 7️⃣ Invoice HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice ${invoice.invoice_number}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
          .invoice-header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #16a34a; padding-bottom: 20px; }
          .invoice-header h1 { margin: 0; color: #16a34a; }
          .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { background: #16a34a; color: white; padding: 12px; text-align: left; }
          td { padding: 10px; border-bottom: 1px solid #e5e7eb; }
          .totals { margin-left: auto; width: 300px; }
          .totals div { display: flex; justify-content: space-between; padding: 8px 0; }
          .total-row { font-weight: bold; border-top: 2px solid #333; padding-top: 10px; }
          .footer { margin-top: 40px; text-align: center; color: #6b7280; }
          .status-badge { padding: 4px 12px; border-radius: 12px; font-weight: bold; }
          .status-paid { background: #dcfce7; color: #166534; }
        </style>
      </head>

      <body>

        <div class="invoice-header">
          <img src="${{logoUrl}}" style="height: 60px;" />
          <div style="text-align: right;">
            <h1>${businessName}</h1>
            <p>${businessAddress}</p>
            <p>Phone: ${businessPhone} • Email: ${businessEmail}</p>
          </div>
        </div>

        <div class="invoice-info">
          <div>
            <h3>Invoice To:</h3>
            <p><strong>Account:</strong> ${customerAccount}</p>
            <p><strong>Name:</strong> ${customerName}</p>
          </div>

          <div style="text-align: right;">
            <h2>INVOICE</h2>
            <p><strong>Invoice #:</strong> ${invoice.invoice_number}</p>
            <p><strong>Date Issued:</strong> ${issuedDate}</p>
            <p><strong>Due Date:</strong> ${dueDate}</p>
            <span class="status-badge status-paid">
              ${(invoice.status || "paid").toUpperCase()}
            </span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align:center;">Qty</th>
              <th style="text-align:right;">Unit Price</th>
              <th style="text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item) => `
                  <tr>
                    <td>${item.description || item.product?.name || "Item"}</td>
                    <td style="text-align:center;">${item.quantity}</td>
                    <td style="text-align:right;">₦${Number(item.unit_price).toLocaleString()}</td>
                    <td style="text-align:right;">₦${Number(item.line_total).toLocaleString()}</td>
                  </tr>
                `
              )
              .join("")}
          </tbody>
        </table>

        <div class="totals">
          <div><span>Subtotal:</span><span>₦${Number(subtotal).toLocaleString()}</span></div>
          <div class="total-row"><span>Total:</span><span>₦${Number(invoice.total_amount).toLocaleString()}</span></div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Generated on ${format(new Date(), "MMM d, yyyy h:mm a")}</p>
        </div>

      </body>
      </html>
    `;

    // 8️⃣ Download HTML file
    const blob = new Blob([invoiceHTML], { type: "text/html" });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Invoice_${invoice.invoice_number}.html`;
    a.click();

    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error(err);
    alert("Failed to download invoice");
  }
};

  // =============================
  // LOADING UI
  // =============================
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // =============================
  // UI
  // =============================
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">My Invoices</h1>
        <p className="text-muted-foreground">Track your past invoices</p>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent>
          {filteredInvoices.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No invoices found.
            </p>
          ) : (
            <div className="space-y-4">
              {filteredInvoices.map((inv) => (
                <Card key={inv.id} className="p-4">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>Invoice #{inv.invoice_number}</CardTitle>

                        <CardDescription>
                          Order: {inv.order?.order_number} • Issued:{" "}
                          {formatSafeDate(inv.issue_date)} • Due:{" "}
                          {formatSafeDate(inv.due_date)}
                        </CardDescription>
                      </div>

                      <Badge variant={getStatusColor(inv.status)}>
                        {inv.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-2">
                      {/* ITEMS */}
                      {inv.order?.items?.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item.product?.name || item.product_name} (x
                            {item.quantity})
                          </span>

                          <span className="font-medium">
                            ₦{Number(item.total_price).toLocaleString()}
                          </span>
                        </div>
                      ))}

                      {/* TOTAL */}
                      <div className="flex justify-between pt-3 border-t font-bold">
                        <span>Total Amount</span>
                        <span>
                          ₦{Number(inv.total_amount).toLocaleString()}
                        </span>
                      </div>

                      {/* NOTES */}
                      {inv.notes && (
                        <p className="text-sm text-muted-foreground">
                          Note: {inv.notes}
                        </p>
                      )}

                      {/* DOWNLOAD */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => downloadInvoice(inv)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF Invoice
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
