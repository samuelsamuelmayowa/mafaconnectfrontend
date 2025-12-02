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

  const convertToBase64 = async (url) => {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
};
const downloadInvoice = async (inv) => {
  const base64Logo = await convertToBase64(logoUrl);
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
          <img src="${base64Logo}" style="height: 60px;" />
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
