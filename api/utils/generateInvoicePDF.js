const PDFDocument = require("pdfkit");

const fs = require("fs");
const path = require("path");

// Ensure invoices folder exists
const invoicesDir = path.join(__dirname, "..", "invoices");

if (!fs.existsSync(invoicesDir)) {
  fs.mkdirSync(invoicesDir, { recursive: true });
}
function generateInvoicePDF(invoice, res) {
  const doc = new PDFDocument({ margin: 40 });

  // STREAM PDF TO RESPONSE
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${invoice.invoice_number}.pdf`
  );
  doc.pipe(res);

  // ----------------------------------------------------
  // HEADER — COMPANY DETAILS
  // ----------------------------------------------------
  doc
    .fontSize(20)
    .text("MAFA Rice Mill Limited", { align: "left", bold: true });
  doc.moveDown(0.3);

  doc
    .fontSize(10)
    .text(
      "Local Government, Off km 11 Hadejia Road Gunduwawa Industrial Estate, Kano, Nigeria"
    );
  doc.text("Phone: +234 904 028 8888 | Email: sales@mafagroup.org");
  doc.moveDown(1);

  // Horizontal line
  doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();

  doc.moveDown(1);

  // ----------------------------------------------------
  // CUSTOMER + INVOICE INFO
  // ----------------------------------------------------
  doc.fontSize(12).text("Invoice To:", { bold: true });
  doc.text(`Customer ID: ${invoice.customer_id}`);
  doc.text(`Order: ${invoice.order?.order_number}`);
  doc.moveDown(1);

  doc.fontSize(20).text("INVOICE", { align: "right" });
  doc.moveDown(0.5);

  doc.fontSize(12);
  doc.text(`Invoice #: ${invoice.invoice_number}`);
  doc.text(`Issue Date: ${invoice.issue_date}`);
  doc.text(`Due Date: ${invoice.due_date}`);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, { bold: true });
  doc.moveDown(1);

  // ----------------------------------------------------
  // TABLE HEADER
  // ----------------------------------------------------
  doc.fontSize(12).text("Description", 40, doc.y, { underline: true });
  doc.text("Quantity", 250, doc.y - 15, { underline: true });
  doc.text("Unit Price", 330, doc.y - 15, { underline: true });
  doc.text("Total", 430, doc.y - 15, { underline: true });

  doc.moveDown(1);

  // ----------------------------------------------------
  // ITEMS LOOP
  // ----------------------------------------------------
//   invoice.items.forEach((item) => {
//     doc.text(item.product?.name || "Product", 40);
//     doc.text(item.quantity, 260);
//     doc.text(`₦${Number(item.unit_price).toLocaleString()}`, 330);
//     doc.text(`₦${Number(item.total_price).toLocaleString()}`, 430);
//     doc.moveDown(0.5);
//   });

// ITEMS LOOP
invoice.order.items.forEach((item) => {
  doc.text(item.product?.name || "Product", 40);
  doc.text(item.quantity, 260);
  doc.text(`₦${Number(item.unit_price).toLocaleString()}`, 330);
  doc.text(`₦${Number(item.total_price).toLocaleString()}`, 430);
  doc.moveDown(0.5);
});

  doc.moveDown(1);

  // ----------------------------------------------------
  // TOTALS
  // ----------------------------------------------------
  doc.fontSize(12).text(`Subtotal: ₦${Number(invoice.subtotal).toLocaleString()}`, {
    align: "right",
  });

  doc.fontSize(14).text(`TOTAL: ₦${Number(invoice.total_amount).toLocaleString()}`, {
    align: "right",
    bold: true,
  });

  doc.moveDown(1);

  // ----------------------------------------------------
  // NOTES
  // ----------------------------------------------------
  if (invoice.notes) {
    doc.fontSize(11).text(`Notes: ${invoice.notes}`);
  }

  // END PDF
  doc.end();
}

module.exports = { generateInvoicePDF };
